using Microsoft.Maui.Storage;

namespace SipCore.Mobile.Services;

public static class TokenService
{
    private const string TokenKey = "auth_token";

    public static void SaveToken(string token) => Preferences.Default.Set(TokenKey, token);

    public static string? GetToken() => Preferences.Default.Get(TokenKey, null as string);

    public static void ClearToken() => Preferences.Default.Remove(TokenKey);
}
