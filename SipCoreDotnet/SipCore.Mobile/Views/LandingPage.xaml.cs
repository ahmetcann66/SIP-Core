using Microsoft.Maui.Controls;
using SipCore.Mobile.ViewModels;
using SipCore.Mobile.Services;

namespace SipCore.Mobile.Views;

public partial class LandingPage : ContentPage
{
    public LandingPage()
    {
        InitializeComponent();
        BindingContext = new LandingViewModel();
    }

    private async void OnEnglishHubClicked(object? sender, EventArgs e)
    {
        try
        {
            await Shell.Current.GoToAsync("///EnglishHubPage");
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
            await Shell.Current.GoToAsync("///DashboardPage");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private async void OnPomodoroClicked(object? sender, EventArgs e)
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new PomodoroPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private async void OnRoadMapClicked(object? sender, EventArgs e)
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new RoadMapPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private async void OnSipCoreClicked(object? sender, EventArgs e)
    {
        try
        {
            await Shell.Current.GoToAsync("///SipCorePage");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }
}
