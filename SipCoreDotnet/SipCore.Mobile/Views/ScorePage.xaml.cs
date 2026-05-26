using Microsoft.Maui.Controls;
using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile.Views;

public partial class ScorePage : ContentPage
{
    public ScorePage()
    {
        InitializeComponent();
        BindingContext = new ScoreViewModel();
    }
}
