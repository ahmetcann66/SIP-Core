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

    private async void OnAuthClicked(object? sender, EventArgs e)
    {
        try
        {
            // Push an AuthPage instance to avoid Shell route ambiguity
            await Shell.Current.Navigation.PushAsync(new Views.AuthPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private async void OnDashboardClicked(object? sender, EventArgs e)
    {
        try
        {
            // Push a DashboardPage instance to avoid Shell route ambiguity
            await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }
}
