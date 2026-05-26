using SipCore.Core.DTOs;

namespace SipCore.Mobile.Services;

public interface IApiClient
{
    Task<EnglishHubStateDto?> GetEnglishHubStateAsync();
    Task<EnglishHubStateDto?> SaveEnglishHubStateAsync(EnglishHubStateDto state);
    Task<AuthResponse?> LoginAsync(AuthRequest request);
    Task<AuthResponse?> RegisterAsync(AuthRequest request);
    void SetAuthorizationToken(string? token);
    void SetBaseAddress(string address);
}
