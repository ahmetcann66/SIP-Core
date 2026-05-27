using Microsoft.Maui.Controls;
using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile.Views;

public partial class LandingPage : ContentPage
{
    public LandingPage()
    {
        InitializeComponent();
        BindingContext = new LandingViewModel();
    }



    private async void OnDashboardClicked(object? sender, EventArgs e)
    {
        try
        {
            // Require auth before opening Dashboard
            await Services.AuthNavigation.EnsureAndNavigateAsync(this, async () => await Shell.Current.GoToAsync("DashboardPage"));
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private async void OnEnglishHubClicked(object? sender, EventArgs e)
    {
        try
        {
            // Require auth before opening English Hub (MainPage)
            await Services.AuthNavigation.EnsureAndNavigateAsync(this, async () => await Shell.Current.GoToAsync("MainPage"));
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private async void OnSipPanelClicked(object? sender, EventArgs e)
    {
        try
        {
            // Require auth before opening SIP Panel (DashboardPage)
            await Services.AuthNavigation.EnsureAndNavigateAsync(this, async () => await Shell.Current.GoToAsync("DashboardPage"));
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }
}
