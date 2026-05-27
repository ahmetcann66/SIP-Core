using System.Collections.ObjectModel;

namespace SipCore.Mobile.ViewModels;

public class HistoryViewModel
{
    public HistoryViewModel()
    {
        HistoryItems = new ObservableCollection<string>();
        LoadHistoryFromPreferences();

        // Subscribe to pomodoro saved messages so history auto-refreshes
        try
        {
            Microsoft.Maui.Controls.MessagingCenter.Subscribe<PomodoroViewModel>(this, "PomodoroSessionSaved", (sender) =>
            {
                // Reload on main thread
                Microsoft.Maui.ApplicationModel.MainThread.BeginInvokeOnMainThread(() =>
                {
                    HistoryItems.Clear();
                    LoadHistoryFromPreferences();
                });
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"History subscribe failed: {ex}");
        }
    }

    public ObservableCollection<string> HistoryItems { get; }

    private void LoadHistoryFromPreferences()
    {
        try
        {
            var key = "pomodoro_history_v1";
            var existing = Microsoft.Maui.Storage.Preferences.Default.Get(key, string.Empty);
            if (string.IsNullOrWhiteSpace(existing)) return;
            var list = System.Text.Json.JsonSerializer.Deserialize<List<string>>(existing);
            if (list is null) return;
            foreach (var item in list)
            {
                HistoryItems.Add(item);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"LoadHistoryFromPreferences failed: {ex}");
        }
    }
}
