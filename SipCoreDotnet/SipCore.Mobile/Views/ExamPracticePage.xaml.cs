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
        await Services.AuthNavigation.EnsureAndNavigateAsync(this, async () => await Shell.Current.GoToAsync("DashboardPage"));
    }
}