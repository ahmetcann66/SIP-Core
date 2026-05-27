using System.Windows.Input;
using Microsoft.Maui.Controls;

namespace SipCore.Mobile.ViewModels;

public class LandingViewModel
{
    private ICommand? navigateDashboardCommand;

    public ICommand NavigateDashboardCommand =>
        navigateDashboardCommand ??= new Command(NavigateToDashboard);

    private static async void NavigateToDashboard()
    {
        try
        {
            await Shell.Current.GoToAsync("DashboardPage");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }
}
