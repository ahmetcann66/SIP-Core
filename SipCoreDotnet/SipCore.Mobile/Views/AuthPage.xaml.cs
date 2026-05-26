using Microsoft.Maui.Controls;
using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile.Views;

public partial class AuthPage : ContentPage
{
    public AuthPage()
    {
        InitializeComponent();
        BindingContext = new AuthViewModel();
    }
}
