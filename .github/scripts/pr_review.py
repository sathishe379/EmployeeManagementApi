"""
Automated C# PR Code Review using Azure OpenAI.
Posts inline review comments on GitHub PRs via the GitHub Review API.

Environment variables required:
  GITHUB_TOKEN       - GitHub Actions token (automatic)
  GITHUB_REPOSITORY  - owner/repo (automatic)
  PR_NUMBER          - pull request number (set in workflow)
  AOAI_ENDPOINT      - Azure OpenAI endpoint URL
  AOAI_API_KEY       - Azure OpenAI API key
  AOAI_DEPLOYMENT    - Model deployment name (e.g. gpt-4.1-mini)
"""

import os
import sys
import json
import requests

# --------------------------------------------------------------------------- #
# Configuration                                                                #
# --------------------------------------------------------------------------- #

GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
GITHUB_REPO = os.environ["GITHUB_REPOSITORY"]
PR_NUMBER = os.environ["PR_NUMBER"]
AOAI_ENDPOINT = os.environ["AOAI_ENDPOINT"].rstrip("/")
AOAI_API_KEY = os.environ["AOAI_API_KEY"]
AOAI_DEPLOYMENT = os.environ["AOAI_DEPLOYMENT"]

GITHUB_API = "https://api.github.com"
GITHUB_HEADERS = {
    "Authorization": "Bearer " + GITHUB_TOKEN,
    "Accept": "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

AOAI_URL = f"{AOAI_ENDPOINT}/openai/deployments/{AOAI_DEPLOYMENT}/chat/completions?api-version=2024-02-01"
AOAI_HEADERS = {
    "api-key": AOAI_API_KEY,
    "Content-Type": "application/json",
}

# Only review these file types
REVIEW_EXTENSIONS = {".cs", ".csproj", ".sln", ".razor", ".cshtml"}

# Max characters of diff to send per file (avoid token limits)
MAX_DIFF_CHARS = 8000

REVIEW_PROMPT = """You are a senior C# .NET code reviewer. Review the following git diff for a C# file.

Focus ONLY on real issues:
- Bugs or logic errors
- Security vulnerabilities (SQL injection, XSS, hardcoded secrets, etc.)
- Null reference risks or unhandled exceptions
- Performance problems (N+1 queries, unnecessary allocations, etc.)
- Incorrect async/await usage
- Resource leaks (undisposed IDisposable objects)
- Thread-safety issues

Do NOT comment on:
- Code style or formatting
- Naming conventions
- Missing documentation
- Minor refactoring suggestions

Respond ONLY as a JSON array. Each element must have:
  "line": the line number in the new file (integer, from the diff)
  "severity": "bug" | "security" | "performance" | "warning"
  "comment": a concise, actionable comment (1-2 sentences max)

If there are no real issues, return an empty array: []

Diff:
"""


# --------------------------------------------------------------------------- #
# GitHub helpers                                                               #
# --------------------------------------------------------------------------- #

def get_pr_files():
    """Returns list of changed files with their patches (diffs)."""
    url = f"{GITHUB_API}/repos/{GITHUB_REPO}/pulls/{PR_NUMBER}/files"
    resp = requests.get(url, headers=GITHUB_HEADERS, timeout=30)
    resp.raise_for_status()
    return resp.json()


def get_pr_head_sha():
    """Returns the head commit SHA of the PR."""
    url = f"{GITHUB_API}/repos/{GITHUB_REPO}/pulls/{PR_NUMBER}"
    resp = requests.get(url, headers=GITHUB_HEADERS, timeout=30)
    resp.raise_for_status()
    return resp.json()["head"]["sha"]


def post_review(commit_sha, review_comments):
    """Posts a review with inline comments to the PR."""
    url = f"{GITHUB_API}/repos/{GITHUB_REPO}/pulls/{PR_NUMBER}/reviews"
    body = {
        "commit_id": commit_sha,
        "event": "COMMENT",
        "body": "**AI Code Review** (Azure OpenAI) — see inline comments below.",
        "comments": review_comments,
    }
    resp = requests.post(url, headers=GITHUB_HEADERS, json=body, timeout=30)
    resp.raise_for_status()
    return resp.json()


# --------------------------------------------------------------------------- #
# Azure OpenAI helpers                                                         #
# --------------------------------------------------------------------------- #

def review_diff(filename, diff):
    """Sends the diff to Azure OpenAI and returns a list of comment dicts."""
    truncated_diff = diff[:MAX_DIFF_CHARS]
    payload = {
        "messages": [
            {
                "role": "user",
                "content": REVIEW_PROMPT + truncated_diff,
            }
        ],
        "temperature": 0.2,
        "max_tokens": 1024,
    }
    resp = requests.post(AOAI_URL, headers=AOAI_HEADERS, json=payload, timeout=60)
    resp.raise_for_status()

    raw = resp.json()["choices"][0]["message"]["content"].strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        lines = raw.splitlines()
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        items = json.loads(raw)
    except json.JSONDecodeError:
        print(f"  [warn] Could not parse AI response for {filename}: {raw[:200]}")
        return []

    if not isinstance(items, list):
        return []

    return items


# --------------------------------------------------------------------------- #
# Main                                                                         #
# --------------------------------------------------------------------------- #

def main():
    print(f"Reviewing PR #{PR_NUMBER} in {GITHUB_REPO} ...")

    files = get_pr_files()
    commit_sha = get_pr_head_sha()

    review_comments = []

    for file_info in files:
        filename = file_info.get("filename", "")
        status = file_info.get("status", "")
        patch = file_info.get("patch", "")

        # Skip deleted files and files without a diff
        if status == "removed" or not patch:
            continue

        ext = os.path.splitext(filename)[1].lower()
        if ext not in REVIEW_EXTENSIONS:
            continue

        print(f"  Reviewing {filename} ...")
        issues = review_diff(filename, patch)

        for issue in issues:
            line = issue.get("line")
            comment_text = issue.get("comment", "").strip()
            severity = issue.get("severity", "warning")

            if not line or not comment_text:
                continue

            review_comments.append(
                {
                    "path": filename,
                    "line": int(line),
                    "side": "RIGHT",
                    "body": f"**[{severity.upper()}]** {comment_text}",
                }
            )

    if review_comments:
        print(f"Posting {len(review_comments)} inline comment(s) ...")
        post_review(commit_sha, review_comments)
        print("Done.")
    else:
        print("No issues found — no review comments posted.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
