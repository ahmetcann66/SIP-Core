using System;
using System.Threading.Tasks;
using Microsoft.Maui.Controls;

namespace SipCore.Mobile.Services;

public static class AuthNavigation
{
    public static async Task<bool> EnsureAuthenticatedOrRedirectAsync(Page page)
    {
        return await Task.FromResult(true);
    }

    public static async Task EnsureAndNavigateAsync(Page page, Func<Task> navigate)
    {
        if (await EnsureAuthenticatedOrRedirectAsync(page))
        {
            await navigate();
        }
    }
}
