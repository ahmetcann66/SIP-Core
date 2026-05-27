using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Microsoft.Maui.Controls;
using System.Timers;
using Microsoft.Maui.Storage;
using System.Text.Json;
using Microsoft.Maui.ApplicationModel;
using Microsoft.Maui.Controls;

namespace SipCore.Mobile.ViewModels;

public class PomodoroViewModel : INotifyPropertyChanged
{
    private int _selectedMinutes = 25;
    private string _statusMessage = "Hazır";
    private System.Timers.Timer? _timer;
    private int _timeLeftSeconds;
    private bool _isRunning;
    private bool _isPaused;
    private List<string> _laps = new();

    public event PropertyChangedEventHandler? PropertyChanged;

    public PomodoroViewModel()
    {
        StartCommand = new Command(StartSession);
        PauseCommand = new Command(PauseSession);
        StopCommand = new Command(StopAndSaveSession);
        LapCommand = new Command(RecordLap);
        ShortBreakCommand = new Command(() => SelectDuration(5));
        LongBreakCommand = new Command(() => SelectDuration(15));
        FocusCommand = new Command(() => SelectDuration(25));
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
    }

    public int SelectedMinutes
    {
        get => _selectedMinutes;
        set
        {
            _selectedMinutes = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(SessionSummary));
        }
    }

    public string StatusMessage
    {
        get => _statusMessage;
        set
        {
            _statusMessage = value;
            OnPropertyChanged();
        }
    }

    public string SessionSummary => $"Seçili seans: {SelectedMinutes} dk";

    public string TimeLeftDisplay
    {
        get
        {
            // Show remaining time when running or paused, otherwise show session summary
            if (!_isRunning && !_isPaused)
                return SessionSummary;

            var mins = _timeLeftSeconds / 60;
            var secs = _timeLeftSeconds % 60;
            return $"{mins:D2}:{secs:D2}";
        }
    }

    public ICommand StartCommand { get; }

    public ICommand ShortBreakCommand { get; }

    public ICommand LongBreakCommand { get; }

    public ICommand FocusCommand { get; }

    public ICommand GoDashboardCommand { get; }

    public ICommand PauseCommand { get; }

    public ICommand StopCommand { get; }

    public ICommand LapCommand { get; }

    private void StartSession()
    {
        if (_isPaused)
        {
            // resume
            StartTimer();
            _isPaused = false;
            StatusMessage = "Devam ediyor";
            OnPropertyChanged(nameof(TimeLeftDisplay));
            return;
        }

        if (_isRunning)
        {
            // already running - no-op
            return;
        }

        // start new session
        _timeLeftSeconds = SelectedMinutes * 60;
        _laps.Clear();
        StartTimer();
        StatusMessage = $"{SelectedMinutes} dakikalık seans başlatıldı";
        OnPropertyChanged(nameof(TimeLeftDisplay));
    }

    private void SelectDuration(int minutes)
    {
        SelectedMinutes = minutes;
        StatusMessage = "Süre güncellendi";
    }

    private void StartTimer()
    {
        _timer = new System.Timers.Timer(1000);
        _timer.Elapsed += Timer_Elapsed;
        _timer.AutoReset = true;
        _isRunning = true;
        _isPaused = false;
        _timer.Start();
        OnPropertyChanged(nameof(TimeLeftDisplay));
    }

    private void StopTimer(bool save)
    {
        try
        {
            _timer?.Stop();
            _timer?.Dispose();
            _timer = null;
        }
        finally
        {
            _isRunning = false;
            OnPropertyChanged(nameof(TimeLeftDisplay));
        }

        if (save)
        {
            SaveSessionRecord(SelectedMinutes);
        }
    }

    private void PauseSession()
    {
        if (!_isRunning)
            return;

        try
        {
            _timer?.Stop();
        }
        finally
        {
            _isRunning = false;
            _isPaused = true;
            StatusMessage = "Duraklatıldı";
            OnPropertyChanged(nameof(TimeLeftDisplay));
        }
    }

    private void StopAndSaveSession()
    {
        // Stop and save remaining/elapsed as a session if any progress was made
        var elapsedMinutes = SelectedMinutes - (_timeLeftSeconds / 60);
        if (elapsedMinutes <= 0)
        {
            // nothing to save — just stop
            StopTimer(save: false);
            StatusMessage = "Durduruldu";
            return;
        }

        StopTimer(save: true);
        StatusMessage = "Seans kaydedildi";
    }

    private void RecordLap()
    {
        // Record current elapsed minutes as a lap
        var elapsedSeconds = SelectedMinutes * 60 - _timeLeftSeconds;
        var elapsedMinutes = elapsedSeconds / 60.0;
        var entry = $"Tur: {elapsedMinutes:F2} dk - {DateTime.Now:dd.MM.yyyy HH:mm}";
        _laps.Insert(0, entry);

        // Also append to history so user can see laps in History list
        try
        {
            var key = "pomodoro_history_v1";
            var existing = Preferences.Default.Get(key, string.Empty);
            var list = string.IsNullOrWhiteSpace(existing)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(existing) ?? new List<string>();

            list.Insert(0, entry);
            Preferences.Default.Set(key, JsonSerializer.Serialize(list));
            StatusMessage = "Tur kaydedildi";
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"RecordLap failed: {ex}");
        }
    }

    private void Timer_Elapsed(object? sender, ElapsedEventArgs e)
    {
        _timeLeftSeconds--;
        MainThread.BeginInvokeOnMainThread(() =>
        {
            OnPropertyChanged(nameof(TimeLeftDisplay));
            if (_timeLeftSeconds <= 0)
            {
                StatusMessage = "Seans tamamlandı";
                StopTimer(save: true);

                // Notify UI and show a simple alert
                try
                {
                    MainThread.BeginInvokeOnMainThread(async () =>
                    {
                        var page = Application.Current?.MainPage;
                        if (page != null)
                        {
                            await page.DisplayAlert("Seans tamamlandı", "Tebrikler — seans tamamlandı.", "Tamam");
                        }
                    });
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"DisplayAlert failed: {ex}");
                }
            }
        });
    }

    private void SaveSessionRecord(int minutes)
    {
        try
        {
            var key = "pomodoro_history_v1";
            var existing = Preferences.Default.Get(key, string.Empty);
            var list = string.IsNullOrWhiteSpace(existing)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(existing) ?? new List<string>();

            var entry = $"{DateTime.Now:dd.MM.yyyy HH:mm} - {minutes}dk";
            list.Insert(0, entry);
            var json = JsonSerializer.Serialize(list);
            Preferences.Default.Set(key, json);

            // Publish a message so HistoryViewModel can refresh automatically
            try
            {
                MessagingCenter.Send(this, "PomodoroSessionSaved");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MessagingCenter send failed: {ex}");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"SaveSessionRecord failed: {ex}");
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
