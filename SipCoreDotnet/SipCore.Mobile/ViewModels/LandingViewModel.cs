using System.Windows.Input;
using Microsoft.Maui.Controls;

namespace SipCore.Mobile.ViewModels;

public class LandingViewModel
{
    private ICommand? navigateAuthCommand;
    private ICommand? navigateDashboardCommand;

    public ICommand NavigateAuthCommand =>
        navigateAuthCommand ??= new Command(NavigateToAuth);

    public ICommand NavigateDashboardCommand =>
        navigateDashboardCommand ??= new Command(NavigateToDashboard);

    private static async void NavigateToAuth()
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new Views.AuthPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToDashboard()
    {
        try
        {
            var token = Services.TokenService.GetToken();
            if (string.IsNullOrWhiteSpace(token))
            {
                await Shell.Current.GoToAsync("AuthPage");
                return;
            }

            await Shell.Current.GoToAsync("DashboardPage");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }
}

