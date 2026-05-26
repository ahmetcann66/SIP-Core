using System.Linq;
using System.Threading.Tasks;
using Microsoft.Maui.Controls;
using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile;

public partial class MainPage : ContentPage
{
    private readonly EnglishHubViewModel _viewModel;

    public MainPage()
    {
        InitializeComponent();
        _viewModel = new EnglishHubViewModel();
        BindingContext = _viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        if (_viewModel.IsLoading)
        {
            return;
        }

        await _viewModel.LoadStateAsync();
    }

    private async void OnForbiddenTapped(object sender, TappedEventArgs e)
    {
        var triggerFrame = sender as Frame;
        if (triggerFrame == null)
        {
            return;
        }

        var parentGrid = triggerFrame.Parent as Grid;
        var mainCardFrame = parentGrid?.Parent as Frame;
        var verticalStack = mainCardFrame?.Parent as VerticalStackLayout;

        var forbiddenPanel = verticalStack?.Children.OfType<Frame>().LastOrDefault();

        if (forbiddenPanel == null || forbiddenPanel == mainCardFrame)
        {
            return;
        }

        var triggerLabel = triggerFrame.Content as Label;

        if (forbiddenPanel.IsVisible)
        {
            triggerFrame.BorderColor = Color.FromArgb("#E5E7EB");
            if (triggerLabel != null)
            {
                triggerLabel.TextColor = Color.FromArgb("#9CA3AF");
            }

            await Task.WhenAll(
                forbiddenPanel.FadeTo(0, 200, Easing.CubicIn),
                forbiddenPanel.TranslateTo(0, -20, 200, Easing.CubicIn)
            );
            forbiddenPanel.IsVisible = false;
        }
        else
        {
            triggerFrame.BorderColor = Color.FromArgb("#FCA5A5");
            if (triggerLabel != null)
            {
                triggerLabel.TextColor = Color.FromArgb("#DC2626");
            }

            forbiddenPanel.TranslationY = -20;
            forbiddenPanel.IsVisible = true;

            await Task.WhenAll(
                forbiddenPanel.FadeTo(1, 300, Easing.CubicOut),
                forbiddenPanel.TranslateTo(0, 0, 300, Easing.CubicOut)
            );
        }
    }

    private async void OnOpenLevelsClicked(object sender, EventArgs e)
    {
        await Shell.Current.Navigation.PushAsync(new Views.LevelSelectPage());
    }

    private async void OnOpenDashboardClicked(object sender, EventArgs e)
    {
        await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
    }
}