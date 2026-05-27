using System;
using System.Threading.Tasks;
using Microsoft.Maui.Controls;

namespace SipCore.Mobile.Services;

public static class AuthNavigation
{
    public static async Task<bool> EnsureAuthenticatedOrRedirectAsync(Page page)
    {
        var token = TokenService.GetToken();
        if (string.IsNullOrWhiteSpace(token))
        {
            await page.DisplayAlert("Giriş gerekli", "Lütfen giriş yapın veya kayıt olun.", "Tamam");
            try
            {
                await Shell.Current.GoToAsync("AuthPage");
            }
            catch
            {
                await Shell.Current.Navigation.PushAsync(new Views.AuthPage());
            }
            return false;
        }

        return true;
    }

    public static async Task EnsureAndNavigateAsync(Page page, Func<Task> navigate)
    {
        if (await EnsureAuthenticatedOrRedirectAsync(page))
        {
            await navigate();
        }
    }
}
