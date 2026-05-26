using Microsoft.Maui.Controls;
using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile.Views;

public partial class SipCorePage : ContentPage
{
    public SipCorePage()
    {
        InitializeComponent();
        BindingContext = new SipCoreViewModel();
    }
}
