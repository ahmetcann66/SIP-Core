using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace SipCore.Mobile.ViewModels;

public class LevelSelectViewModel : INotifyPropertyChanged
{
    private const string SelectedLevelKey = "sip_selected_level";
    private string _statusMessage = "Bir seviye seçin";
    private string _selectedLevel = string.Empty;
    private string _selectedLevelHint = "Bir seçenek seçtiğinde buraya seviye özeti gelecek.";

    public event PropertyChangedEventHandler? PropertyChanged;

    public LevelSelectViewModel()
    {
        Levels = new ObservableCollection<LevelOption>
        {
            new("A1", "A1 - Başlangıç", "Başlangıç seviyesi. Temel kelime ve kısa cümlelerle ilerlersin."),
            new("A2", "A2 - Temel", "Temel kullanım seviyesi. Günlük konuşma ve kısa metinler öne çıkar."),
            new("B1", "B1 - Orta", "Orta seviye. Daha uzun metinler ve açıklama odaklı çalışmalar için uygun."),
            new("B2", "B2 - Üst Orta", "Üst orta seviye. Karmaşık yapılar ve sınav pratiği için iyi bir eşik."),
            new("C1", "C1 - İleri", "İleri seviye. Akademik ve detaylı ifade becerilerine odaklanır.")
        };

        SelectLevelCommand = new Command<string>(OnLevelSelected);
        GoDashboardCommand = new Command(async () =>
        {
            try
            {
                await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Dashboard navigation failed: {ex.Message}");
            }
        });

        var savedLevel = Preferences.Default.Get(SelectedLevelKey, string.Empty);
        if (!string.IsNullOrWhiteSpace(savedLevel))
        {
            ApplyLevel(savedLevel, persist: false);
            StatusMessage = $"Son seçilen seviye: {SelectedLevel}";
        }
    }

    public ObservableCollection<LevelOption> Levels { get; }

    public string SelectedLevel
    {
        get => _selectedLevel;
        private set
        {
            _selectedLevel = value;
            OnPropertyChanged();
        }
    }

    public string SelectedLevelHint
    {
        get => _selectedLevelHint;
        private set
        {
            _selectedLevelHint = value;
            OnPropertyChanged();
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

    public ICommand SelectLevelCommand { get; }

    public ICommand GoDashboardCommand { get; }

    public void SelectLevel(string? level)
    {
        OnLevelSelected(level);
    }

    private void OnLevelSelected(string? level)
    {
        if (string.IsNullOrWhiteSpace(level))
        {
            return;
        }

        ApplyLevel(level, persist: true);
        StatusMessage = $"Seçilen seviye: {SelectedLevel}";
    }

    private void ApplyLevel(string level, bool persist)
    {
        var normalizedLevel = NormalizeLevelCode(level);
        var option = Levels.FirstOrDefault(item => string.Equals(item.Code, normalizedLevel, StringComparison.OrdinalIgnoreCase));

        SelectedLevel = option?.DisplayName ?? normalizedLevel;
        SelectedLevelHint = option?.Hint ?? GetLevelHint(normalizedLevel);

        if (persist)
        {
            Preferences.Default.Set(SelectedLevelKey, normalizedLevel);
        }
    }

    private static string NormalizeLevelCode(string level)
    {
        var trimmedLevel = level.Trim();
        var separatorIndex = trimmedLevel.IndexOf(' ');

        return separatorIndex > 0
            ? trimmedLevel[..separatorIndex]
            : trimmedLevel;
    }

    private static string GetLevelHint(string level)
    {
        if (level.StartsWith("A1", StringComparison.OrdinalIgnoreCase))
        {
            return "Başlangıç seviyesi. Temel kelime ve kısa cümlelerle ilerlersin.";
        }

        if (level.StartsWith("A2", StringComparison.OrdinalIgnoreCase))
        {
            return "Temel kullanım seviyesi. Günlük konuşma ve kısa metinler öne çıkar.";
        }

        if (level.StartsWith("B1", StringComparison.OrdinalIgnoreCase))
        {
            return "Orta seviye. Daha uzun metinler ve açıklama odaklı çalışmalar için uygun.";
        }

        if (level.StartsWith("B2", StringComparison.OrdinalIgnoreCase))
        {
            return "Üst orta seviye. Karmaşık yapılar ve sınav pratiği için iyi bir eşik.";
        }

        if (level.StartsWith("C1", StringComparison.OrdinalIgnoreCase))
        {
            return "İleri seviye. Akademik ve detaylı ifade becerilerine odaklanır.";
        }

        return "Bu seviye için kişisel çalışma planı hazırlanacak.";
    }

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}

public sealed record LevelOption(string Code, string DisplayName, string Hint);
