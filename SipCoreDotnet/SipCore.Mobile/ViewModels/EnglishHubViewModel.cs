using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using SipCore.Core.DTOs;
using SipCore.Mobile.Services;
using Microsoft.Maui.Storage;

namespace SipCore.Mobile.ViewModels;

public class EnglishHubViewModel : INotifyPropertyChanged
{
    private const string SelectedLevelKey = "sip_selected_level";
    private static readonly string[] PreferredLevelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    private static readonly Dictionary<string, List<WordItemDisplay>> OfflineFallbackWords = new()
    {
        ["A1"] =
        [
            new WordItemDisplay { English = "Tree", Turkish = "Ağaç", ForbiddenWords = "Leaf, Wood, Forest" },
            new WordItemDisplay { English = "Book", Turkish = "Kitap", ForbiddenWords = "Read, Page, Library" },
            new WordItemDisplay { English = "Water", Turkish = "Su", ForbiddenWords = "Drink, River, Glass" },
        ],
        ["A2"] =
        [
            new WordItemDisplay { English = "Journey", Turkish = "Yolculuk", ForbiddenWords = "Travel, Trip, Ticket" },
            new WordItemDisplay { English = "Market", Turkish = "Pazar", ForbiddenWords = "Shop, Buy, Price" },
            new WordItemDisplay { English = "Friendship", Turkish = "Arkadaşlık", ForbiddenWords = "Friend, Trust, Support" },
        ],
        ["B1"] =
        [
            new WordItemDisplay { English = "Challenge", Turkish = "Meydan okuma", ForbiddenWords = "Difficult, Goal, Effort" },
            new WordItemDisplay { English = "Decision", Turkish = "Karar", ForbiddenWords = "Choose, Option, Result" },
            new WordItemDisplay { English = "Balance", Turkish = "Denge", ForbiddenWords = "Equal, Stability, Center" },
        ],
        ["B2"] =
        [
            new WordItemDisplay { English = "Perspective", Turkish = "Bakış açısı", ForbiddenWords = "Viewpoint, Opinion, Angle" },
            new WordItemDisplay { English = "Resilience", Turkish = "Dayanıklılık", ForbiddenWords = "Strength, Recover, Persist" },
            new WordItemDisplay { English = "Innovation", Turkish = "Yenilik", ForbiddenWords = "New, Creative, Improve" },
        ],
        ["C1"] =
        [
            new WordItemDisplay { English = "Hypothesis", Turkish = "Hipotez", ForbiddenWords = "Theory, Test, Assumption" },
            new WordItemDisplay { English = "Sustainable", Turkish = "Sürdürülebilir", ForbiddenWords = "Long-term, Eco, Maintain" },
            new WordItemDisplay { English = "Comprehensive", Turkish = "Kapsamlı", ForbiddenWords = "Complete, Detailed, Broad" },
        ],
        ["C2"] =
        [
            new WordItemDisplay { English = "Nuance", Turkish = "İncelik", ForbiddenWords = "Subtle, Detail, Difference" },
            new WordItemDisplay { English = "Paradigm", Turkish = "Paradigma", ForbiddenWords = "Model, Framework, Pattern" },
            new WordItemDisplay { English = "Meticulous", Turkish = "Titiz", ForbiddenWords = "Careful, Precise, Thorough" },
        ],
    };
    private readonly IApiClient _apiClient;
    private EnglishHubStateDto? _state;
    private bool _isLoading;
    private string _statusMessage = "Ready";
    private string _activeLevel = "A1";
    private ObservableCollection<WordItemDisplay> _wordItems = new();

    public event PropertyChangedEventHandler? PropertyChanged;

    public EnglishHubStateDto? State
    {
        get => _state;
        set { _state = value; OnPropertyChanged(); }
    }

    public bool IsLoading
    {
        get => _isLoading;
        set { _isLoading = value; OnPropertyChanged(); }
    }

    public string StatusMessage
    {
        get => _statusMessage;
        set { _statusMessage = value; OnPropertyChanged(); }
    }

    public string ActiveLevel
    {
        get => _activeLevel;
        private set { _activeLevel = value; OnPropertyChanged(); }
    }

    public string ActiveLevelDescription => ActiveLevel switch
    {
        "A1" => "Başlangıç seviyesi kelimeleri",
        "A2" => "Temel kullanım ve günlük ifadeler",
        "B1" => "Orta seviye kelime havuzu",
        "B2" => "Üst orta seviye kelime havuzu",
        "C1" => "İleri seviye akademik kelimeler",
        "C2" => "Ust seviye kelime havuzu",
        _ => "Seçilen seviyeye göre içerik"
    };

    public ObservableCollection<WordItemDisplay> WordItems
    {
        get => _wordItems;
        set { _wordItems = value; OnPropertyChanged(); }
    }

    public IAsyncRelayCommand LoadStateCommand { get; }
    public IAsyncRelayCommand RefreshCommand { get; }

    public EnglishHubViewModel()
    {
        _apiClient = SipCore.Mobile.ServiceHelper.GetApiClient();
        LoadStateCommand = new AsyncRelayCommand(LoadStateAsync);
        RefreshCommand = new AsyncRelayCommand(RefreshAsync);
    }

    public async Task LoadStateAsync()
    {
        System.Diagnostics.Debug.WriteLine("EnglishHubViewModel: LoadStateAsync started");
#if ANDROID
        Android.Util.Log.Info("EnglishHubViewModel", "LoadStateAsync started");
#endif
        IsLoading = true;
        StatusMessage = "Loading vocabulary...";

        try
        {
            var state = await _apiClient.GetEnglishHubStateAsync();
            if (state != null)
            {
                State = state;
                ActiveLevel = ResolveActiveLevel(state);
                PopulateWordItems(state, ActiveLevel);
                StatusMessage = $"Loaded {WordItems.Count} vocabulary items for {ActiveLevel}";
                System.Diagnostics.Debug.WriteLine($"EnglishHubViewModel: Loaded {WordItems.Count} vocabulary items for {ActiveLevel}");
#if ANDROID
                Android.Util.Log.Info("EnglishHubViewModel", $"Loaded {WordItems.Count} vocabulary items for {ActiveLevel}");
#endif
            }
            else
            {
                ActiveLevel = NormalizeLevelCode(Preferences.Default.Get(SelectedLevelKey, "A1"));
                LoadOfflineFallback(ActiveLevel);
                StatusMessage = "Sunucuya ulaşılamadı, çevrimdışı kelimeler gösteriliyor";
                System.Diagnostics.Debug.WriteLine("EnglishHubViewModel: Failed to load state from server");
#if ANDROID
                Android.Util.Log.Warn("EnglishHubViewModel", "Failed to load state from server");
#endif
            }
        }
        catch (Exception ex)
        {
            ActiveLevel = NormalizeLevelCode(Preferences.Default.Get(SelectedLevelKey, "A1"));
            LoadOfflineFallback(ActiveLevel);
            StatusMessage = "Bağlantı hatası, çevrimdışı kelimeler kullanılıyor";
            System.Diagnostics.Debug.WriteLine($"EnglishHubViewModel: Error {ex.Message}");
#if ANDROID
            Android.Util.Log.Error("EnglishHubViewModel", ex.ToString());
#endif
        }
        finally
        {
            IsLoading = false;
            System.Diagnostics.Debug.WriteLine("EnglishHubViewModel: LoadStateAsync finished");
#if ANDROID
            Android.Util.Log.Info("EnglishHubViewModel", "LoadStateAsync finished");
#endif
        }
    }

    public async Task RefreshAsync()
    {
        await LoadStateAsync();
    }

    private static string ResolveActiveLevel(EnglishHubStateDto state)
    {
        var savedLevel = NormalizeLevelCode(Preferences.Default.Get(SelectedLevelKey, string.Empty));
        if (!string.IsNullOrWhiteSpace(savedLevel) && state.Words.ContainsKey(savedLevel))
        {
            return savedLevel;
        }

        foreach (var preferredLevel in PreferredLevelOrder)
        {
            if (state.Words.ContainsKey(preferredLevel))
            {
                return preferredLevel;
            }
        }

        return state.Words.Keys.FirstOrDefault() ?? "A1";
    }

    private static string NormalizeLevelCode(string level)
    {
        var trimmedLevel = level.Trim();
        var separatorIndex = trimmedLevel.IndexOf(' ');

        return separatorIndex > 0
            ? trimmedLevel[..separatorIndex]
            : trimmedLevel;
    }

    private void PopulateWordItems(EnglishHubStateDto state, string level)
    {
        WordItems.Clear();

        if (state.Words != null && state.Words.TryGetValue(level, out var levelWords))
        {
            foreach (var word in levelWords)
            {
                WordItems.Add(new WordItemDisplay
                {
                    English = word.Ana,
                    Turkish = word.Turkce,
                    ForbiddenWords = string.Join(", ", word.Tabu)
                });
            }
        }

        if (WordItems.Count == 0 && state.Words.Count > 0)
        {
            var fallbackLevel = state.Words.Keys.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(fallbackLevel) && state.Words.TryGetValue(fallbackLevel, out var fallbackWords))
            {
                ActiveLevel = fallbackLevel;
                foreach (var word in fallbackWords)
                {
                    WordItems.Add(new WordItemDisplay
                    {
                        English = word.Ana,
                        Turkish = word.Turkce,
                        ForbiddenWords = string.Join(", ", word.Tabu)
                    });
                }
            }
        }
    }

    private void LoadOfflineFallback(string level)
    {
        WordItems.Clear();

        if (!OfflineFallbackWords.TryGetValue(level, out var items))
        {
            items = OfflineFallbackWords["A1"];
            ActiveLevel = "A1";
        }

        foreach (var item in items)
        {
            WordItems.Add(new WordItemDisplay
            {
                English = item.English,
                Turkish = item.Turkish,
                ForbiddenWords = item.ForbiddenWords,
            });
        }
    }

    protected void OnPropertyChanged([CallerMemberName] string name = null!)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}

public class WordItemDisplay
{
    public string English { get; set; } = string.Empty;
    public string Turkish { get; set; } = string.Empty;
    public string ForbiddenWords { get; set; } = string.Empty;
}

public class AsyncRelayCommand : IAsyncRelayCommand
{
    private readonly Func<Task> _execute;
    private bool _isExecuting;

    public event EventHandler? CanExecuteChanged;

    public AsyncRelayCommand(Func<Task> execute)
    {
        _execute = execute;
    }

    public bool CanExecute(object? parameter) => !_isExecuting;

    public async void Execute(object? parameter)
    {
        if (!CanExecute(parameter)) return;

        _isExecuting = true;
        CanExecuteChanged?.Invoke(this, EventArgs.Empty);

        try
        {
            await _execute();
        }
        finally
        {
            _isExecuting = false;
            CanExecuteChanged?.Invoke(this, EventArgs.Empty);
        }
    }
}

public interface IAsyncRelayCommand : ICommand
{
}
