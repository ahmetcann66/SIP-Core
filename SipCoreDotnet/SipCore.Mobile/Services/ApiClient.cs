using System.Text.Json;
using System.Diagnostics;
using SipCore.Core.DTOs;
using System.Net.Http.Headers;
using Microsoft.Maui.Storage;

namespace SipCore.Mobile.Services;

public class ApiClient : IApiClient
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions JsonOptions = new() 
    { 
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public void SetAuthorizationToken(string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
            Preferences.Default.Remove("auth_token");
            return;
        }

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        Preferences.Default.Set("auth_token", token);
    }

    public async Task<AuthResponse?> LoginAsync(AuthRequest request)
    {
        try
        {
            var json = JsonSerializer.Serialize(request, JsonOptions);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("api/auth/login", content);
            if (!response.IsSuccessStatusCode) return null;
            var resp = await response.Content.ReadAsStringAsync();
            var auth = JsonSerializer.Deserialize<AuthResponse>(resp, JsonOptions);
            if (auth is not null)
            {
                SetAuthorizationToken(auth.Token);
            }
            return auth;
        }
        catch (Exception ex)
        {
            LogMessage($"LoginAsync exception: {ex}");
            return null;
        }
    }

    public async Task<AuthResponse?> RegisterAsync(AuthRequest request)
    {
        try
        {
            var json = JsonSerializer.Serialize(request, JsonOptions);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("api/auth/register", content);
            if (!response.IsSuccessStatusCode) return null;
            var resp = await response.Content.ReadAsStringAsync();
            var auth = JsonSerializer.Deserialize<AuthResponse>(resp, JsonOptions);
            if (auth is not null)
            {
                SetAuthorizationToken(auth.Token);
            }
            return auth;
        }
        catch (Exception ex)
        {
            LogMessage($"RegisterAsync exception: {ex}");
            return null;
        }
    }

    public void SetBaseAddress(string address)
    {
        _httpClient.BaseAddress = new Uri(address);
    }

    public async Task<EnglishHubStateDto?> GetEnglishHubStateAsync()
    {
        try
        {
            LogMessage($"GET api/english-hub/state -> BaseAddress={_httpClient.BaseAddress}");
            var response = await _httpClient.GetAsync("api/english-hub/state");
            LogMessage($"Response Status={response.StatusCode}");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                LogMessage($"Response Content Length={content?.Length}");
                return JsonSerializer.Deserialize<EnglishHubStateDto>(content, JsonOptions);
            }
            return null;
        }
        catch (Exception ex)
        {
            LogMessage($"GetEnglishHubStateAsync exception: {ex}");
            return null;
        }
    }

    public async Task<EnglishHubStateDto?> SaveEnglishHubStateAsync(EnglishHubStateDto state)
    {
        try
        {
            var json = JsonSerializer.Serialize(state, JsonOptions);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            LogMessage($"PUT api/english-hub/state -> BaseAddress={_httpClient.BaseAddress} PayloadSize={json.Length}");
            var response = await _httpClient.PutAsync("api/english-hub/state", content);
            LogMessage($"PUT Response Status={response.StatusCode}");
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                LogMessage($"PUT Response Content Length={responseContent?.Length}");
                return JsonSerializer.Deserialize<EnglishHubStateDto>(responseContent, JsonOptions);
            }
            return null;
        }
        catch (Exception ex)
        {
            LogMessage($"SaveEnglishHubStateAsync exception: {ex}");
            return null;
        }
    }

    private static void LogMessage(string message)
    {
        Debug.WriteLine($"ApiClient: {message}");
        Console.WriteLine($"ApiClient: {message}");

#if ANDROID
        Android.Util.Log.Info("ApiClient", message);
#endif
    }
}
