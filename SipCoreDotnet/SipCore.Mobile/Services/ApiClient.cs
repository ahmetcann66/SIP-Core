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
            var emailNorm = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
            
            // Prepare legacy payload with 'sifre' field for backend compatibility
            var legacyPayload = JsonSerializer.Serialize(new { email = emailNorm, sifre = request.Password });
            var legacyContent = new StringContent(legacyPayload, System.Text.Encoding.UTF8, "application/json");
            
            LogMessage($"LoginAsync: email='{emailNorm}', password length={request.Password?.Length ?? 0}");
            LogMessage($"LoginAsync: Legacy payload = {legacyPayload}");
            
            // Try legacy student login endpoint first (most common for this backend)
            HttpResponseMessage? response = null;
            try {
                LogMessage($"LoginAsync: POST api/students/login");
                response = await _httpClient.PostAsync("api/students/login", legacyContent);
                LogMessage($"LoginAsync: api/students/login returned {response.StatusCode}");
                
                if (response.IsSuccessStatusCode)
                {
                    var resp = await response.Content.ReadAsStringAsync();
                    LogMessage($"LoginAsync: Response content = {resp}");
                    
                    // Try to parse as AuthResponse first
                    var auth = JsonSerializer.Deserialize<AuthResponse>(resp, JsonOptions);
                    if (auth is not null && !string.IsNullOrWhiteSpace(auth.Token))
                    {
                        SetAuthorizationToken(auth.Token);
                        return auth;
                    }
                    
                    // Backend returned a Student object - extract id and create synthetic token
                    try {
                        using var doc = JsonDocument.Parse(resp);
                        if (doc.RootElement.TryGetProperty("id", out var idProp))
                        {
                            var idStr = idProp.GetRawText();
                            var syntheticToken = $"student:{idStr}:{emailNorm}";
                            SetAuthorizationToken(syntheticToken);
                            LogMessage($"LoginAsync: Synthesized token for student id {idStr}");
                            return new AuthResponse(syntheticToken, 0, null);
                        }
                    } catch { /* ignore parse errors */ }
                    
                    // If response is success but couldn't parse, still consider it successful
                    // This handles cases where backend returns just confirmation message
                    if (!string.IsNullOrWhiteSpace(resp) && !resp.Contains("error", StringComparison.OrdinalIgnoreCase))
                    {
                        var syntheticToken = $"student:0:{emailNorm}";
                        SetAuthorizationToken(syntheticToken);
                        LogMessage($"LoginAsync: Login successful but no id in response, using fallback token");
                        return new AuthResponse(syntheticToken, 0, null);
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    LogMessage($"LoginAsync: api/students/login error = {errorContent}");
                }
            } catch (Exception ex) {
                LogMessage($"LoginAsync: api/students/login exception = {ex.Message}");
            }

            // Try newer auth endpoint as fallback
            try {
                LogMessage($"LoginAsync: POST api/auth/login");
                response = await _httpClient.PostAsync("api/auth/login", content);
                LogMessage($"LoginAsync: api/auth/login returned {response.StatusCode}");
                
                if (response.IsSuccessStatusCode)
                {
                    var resp = await response.Content.ReadAsStringAsync();
                    LogMessage($"LoginAsync: api/auth/login Response = {resp}");
                    var auth = JsonSerializer.Deserialize<AuthResponse>(resp, JsonOptions);
                    if (auth is not null && !string.IsNullOrWhiteSpace(auth.Token))
                    {
                        SetAuthorizationToken(auth.Token);
                        return auth;
                    }
                }
            } catch (Exception ex) {
                LogMessage($"LoginAsync: api/auth/login exception = {ex.Message}");
            }

            return null;
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
            var emailNorm = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
            
            // Prepare legacy payload with 'sifre' field for backend compatibility
            var legacyPayload = JsonSerializer.Serialize(new { email = emailNorm, sifre = request.Password });
            var legacyContent = new StringContent(legacyPayload, System.Text.Encoding.UTF8, "application/json");
            
            LogMessage($"RegisterAsync: email='{emailNorm}', password length={request.Password?.Length ?? 0}");
            LogMessage($"RegisterAsync: Legacy payload = {legacyPayload}");
            
            // Try legacy student register endpoint first
            HttpResponseMessage? response = null;
            try {
                LogMessage($"RegisterAsync: POST api/students/register");
                response = await _httpClient.PostAsync("api/students/register", legacyContent);
                LogMessage($"RegisterAsync: api/students/register returned {response.StatusCode}");
                
                if (response.IsSuccessStatusCode)
                {
                    var resp = await response.Content.ReadAsStringAsync();
                    LogMessage($"RegisterAsync: Response content = {resp}");
                    
                    // Try to parse as AuthResponse first
                    var auth = JsonSerializer.Deserialize<AuthResponse>(resp, JsonOptions);
                    if (auth is not null && !string.IsNullOrWhiteSpace(auth.Token))
                    {
                        SetAuthorizationToken(auth.Token);
                        return auth;
                    }
                    
                    // Backend returned a Student object - extract id and create synthetic token
                    try {
                        using var doc = JsonDocument.Parse(resp);
                        if (doc.RootElement.TryGetProperty("id", out var idProp))
                        {
                            var idStr = idProp.GetRawText();
                            var syntheticToken = $"student:{idStr}:{emailNorm}";
                            SetAuthorizationToken(syntheticToken);
                            LogMessage($"RegisterAsync: Synthesized token for student id {idStr}");
                            return new AuthResponse(syntheticToken, 0, null);
                        }
                    } catch { /* ignore parse errors */ }
                    
                    // If response is success but couldn't parse, still consider it successful
                    if (!string.IsNullOrWhiteSpace(resp) && !resp.Contains("error", StringComparison.OrdinalIgnoreCase))
                    {
                        var syntheticToken = $"student:0:{emailNorm}";
                        SetAuthorizationToken(syntheticToken);
                        LogMessage($"RegisterAsync: Registration successful but no id in response, using fallback token");
                        return new AuthResponse(syntheticToken, 0, null);
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    LogMessage($"RegisterAsync: api/students/register error = {errorContent}");
                }
            } catch (Exception ex) {
                LogMessage($"RegisterAsync: api/students/register exception = {ex.Message}");
            }

            // Try newer auth endpoint as fallback
            var json = JsonSerializer.Serialize(request, JsonOptions);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            try {
                LogMessage($"RegisterAsync: POST api/auth/register");
                response = await _httpClient.PostAsync("api/auth/register", content);
                LogMessage($"RegisterAsync: api/auth/register returned {response.StatusCode}");
                
                if (response.IsSuccessStatusCode)
                {
                    var resp = await response.Content.ReadAsStringAsync();
                    LogMessage($"RegisterAsync: api/auth/register Response = {resp}");
                    var auth = JsonSerializer.Deserialize<AuthResponse>(resp, JsonOptions);
                    if (auth is not null && !string.IsNullOrWhiteSpace(auth.Token))
                    {
                        SetAuthorizationToken(auth.Token);
                        return auth;
                    }
                }
            } catch (Exception ex) {
                LogMessage($"RegisterAsync: api/auth/register exception = {ex.Message}");
            }

            return null;
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
            HttpResponseMessage? response = null;
            try
            {
                response = await _httpClient.GetAsync("api/english-hub/state");
            }
            catch (Exception ex)
            {
                LogMessage($"GetEnglishHubStateAsync initial attempt failed: {ex.Message}");
            }

            if (response == null || !response.IsSuccessStatusCode)
            {
                // Try fallbacks (useful for emulator host connectivity differences)
                var originalBase = _httpClient.BaseAddress?.ToString() ?? string.Empty;
                var fallbacks = new[] { "http://127.0.0.1:8080/", "http://10.0.2.2:8080/" };
                foreach (var fb in fallbacks)
                {
                    if (string.Equals(fb, originalBase, StringComparison.OrdinalIgnoreCase)) continue;
                    try
                    {
                        LogMessage($"GetEnglishHubStateAsync trying fallback BaseAddress={fb}");
                        _httpClient.BaseAddress = new Uri(fb);
                        response = await _httpClient.GetAsync("api/english-hub/state");
                        if (response != null && response.IsSuccessStatusCode) break;
                    }
                    catch (Exception ex)
                    {
                        LogMessage($"GetEnglishHubStateAsync fallback {fb} failed: {ex.Message}");
                        continue;
                    }
                }

                // restore original base address
                if (!string.IsNullOrEmpty(originalBase))
                {
                    try { _httpClient.BaseAddress = new Uri(originalBase); } catch { }
                }
            }

            if (response == null)
            {
                LogMessage($"GetEnglishHubStateAsync: No response from any endpoint");
                return null;
            }

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
