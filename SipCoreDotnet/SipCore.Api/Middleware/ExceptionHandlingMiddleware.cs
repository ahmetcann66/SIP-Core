using System.Net;
using System.Text.Json;

namespace SipCore.Api.Middleware;

/// <summary>
/// Middleware to handle global exceptions and return standardized error responses.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ProblemDetails
        {
            Type = "https://api.example.com/errors/exception",
            Title = "An error occurred",
            Status = StatusCodes.Status500InternalServerError,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        if (exception is ArgumentNullException or ArgumentException)
        {
            response.Status = StatusCodes.Status400BadRequest;
            response.Title = "Invalid input";
        }

        context.Response.StatusCode = response.Status ?? StatusCodes.Status500InternalServerError;

        return context.Response.WriteAsJsonAsync(response);
    }
}

/// <summary>
/// Standard problem details response format following RFC 7807.
/// </summary>
public class ProblemDetails
{
    public string? Type { get; set; }

    public string? Title { get; set; }

    public int? Status { get; set; }

    public string? Detail { get; set; }

    public string? Instance { get; set; }
}
