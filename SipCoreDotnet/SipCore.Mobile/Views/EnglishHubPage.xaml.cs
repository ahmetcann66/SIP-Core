using Microsoft.Maui.Controls;

namespace SipCore.Mobile.Views;

public partial class EnglishHubPage : ContentPage
{
    public EnglishHubPage()
    {
        InitializeComponent();
        try {
            BindingContext = new ViewModels.EnglishHubPageViewModel();
        } catch (Exception ex) {
            System.Diagnostics.Debug.WriteLine($"ViewModel Init Error: {ex}");
        }
    }
}