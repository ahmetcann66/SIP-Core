using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace SipCore.Mobile.ViewModels;

public class SipCoreViewModel : INotifyPropertyChanged
{
    private string _statusMessage = "SIP Core AI hazır";
    private string _dnaContent = "";
    private string _campaignContent = "";
    private bool _hasDna;
    private bool _hasCampaign;

    public event PropertyChangedEventHandler? PropertyChanged;

    public SipCoreViewModel()
    {
        LoadSavedData();
        
        // Navigation commands
        GoDashboardCommand = new Command(async () =>
        {
            await Shell.Current.GoToAsync("DashboardPage");
        });
        
        GoHistoryCommand = new Command(async () =>
        {
            await Shell.Current.Navigation.PushAsync(new Views.HistoryPage());
        });
        
        GoScoreCommand = new Command(async () =>
        {
            await Shell.Current.Navigation.PushAsync(new Views.ScorePage());
        });
        
        GoExamCommand = new Command(async () =>
        {
            await Shell.Current.Navigation.PushAsync(new Views.ExamPracticePage());
        });

        // SIP Core feature commands
        AnalyzeDnaCommand = new Command(async () => await AnalyzeDnaAsync());
        CreateCampaignCommand = new Command(async () => await CreateCampaignAsync());
        GenerateWorksheetCommand = new Command(async () => await GenerateWorksheetAsync());
        GenerateQuizCommand = new Command(async () => await GenerateQuizAsync());
        UseAiAssistantCommand = new Command(async () => await UseAiAssistantAsync());
        ViewPerformanceCommand = new Command(async () => await ViewPerformanceAsync());
    }

    public string StatusMessage
    {
        get => _statusMessage;
        set { _statusMessage = value; OnPropertyChanged(); }
    }

    public string DnaContent
    {
        get => _dnaContent;
        set { _dnaContent = value; OnPropertyChanged(); }
    }

    public string CampaignContent
    {
        get => _campaignContent;
        set { _campaignContent = value; OnPropertyChanged(); }
    }

    public bool HasDna
    {
        get => _hasDna;
        set { _hasDna = value; OnPropertyChanged(); }
    }

    public bool HasCampaign
    {
        get => _hasCampaign;
        set { _hasCampaign = value; OnPropertyChanged(); }
    }

    // Commands
    public ICommand GoDashboardCommand { get; }
    public ICommand GoHistoryCommand { get; }
    public ICommand GoScoreCommand { get; }
    public ICommand GoExamCommand { get; }
    public ICommand AnalyzeDnaCommand { get; }
    public ICommand CreateCampaignCommand { get; }
    public ICommand GenerateWorksheetCommand { get; }
    public ICommand GenerateQuizCommand { get; }
    public ICommand UseAiAssistantCommand { get; }
    public ICommand ViewPerformanceCommand { get; }

    private void LoadSavedData()
    {
        try
        {
            var dna = Preferences.Default.Get("sip_dna", "");
            if (!string.IsNullOrWhiteSpace(dna))
            {
                DnaContent = dna;
                HasDna = true;
            }

            var campaign = Preferences.Default.Get("sip_campaign", "");
            if (!string.IsNullOrWhiteSpace(campaign))
            {
                CampaignContent = campaign;
                HasCampaign = true;
            }
        }
        catch { }
    }

    private async Task AnalyzeDnaAsync()
    {
        StatusMessage = "Öğrenme DNA analizi yapılıyor...";
        
        // Simulate DNA analysis based on user's progress
        var email = TokenService.GetEmail() ?? "Kullanıcı";
        var engXp = Preferences.Default.Get("eng_xp", 0);
        var sipXp = Preferences.Default.Get("sip_xp", 0);
        
        var dnaResult = $"📊 {email} için Öğrenme DNA Analizi:\n\n" +
                       $"• İngilizce XP: {engXp} - {(engXp > 100 ? "Gelişmiş öğrenici" : "Başlangıç seviyesi")}\n" +
                       $"• SIP XP: {sipXp} - {(sipXp > 100 ? "Aktif çalışan" : "Yeni başlayan")}\n" +
                       $"• Öğrenme stili: Görsel + İşitsel\n" +
                       $"• En güçlü alan: Kelime ezberleme\n" +
                       $"• Geliştirilecek: Gramer yapısı\n\n" +
                       $"💡 Öneri: Günlük 15 dakika flashcard çalışması yap.";

        DnaContent = dnaResult;
        HasDna = true;
        
        // Save to preferences
        Preferences.Default.Set("sip_dna", dnaResult);
        
        StatusMessage = "DNA analizi tamamlandı!";
        
        await Task.Delay(500);
    }

    private async Task CreateCampaignAsync()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        var duration = await page.DisplayActionSheet("Kampanya süresi seç", "İptal", null, "1 Hafta", "2 Hafta", "1 Ay");
        if (string.IsNullOrEmpty(duration) || duration == "İptal")
        {
            StatusMessage = "Kampanya oluşturma iptal edildi";
            return;
        }

        var topic = await page.DisplayPromptAsync("Kampanya Konusu", "Hangi konuda kampanya oluşturmak istiyorsunuz?", "Örneğin: TYT Matematik, İngilizce B1, KPSS Genel Kültür");
        if (string.IsNullOrWhiteSpace(topic))
        {
            StatusMessage = "Konu belirtilmedi";
            return;
        }

        var campaignResult = $"🎯 Kampanya: {topic}\n" +
                            $"📅 Süre: {duration}\n" +
                            $"📋 Günlük hedefler:\n" +
                            $"• 20 kelime ezberle\n" +
                            $"• 1 konu anlatımı izle\n" +
                            $"• 10 soru çöz\n" +
                            $"• Pomodoro ile 1 seans tamamla\n\n" +
                            $"✅ Bu kampanyayı takip etmeye başlamak için Dashboard'a dön.";

        CampaignContent = campaignResult;
        HasCampaign = true;
        
        Preferences.Default.Set("sip_campaign", campaignResult);
        
        StatusMessage = $"{duration} kampanya oluşturuldu!";
    }

    private async Task GenerateWorksheetAsync()
    {
        StatusMessage = "Çalışma kağıdı oluşturuluyor...";
        
        var page = Shell.Current as Page;
        if (page == null) return;

        var topic = await page.DisplayPromptAsync("Çalışma Kağıdı Konusu", "Hangi konu için çalışma kağıdı oluşturulsun?", "Placeholder", "Örneğin: Past Simple Tense");
        if (string.IsNullOrWhiteSpace(topic))
        {
            StatusMessage = "Konu belirtilmedi";
            return;
        }

        var worksheet = $"📝 {topic} - Çalışma Kağıdı\n\n" +
                       $"BÖLÜM 1: Kelime Bilgisi\n" +
                       $"1. ______ (geçmiş zaman) fiilini doğru kullanın.\n" +
                       $"2. Aşağıdaki cümleleri tamamlayın.\n\n" +
                       $"BÖLÜM 2: Gramer\n" +
                       $"1. Time markers (when, while, before, after) kullanın.\n" +
                       $"2. Cümle dönüştürme yapın.\n\n" +
                       $"BÖLÜM 3: Yazma\n" +
                       $"1. 50 kelimelik bir paragraf yazın.\n\n" +
                       $"Cevaplarınızı kontrol edin ve yanlışları tekrar edin.";

        await page.DisplayAlert("Çalışma Kağıdı Hazır", worksheet, "Tamam");
        
        StatusMessage = "Çalışma kağıdı oluşturuldu!";
    }

    private async Task GenerateQuizAsync()
    {
        StatusMessage = "Quiz oluşturuluyor...";
        
        var page = Shell.Current as Page;
        if (page == null) return;

        var topic = await page.DisplayPromptAsync("Quiz Konusu", "Hangi konu için quiz oluşturulsun?", "Placeholder", "Örneğin: Present Perfect");
        if (string.IsNullOrWhiteSpace(topic))
        {
            StatusMessage = "Konu belirtilmedi";
            return;
        }

        var quiz = $"📋 {topic} - Quiz\n\n" +
                  $"Soru 1: Hangi cümle doğru?\n" +
                  $"A) I have gone to school yesterday.\n" +
                  $"B) I went to school yesterday.\n" +
                  $"C) I have went to school.\n\n" +
                  $"Soru 2: Present Perfect kullanın...\n" +
                  $"A) I ___ (live) here since 2020.\n" +
                  $"B) I ___ (live) here in 2020.\n\n" +
                  $"Doğru cevaplar: 1-B, 2-have lived";

        await page.DisplayAlert("Quiz Hazır", quiz, "Tamam");
        
        StatusMessage = "Quiz oluşturuldu!";
    }

    private async Task UseAiAssistantAsync()
    {
        var page = Shell.Current as Page;
        if (page == null) return;

        var question = await page.DisplayPromptAsync("AI Asistan", "Sormak istediğiniz soruyu yazın:", "Placeholder", "Örneğin: 'Present Perfect tense nasıl kullanılır?'");
        if (string.IsNullOrWhiteSpace(question))
        {
            StatusMessage = "Soru belirtilmedi";
            return;
        }

        var answer = $"🤖 AI Asistan Cevabı:\n\n" +
                    $"Soru: {question}\n\n" +
                    $"Cevap:\n" +
                    $"Present Perfect Tense, geçmişte başlayıp hala devam eden veya geçmişte oldu ama etkisi hala süren durumlar için kullanılır.\n\n" +
                    $"📌 Kalıp: Subject + have/has + V3 (past participle)\n\n" +
                    $"Örnekler:\n" +
                    $"• I have lived here for 5 years. (hala yaşıyorum)\n" +
                    $"• She has finished her homework. (bitirdi ve etkisi var)\n\n" +
                    $"🔗 Detaylı açıklama için video izleyin.";

        await page.DisplayAlert("AI Cevabı", answer, "Tamam");
        
        StatusMessage = "AI asistanından cevap alındı!";
    }

    private async Task ViewPerformanceAsync()
    {
        StatusMessage = "Performans verileri yükleniyor...";
        
        var engXp = Preferences.Default.Get("eng_xp", 0);
        var sipXp = Preferences.Default.Get("sip_xp", 0);
        var engLevel = Preferences.Default.Get("eng_level", 1);
        var sipLevel = Preferences.Default.Get("sip_level", 1);
        var streak = Preferences.Default.Get("sip_streak", 0);

        var performance = $"📊 Performans Özeti\n\n" +
                         $"🌍 English Hub:\n" +
                         $"• Seviye: {engLevel}\n" +
                         $"• Toplam XP: {engXp}\n" +
                         $"• Son çalışma: Bugün\n\n" +
                         $"🚀 SIP Dashboard:\n" +
                         $"• Seviye: {sipLevel}\n" +
                         $"• Toplam XP: {sipXp}\n" +
                         $"• Gün Serisi: {streak} gün\n\n" +
                         $"📈 Haftalık hedef: %75 tamamlandı\n" +
                         $"🎯 Bu hafta: 3/4 kampanya tamamlandı";

        var page = Shell.Current as Page;
        if (page != null)
        {
            await page.DisplayAlert("Performans Raporu", performance, "Tamam");
        }
        
        StatusMessage = "Performans görüntülendi!";
    }

    protected void OnPropertyChanged([CallerMemberName] string name = null!)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
