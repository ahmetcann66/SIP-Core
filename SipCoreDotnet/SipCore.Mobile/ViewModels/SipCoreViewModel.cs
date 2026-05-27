using System.Collections.ObjectModel;
using System.Windows.Input;
using Microsoft.Maui.Controls;

namespace SipCore.Mobile.ViewModels;

public class SipCoreViewModel
{
    private readonly ICommand selectModuleCommand;

    public SipCoreViewModel()
    {
        Modules = new ObservableCollection<string>
        {
            "AI Asistan",
            "Materyal Üretici",
            "Ödev Analizi",
            "Performans İzleme"
        };

        GoDashboardCommand = new Command(async () =>
        {
            var token = Services.TokenService.GetToken();
            if (string.IsNullOrWhiteSpace(token))
            {
                await Shell.Current.GoToAsync("AuthPage");
                return;
            }

            await Shell.Current.GoToAsync("DashboardPage");
        });
        GoHistoryCommand = new Command(async () => await Shell.Current.Navigation.PushAsync(new Views.HistoryPage()));
        GoScoreCommand = new Command(async () => await Shell.Current.Navigation.PushAsync(new Views.ScorePage()));
        selectModuleCommand = new Command<string>(async module => await ShowModuleAsync(module));
    }

    public ObservableCollection<string> Modules { get; }

    public ICommand GoDashboardCommand { get; }

    public ICommand GoHistoryCommand { get; }

    public ICommand GoScoreCommand { get; }

    public ICommand SelectModuleCommand => selectModuleCommand;

    private static async Task ShowModuleAsync(string? module)
    {
        if (string.IsNullOrWhiteSpace(module))
        {
            return;
        }

        var page = Application.Current?.MainPage;
        if (page is null)
        {
            return;
        }

        await page.DisplayAlert("SIP Core", $"{module} seçildi.", "Tamam");
    }
}
