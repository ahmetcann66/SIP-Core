using System.Collections.ObjectModel;
using System.Windows.Input;
using Microsoft.Maui.Controls;

namespace SipCore.Mobile.ViewModels;

public class ScoreViewModel
{
    private ICommand? goDashboardCommand;

    public ScoreViewModel()
    {
        ScoreItems = new ObservableCollection<ScoreItem>
        {
            new ScoreItem("Kelime Testi", 920),
            new ScoreItem("Haftalık Seri", 7),
            new ScoreItem("Pomodoro Tamamlama", 15)
        };
    }

    public ObservableCollection<ScoreItem> ScoreItems { get; }

    public ICommand GoDashboardCommand =>
        goDashboardCommand ??= new Command(NavigateToDashboard);

    private static async void NavigateToDashboard()
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }
}

public record ScoreItem(string Title, int Value);
