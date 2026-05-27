using Microsoft.Maui.Controls;

namespace SipCore.Mobile.Views;

public partial class EnglishHubPage : ContentPage
{
    public EnglishHubPage()
    {
        InitializeComponent();
        BindingContext = new ViewModels.EnglishHubPageViewModel();
    }
}