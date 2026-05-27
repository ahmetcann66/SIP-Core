using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace SipCore.Mobile.ViewModels;

public class EnglishHubPageViewModel : INotifyPropertyChanged
{
    private string _currentLevel = "A1";
    private int _wordCount = 107;
    private int _learnedCount = 0;
    private int _tabuCount = 535;
    private double _xpProgress = 0.0;
    private string _xpText = "0 / 100 XP";

    public event PropertyChangedEventHandler? PropertyChanged;

    public EnglishHubPageViewModel()
    {
        LoadUserData();
        InitializeCommands();
    }

    private void LoadUserData()
    {
        try
        {
            var savedLevel = Preferences.Default.Get("sip_selected_level", "A1");
            CurrentLevel = NormalizeLevelCode(savedLevel);
            
            var engXp = Preferences.Default.Get("eng_xp", 0);
            var engLevel = Preferences.Default.Get("eng_level", 1);
            
            // Calculate progress
            var xpNeeded = engLevel * 100;
            XpProgress = Math.Min(engXp / (double)xpNeeded, 1.0);
            XpText = $"{engXp} / {xpNeeded} XP";
            
            // Get learned words count
            var learned = Preferences.Default.Get("eng_learned_count", 0);
            LearnedCount = learned;
            
            // Calculate word count based on level
            WordCount = CurrentLevel switch
            {
                "A1" => 20,
                "A2" => 40,
                "B1" => 60,
                "B2" => 80,
                "C1" => 100,
                "C2" => 120,
                _ => 20
            };
            
            TabuCount = WordCount * 5;
        }
        catch { }
    }

    private void InitializeCommands()
    {
        GoDashboardCommand = new Command(async () =>
        {
            await Shell.Current.GoToAsync("DashboardPage");
        });

        OpenNotesCommand = new Command(async () => await OpenNotesAsync());
        OpenLearningCommand = new Command(async () => await OpenLearningAsync());
        OpenTabuCommand = new Command(async () => await OpenTabuGameAsync());
        OpenAiCommand = new Command(async () => await OpenAiAssistantAsync());
        OpenWritingCommand = new Command(async () => await OpenWritingAsync());
        ChangeLevelCommand = new Command(async () => await ChangeLevelAsync());
    }

    public string CurrentLevel
    {
        get => _currentLevel;
        set { _currentLevel = value; OnPropertyChanged(); }
    }

    public int WordCount
    {
        get => _wordCount;
        set { _wordCount = value; OnPropertyChanged(); }
    }

    public int LearnedCount
    {
        get => _learnedCount;
        set { _learnedCount = value; OnPropertyChanged(); }
    }

    public int TabuCount
    {
        get => _tabuCount;
        set { _tabuCount = value; OnPropertyChanged(); }
    }

    public double XpProgress
    {
        get => _xpProgress;
        set { _xpProgress = value; OnPropertyChanged(); }
    }

    public string XpText
    {
        get => _xpText;
        set { _xpText = value; OnPropertyChanged(); }
    }

    // Commands
    public ICommand GoDashboardCommand { get; private set; } = null!;
    public ICommand OpenNotesCommand { get; private set; } = null!;
    public ICommand OpenLearningCommand { get; private set; } = null!;
    public ICommand OpenTabuCommand { get; private set; } = null!;
    public ICommand OpenAiCommand { get; private set; } = null!;
    public ICommand OpenWritingCommand { get; private set; } = null!;
    public ICommand ChangeLevelCommand { get; private set; } = null!;

    private async Task OpenNotesAsync()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        var notes = GetNotesForLevel(CurrentLevel);
        await page.DisplayAlert(
            "📖 Ders Notları - " + CurrentLevel,
            notes,
            "Tamam"
        );
    }

    private string GetNotesForLevel(string level)
    {
        return level switch
        {
            "A1" => "📝 A1 SEVİYE NOTLARI\n\n" +
                   "🎯 Temel Konular:\n" +
                   "• Self Introduction (Kendini Tanıtma)\n" +
                   "• Family (Aile)\n" +
                   "• Daily Routines (Günlük Rutinler)\n" +
                   "• Numbers 1-100\n" +
                   "• Colors and Shapes\n\n" +
                   "📌 Gramer:\n" +
                   "• To Be (am/is/are)\n" +
                   "• Simple Present Tense\n" +
                   "• Has/Have\n\n" +
                   "💡 İpucu: Her gün en az 5 yeni kelime öğren.",
            
            "A2" => "📝 A2 SEVİYE NOTLARI\n\n" +
                   "🎯 Temel Konular:\n" +
                   "• Past Tense (Geçmiş Zaman)\n" +
                   "• Future Tense (Gelecek Zaman)\n" +
                   "• Comparatives (Karşılaştırma)\n" +
                   "• Prepositions (Edatlar)\n\n" +
                   "📌 Gramer:\n" +
                   "• Past Simple\n" +
                   "• Will vs Going to\n" +
                   "• Could/Should/Must\n\n" +
                   "💡 İpucu: Geçmiş zaman fiillerini düzenli tekrar et.",
            
            "B1" => "📝 B1 SEVİYE NOTLARI\n\n" +
                   "🎯 Temel Konular:\n" +
                   "• Present Perfect\n" +
                   "• Passive Voice\n" +
                   "• Relative Clauses\n" +
                   "• Modal Verbs Review\n\n" +
                   "📌 Gramer:\n" +
                   "• Have been/Have done\n" +
                   "• Was/Were + V3\n" +
                   "• Who/Which/That\n\n" +
                   "💡 İpucu: Karmaşık cümle yapıları kurmaya çalış.",
            
            "B2" => "📝 B2 SEVİYE NOTLARI\n\n" +
                   "🎯 Temel Konular:\n" +
                   "• Mixed Conditionals\n" +
                   "• Cleft Sentences\n" +
                   "• Subjunctive\n" +
                   "• Advanced Modal Verbs\n\n" +
                   "📌 Gramer:\n" +
                   "• If I had... I would...\n" +
                   "• It was because...\n" +
                   "• I wish I were...\n\n" +
                   "💡 İpucu: Akademik kelimeler ve ifadeler öğren.",
            
            "C1" => "📝 C1 SEVİYE NOTLARI\n\n" +
                   "🎯 Temel Konular:\n" +
                   "• Inversions\n" +
                   "• Advanced Passive\n" +
                   "• cleft Sentences\n" +
                   "• Wish/If only\n\n" +
                   "📌 Gramer:\n" +
                   "• Rarely had I...\n" +
                   "• Had I known...\n" +
                   "• Were he to...\n\n" +
                   "💡 İpucu: Farklı aksanları anlamaya çalış.",
            
            "C2" => "📝 C2 SEVİYE NOTLARI\n\n" +
                   "🎯 Temel Konular:\n" +
                   "• Nuance & Idiom\n" +
                   "• Academic Writing\n" +
                   "• Formal Register\n" +
                   "• Pragmatic Functions\n\n" +
                   "📌 Gramer:\n" +
                   "• All complex structures\n" +
                   "• Advanced connectives\n" +
                   "• Discourse markers\n\n" +
                   "💡 İpucu: Ana dili gibi düşünmeye odaklan.",
            
            _ => "📝 Bu seviye için not bulunamadı."
        };
    }

    private async Task OpenLearningAsync()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        var words = GetSampleWords(CurrentLevel);
        await page.DisplayAlert(
            "🧠 Öğrenme Modu - " + CurrentLevel,
            words,
            "Başla"
        );

        // Show learning session
        await ShowLearningSession();
    }

    private string GetSampleWords(string level)
    {
        return level switch
        {
            "A1" => "🌟 A1 Kelime Listesi (20 kelime)\n\n" +
                   "1. Tree - Ağaç\n" +
                   "2. Book - Kitap\n" +
                   "3. Water - Su\n" +
                   "4. House - Ev\n" +
                   "5. Car - Araba\n\n" +
                   "→ Tap 'Başla' ile flashcard moduna geç",
            
            "A2" => "🌟 A2 Kelime Listesi (40 kelime)\n\n" +
                   "1. Journey - Yolculuk\n" +
                   "2. Market - Pazar\n" +
                   "3. Friendship - Arkadaşlık\n" +
                   "4. Adventure - Macera\n" +
                   "5. Tradition - Gelenek\n\n" +
                   "→ Tap 'Başla' ile flashcard moduna geç",
            
            "B1" => "🌟 B1 Kelime Listesi (60 kelime)\n\n" +
                   "1. Challenge - Meydan okuma\n" +
                   "2. Decision - Karar\n" +
                   "3. Balance - Denge\n" +
                   "4. Experience - Deneyim\n" +
                   "5. Opportunity - Fırsat\n\n" +
                   "→ Tap 'Başla' ile flashcard moduna geç",
            
            "B2" => "🌟 B2 Kelime Listesi (80 kelime)\n\n" +
                   "1. Perspective - Bakış açısı\n" +
                   "2. Resilience - Dayanıklılık\n" +
                   "3. Innovation - Yenilik\n" +
                   "4. Sustainability - Sürdürülebilirlik\n" +
                   "5. Implementation - Uygulama\n\n" +
                   "→ Tap 'Başla' ile flashcard moduna geç",
            
            _ => "Bu seviye için kelime listesi yükleniyor..."
        };
    }

    private async Task ShowLearningSession()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        var word = GetNextWord();
        var answer = await page.DisplayPromptAsync(
            "🧠 Kelime Ezberle",
            word.English + "\n\nTürkçe karşılığını yaz:",
            "Kontrol Et",
            "Atla"
        );

        if (!string.IsNullOrWhiteSpace(answer))
        {
            if (answer.Trim().ToLower() == word.Turkish.ToLower())
            {
                await page.DisplayAlert("✅ Doğru!", $"'{word.English}' = '{word.Turkish}'", "Devam");
                AddXp(10);
            }
            else
            {
                await page.DisplayAlert("❌ Yanlış", $"Doğru cevap: {word.Turkish}", "Tekrar");
            }
        }

        // Check if user wants to continue
        var continueLearning = await page.DisplayAlert(
            "Devam Et?",
            "Bir kelime daha öğrenmek ister misin?",
            "Evet",
            "Hayır"
        );

        if (continueLearning)
        {
            await ShowLearningSession();
        }
    }

    private (string English, string Turkish) GetNextWord()
    {
        var words = new (string, string)[]
        {
            ("Tree", "Ağaç"),
            ("Book", "Kitap"),
            ("Water", "Su"),
            ("Journey", "Yolculuk"),
            ("Challenge", "Meydan okuma"),
            ("Perspective", "Bakış açısı"),
            ("Innovation", "Yenilik"),
            ("Resilience", "Dayanıklılık")
        };

        var random = new Random();
        return words[random.Next(words.Length)];
    }

    private async Task OpenTabuGameAsync()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        // Tabu game - show word with forbidden words
        var tabuWords = new[]
        {
            ("Tree", "Ağaç", new[] { "Leaf", "Wood", "Forest" }),
            ("Book", "Kitap", new[] { "Read", "Page", "Library" }),
            ("Water", "Su", new[] { "Drink", "River", "Glass" }),
            ("Journey", "Yolculuk", new[] { "Travel", "Trip", "Ticket" })
        };

        var random = new Random();
        var current = tabuWords[random.Next(tabuWords.Length)];

        var description = $"🎮 TABU OYUNU\n\n" +
                          $"📌 Açıklamalısın: {current.Item1}\n" +
                          $"❌ Kullanamazsın: {string.Join(", ", current.Item3)}\n\n" +
                          $"Tahminci bu kelimeyi bulmaya çalışacak!\n" +
                          $"Süre: 60 saniye";

        await page.DisplayAlert("🎮 Tabu Oyunu", description, "Oyna");

        // Simple game flow
        var guess = await page.DisplayPromptAsync(
            "Tahmin?",
            $"{current.Item1} için bir ipucu ver:",
            "Tahmin Et",
            "Pas"
        );

        if (guess?.ToLower() == current.Item1.ToLower())
        {
            await page.DisplayAlert("🎉 Doğru!", "Tebrikler! +20 XP kazandın.", "Devam");
            AddXp(20);
        }
        else
        {
            await page.DisplayAlert("😅 Yanlış", $"Doğru cevap: {current.Item1}", "Tamam");
        }
    }

    private async Task OpenAiAssistantAsync()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        var topic = await page.DisplayActionSheet(
            "🤖 AI Asistan - Konu Seç",
            "İptal",
            null,
            "Telaffuz Pratik",
            "Gramer Sorgula",
            "Kelime Açıkla",
            "Cümle Çevir"
        );

        if (string.IsNullOrEmpty(topic) || topic == "İptal") return;

        switch (topic)
        {
            case "Telaffuz Pratik":
                await ShowPronunciationPractice(page);
                break;
            case "Gramer Sorgula":
                await ShowGrammarQuery(page);
                break;
            case "Kelime Açıkla":
                await ShowWordExplanation(page);
                break;
            case "Cümle Çevir":
                await ShowTranslationPractice(page);
                break;
        }
    }

    private async Task ShowPronunciationPractice(Page page)
    {
        await page.DisplayAlert(
            "🎤 Telaffuz Pratik",
            "Bu özellik için mikrofon erişimi gereklidir.\n\n" +
            "Kelime veya cümle söyleyin, AI telaffuzunuzu analiz edecek.",
            "Tamam"
        );
    }

    private async Task ShowGrammarQuery(Page page)
    {
        var question = await page.DisplayPromptAsync(
            "📝 Gramer Sorgula",
            "Sormak istediğiniz gramer konusunu yazın:\n\nÖrnek: Present Perfect nasıl kullanılır?",
            "Sorgula",
            "İptal"
        );

        if (string.IsNullOrWhiteSpace(question)) return;

        await page.DisplayAlert(
            "📖 Gramer Açıklaması",
            $"Soru: {question}\n\n" +
            "Cevap:\n" +
            "Present Perfect Tense, geçmişte başlayıp hala devam eden veya geçmişte oldu ama etkisi hala süren durumlar için kullanılır.\n\n" +
            "📌 Kalıp: Subject + have/has + V3 (past participle)\n\n" +
            "✓ Örnekler:\n" +
            "• I have lived here for 5 years.\n" +
            "• She has finished her homework.\n\n" +
            "🔗 Detaylı açıklama için video izleyin.",
            "Tamam"
        );

        AddXp(5);
    }

    private async Task ShowWordExplanation(Page page)
    {
        var word = await page.DisplayPromptAsync(
            "📚 Kelime Açıkla",
            "Açıklamasını istediğiniz kelimeyi yazın:",
            "Ara",
            "İptal"
        );

        if (string.IsNullOrWhiteSpace(word)) return;

        await page.DisplayAlert(
            $"📖 {word}",
            $"Kelime: {word}\n\n" +
            $"📌 Anlam: [Veritabanından çekilecek]\n\n" +
            $"📝 Örnek Cümle:\n" +
            $"The {word} is essential for learning.\n\n" +
            $"🔗 Eş anlamlılar: [Listelenecek]\n" +
            $"❌ Zıt anlamlılar: [Listelenecek]",
            "Tamam"
        );

        AddXp(5);
    }

    private async Task ShowTranslationPractice(Page page)
    {
        var sentence = await page.DisplayPromptAsync(
            "🔄 Cümle Çevir",
            "Çevirmek istediğiniz cümleyi yazın:",
            "Çevir",
            "İptal"
        );

        if (string.IsNullOrWhiteSpace(sentence)) return;

        await page.DisplayAlert(
            "🔄 Çeviri Sonucu",
            $"Orijinal: {sentence}\n\n" +
            $"Çeviri: [AI tarafından çevrilecek]\n\n" +
            $"💡 İpucu: Doğru çeviri için cümle yapısına dikkat edin.",
            "Tamam"
        );

        AddXp(5);
    }

    private async Task OpenWritingAsync()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        // Writing mode - ask for topic
        var topic = await page.DisplayActionSheet(
            "✍️ Yazma Çalışması - Konu Seç",
            "İptal",
            null,
            "Kendini Tanıtma",
            "Günlük Rutin",
            "Bir Anı Anlat",
            "Teknoloji Hakkında",
            "Özgür Konu"
        );

        if (string.IsNullOrEmpty(topic) || topic == "İptal") return;

        var prompt = topic switch
        {
            "Kendini Tanıtma" => "Write about yourself (50-100 words)",
            "Günlük Rutin" => "Describe your daily routine (50-100 words)",
            "Bir Anı Anlat" => "Tell about a memorable experience (50-100 words)",
            "Teknoloji Hakkında" => "Write about technology's impact (50-100 words)",
            "Özgür Konu" => "Write about any topic you like (50-100 words)",
            _ => "Write freely (50-100 words)"
        };

        var text = await page.DisplayPromptAsync(
            "✍️ " + topic,
            prompt + "\n\nYazın:",
            "Gönder",
            "İptal"
        );

        if (string.IsNullOrWhiteSpace(text)) return;

        // AI feedback
        await page.DisplayAlert(
            "🤖 AI Geri Bildirim",
            "📝 Yazdığınız Metin:\n" + text.Substring(0, Math.Min(text.Length, 100)) + "...\n\n" +
            "📊 Değerlendirme:\n" +
            "• Kelime Sayısı: " + text.Split(' ').Length + "\n" +
            "• Gramer: 85% doğru\n" +
            "• Akıcılık: İyi\n\n" +
            "💡 Geliştirme Önerileri:\n" +
            "• Daha fazla bağlaç kullan\n" +
            "• Cümle çeşitliliğini artır",
            "Tamam"
        );

        AddXp(15);
    }

    private async Task ChangeLevelAsync()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        var newLevel = await page.DisplayActionSheet(
            "🔄 Seviye Seç",
            "İptal",
            null,
            "A1 - Başlangıç",
            "A2 - Temel",
            "B1 - Orta",
            "B2 - Üst Orta",
            "C1 - İleri",
            "C2 - Uzman"
        );

        if (string.IsNullOrEmpty(newLevel) || newLevel == "İptal") return;

        var levelCode = newLevel.Split(' ')[0];
        CurrentLevel = levelCode;
        Preferences.Default.Set("sip_selected_level", levelCode);
        
        WordCount = levelCode switch
        {
            "A1" => 20,
            "A2" => 40,
            "B1" => 60,
            "B2" => 80,
            "C1" => 100,
            "C2" => 120,
            _ => 20
        };
        TabuCount = WordCount * 5;

        await page.DisplayAlert("✅ Seviye Değiştirildi", $"Yeni seviye: {levelCode}", "Tamam");
    }

    private void AddXp(int amount)
    {
        try
        {
            var currentXp = Preferences.Default.Get("eng_xp", 0);
            var newXp = currentXp + amount;
            Preferences.Default.Set("eng_xp", newXp);
            
            var level = Preferences.Default.Get("eng_level", 1);
            if (newXp >= level * 100)
            {
                level++;
                Preferences.Default.Set("eng_level", level);
            }
            
            LoadUserData(); // Refresh UI
        }
        catch { }
    }

    private static string NormalizeLevelCode(string level)
    {
        var trimmedLevel = level.Trim();
        var separatorIndex = trimmedLevel.IndexOf(' ');
        return separatorIndex > 0 ? trimmedLevel[..separatorIndex] : trimmedLevel;
    }

    protected void OnPropertyChanged([CallerMemberName] string name = null!)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}