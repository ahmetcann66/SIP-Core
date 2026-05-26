using Microsoft.Maui.Controls;
using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile.Views;

public partial class LevelSelectPage : ContentPage
{
    public LevelSelectPage()
    {
        InitializeComponent();
        BindingContext = new LevelSelectViewModel();
    }

    private async void OnSelectClicked(object sender, EventArgs e)
    {
        if (sender is not Button button)
        {
            return;
        }

        if (BindingContext is not LevelSelectViewModel viewModel)
        {
            return;
        }

        viewModel.SelectLevel(button.CommandParameter?.ToString());
        await NavigateBackSafelyAsync();
    }

    private async void OnBackClicked(object sender, EventArgs e)
    {
        await NavigateBackSafelyAsync();
    }

    private static async Task NavigateBackSafelyAsync()
    {
        var shell = Shell.Current;
        if (shell == null)
        {
            return;
        }

        if (shell.Navigation.NavigationStack.Count > 1)
        {
            await shell.Navigation.PopAsync();
            return;
        }

        // Avoid Shell URI navigation to prevent ambiguous route resolution.
        await shell.Navigation.PushAsync(new Views.LandingPage());
    }
}
