using System.ComponentModel;
using System.Collections.ObjectModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using System.Text.Json;

namespace SipCore.Mobile.ViewModels;

public class DashboardViewModel : INotifyPropertyChanged
{
    private const string SelectedLevelKey = "sip_selected_level";
    private const string PomodoroHistoryKey = "pomodoro_history_v1";
    private ICommand? loadCommand;
    private ICommand? refreshCommand;
    private ICommand? goEnglishHubCommand;
    private ICommand? goPomodoroCommand;
    private ICommand? goSipCoreCommand;
    private ICommand? goWorkspaceCommand;
    private ICommand? goRoadMapCommand;
    private ICommand? goExamPracticeCommand;
    private ICommand? goLevelsCommand;
    private ICommand? goScoreCommand;
    private ICommand? goHistoryCommand;
    private string selectedLevel = "A1";
    private int pomodoroSessionCount;
    private string quickInsight = "Öğrenmeye hazır";

    public event PropertyChangedEventHandler? PropertyChanged;

    public EnglishHubViewModel EnglishHub { get; }

    public DashboardViewModel()
    {
        EnglishHub = new EnglishHubViewModel();
        EnglishHub.PropertyChanged += (_, __) =>
        {
            OnPropertyChanged(nameof(WordCount));
            OnPropertyChanged(nameof(IsLoading));
            OnPropertyChanged(nameof(StatusMessage));
            BuildPreviewWords();
            RefreshDashboardStats();
        };

        RefreshDashboardStats();
    }

    public int WordCount => EnglishHub.WordItems?.Count ?? 0;
    public bool IsLoading => EnglishHub.IsLoading;
    public string StatusMessage => EnglishHub.StatusMessage;
    public ObservableCollection<WordItemDisplay> PreviewWords { get; } = new();

    public string SelectedLevel
    {
        get => selectedLevel;
        private set
        {
            selectedLevel = value;
            OnPropertyChanged();
        }
    }

    public int PomodoroSessionCount
    {
        get => pomodoroSessionCount;
        private set
        {
            pomodoroSessionCount = value;
            OnPropertyChanged();
        }
    }

    public string QuickInsight
    {
        get => quickInsight;
        private set
        {
            quickInsight = value;
            OnPropertyChanged();
        }
    }

    public ICommand LoadCommand =>
        loadCommand ??= new Command(async () =>
        {
            await EnglishHub.LoadStateAsync();
            BuildPreviewWords();
            RefreshDashboardStats();
        });

    public ICommand RefreshCommand =>
        refreshCommand ??= new Command(async () =>
        {
            await EnglishHub.RefreshAsync();
            BuildPreviewWords();
            RefreshDashboardStats();
        });

    public ICommand GoEnglishHubCommand =>
        goEnglishHubCommand ??= new Command(NavigateToEnglishHub);

    public ICommand GoPomodoroCommand =>
        goPomodoroCommand ??= new Command(NavigateToPomodoro);

    public ICommand GoSipCoreCommand =>
        goSipCoreCommand ??= new Command(NavigateToSipCore);

    public ICommand GoWorkspaceCommand =>
        goWorkspaceCommand ??= new Command(NavigateToWorkspace);

    public ICommand GoRoadMapCommand =>
        goRoadMapCommand ??= new Command(NavigateToRoadMap);

    public ICommand GoExamPracticeCommand =>
        goExamPracticeCommand ??= new Command(NavigateToExamPractice);

    public ICommand GoLevelsCommand =>
        goLevelsCommand ??= new Command(NavigateToLevels);

    public ICommand GoScoreCommand =>
        goScoreCommand ??= new Command(NavigateToScore);

    public ICommand GoHistoryCommand =>
        goHistoryCommand ??= new Command(NavigateToHistory);

    private static async void NavigateToEnglishHub()
    {
        try
        {
            var token = Services.TokenService.GetToken();
            if (string.IsNullOrWhiteSpace(token))
            {
                await Shell.Current.GoToAsync("AuthPage");
                return;
            }

            await Shell.Current.GoToAsync("MainPage");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToPomodoro()
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new Views.PomodoroPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToSipCore()
    {
        try
        {
            var token = Services.TokenService.GetToken();
            if (string.IsNullOrWhiteSpace(token))
            {
                await Shell.Current.GoToAsync("AuthPage");
                return;
            }

            await Shell.Current.GoToAsync("SipCorePage");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToWorkspace()
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new Views.WorkspacePage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToRoadMap()
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new Views.RoadMapPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToExamPractice()
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new Views.ExamPracticePage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToLevels()
    {
        try
        {
            var token = Services.TokenService.GetToken();
            if (string.IsNullOrWhiteSpace(token))
            {
                await Shell.Current.GoToAsync("AuthPage");
                return;
            }

            await Shell.Current.GoToAsync("LevelSelectPage");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToScore()
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new Views.ScorePage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private static async void NavigateToHistory()
    {
        try
        {
            await Shell.Current.Navigation.PushAsync(new Views.HistoryPage());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private void BuildPreviewWords()
    {
        PreviewWords.Clear();

        foreach (var item in EnglishHub.WordItems.Take(5))
        {
            PreviewWords.Add(item);
        }

        OnPropertyChanged(nameof(PreviewWords));
    }

    private void RefreshDashboardStats()
    {
        SelectedLevel = NormalizeLevelCode(Preferences.Default.Get(SelectedLevelKey, "A1"));

        try
        {
            var json = Preferences.Default.Get(PomodoroHistoryKey, string.Empty);
            var entries = string.IsNullOrWhiteSpace(json)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();

            PomodoroSessionCount = entries.Count(entry => !string.IsNullOrWhiteSpace(entry));
        }
        catch
        {
            PomodoroSessionCount = 0;
        }

        QuickInsight = $"{SelectedLevel} seviyesinde {WordCount} kelime, {PomodoroSessionCount} kayıtlı seans";
    }

    private static string NormalizeLevelCode(string level)
    {
        var trimmedLevel = level.Trim();
        var separatorIndex = trimmedLevel.IndexOf(' ');

        return separatorIndex > 0
            ? trimmedLevel[..separatorIndex]
            : trimmedLevel;
    }

    protected void OnPropertyChanged([CallerMemberName] string name = null!) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}

