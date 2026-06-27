using Microsoft.AspNetCore.Mvc;
using EmployeeManagementApi.DTOs;
using EmployeeManagementApi.Services.Interfaces;

namespace EmployeeManagementApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _authService.LoginAsync(request);
        if (token == null)
            return Unauthorized(new { message = "Invalid username or password." });

        return Ok(new { token });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result)
            return BadRequest(new { message = "Username or email already exists." });

        return Ok(new { message = "User registered successfully." });
    }
}
