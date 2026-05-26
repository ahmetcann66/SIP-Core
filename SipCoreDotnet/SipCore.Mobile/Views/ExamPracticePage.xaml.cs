using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile.Views;

public partial class ExamPracticePage : ContentPage
{
    public ExamPracticePage()
    {
        InitializeComponent();
        BindingContext = new ExamPracticeViewModel();
    }

    private async void OnBackClicked(object sender, EventArgs e)
    {
        await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
    }
}