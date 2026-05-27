using Microsoft.Maui.Controls;
using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile.Views;

public partial class PomodoroPage : ContentPage
{
    public PomodoroPage()
    {
        InitializeComponent();
        BindingContext = new PomodoroViewModel();
    }
}
