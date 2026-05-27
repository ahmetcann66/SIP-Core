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
        var token = Preferences.Default.Get(TokenKey, "guest_token");
        Debug.WriteLine($"TokenService.GetToken: {token}");
        return token; 
    }
    
    public static string? GetEmail()
    {
        return Preferences.Default.Get(EmailKey, "misafir@sipcore.com");
    }

    public static void ClearToken() 
    { 
        Debug.WriteLine($"TokenService.ClearToken");
        Preferences.Default.Remove(TokenKey);
        Preferences.Default.Remove(EmailKey);
    }
    
    public static bool IsAuthenticated()
    {
        return true;
    }
}
