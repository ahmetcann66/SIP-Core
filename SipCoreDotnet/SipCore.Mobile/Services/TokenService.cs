using Microsoft.Maui.Storage;
using System.Diagnostics;

namespace SipCore.Mobile.Services;

public static class TokenService
{
    private const string TokenKey = "auth_token";
    private const string EmailKey = "auth_email";

    public static void SaveToken(string token) 
    { 
        Debug.WriteLine($"TokenService.SaveToken: {token}");
        Preferences.Default.Set(TokenKey, token); 
    }
    
    public static void SaveEmail(string email)
    {
        Debug.WriteLine($"TokenService.SaveEmail: {email}");
        Preferences.Default.Set(EmailKey, email);
    }

    public static string? GetToken() 
    { 
        var token = Preferences.Default.Get(TokenKey, null as string);
        Debug.WriteLine($"TokenService.GetToken: {token ?? "null"}");
        return token; 
    }
    
    public static string? GetEmail()
    {
        return Preferences.Default.Get(EmailKey, null as string);
    }

    public static void ClearToken() 
    { 
        Debug.WriteLine($"TokenService.ClearToken");
        Preferences.Default.Remove(TokenKey);
        Preferences.Default.Remove(EmailKey);
    }
    
    public static bool IsAuthenticated()
    {
        var token = GetToken();
        var isAuth = !string.IsNullOrWhiteSpace(token);
        Debug.WriteLine($"TokenService.IsAuthenticated: {isAuth}");
        return isAuth;
    }
}
