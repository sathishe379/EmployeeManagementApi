using System.Net;
using System.Text.Json;

namespace EmployeeManagementApi.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found: {Message}", ex.Message);
            await WriteResponseAsync(context, HttpStatusCode.NotFound, new
            {
                status = 404,
                message = ex.Message
            });
        }
        catch (Exceptions.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed: {Message}", ex.Message);
            await WriteResponseAsync(context, HttpStatusCode.BadRequest, new
            {
                status = 400,
                message = ex.Message,
                errors = ex.Errors
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation: {Message}", ex.Message);
            await WriteResponseAsync(context, HttpStatusCode.BadRequest, new
            {
                status = 400,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            await WriteResponseAsync(context, HttpStatusCode.InternalServerError, new
            {
                status = 500,
                message = "An unexpected error occurred. Please try again later."
            });
        }
    }

    private static async Task WriteResponseAsync(HttpContext context, HttpStatusCode statusCode, object response)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
