using System.Text.Json;
using SipCore.Mobile.Models;

namespace SipCore.Mobile.Services;

public class ExamPracticeService : IExamPracticeService
{
    private const string StorageKey = "sipcore.exam.sessions.v1";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    private static readonly IReadOnlyList<ExamDefinition> ExamDefinitions = new[]
    {
        new ExamDefinition("tyt-turkce", "TYT Türkçe", "TYT", 10, 10, "Temel dil bilgisi ve okuma becerileri"),
        new ExamDefinition("tyt-matematik", "TYT Matematik", "TYT", 10, 10, "Sayısal işlemler ve problem çözme"),
        new ExamDefinition("ayt-edebiyat", "AYT Edebiyat", "AYT", 10, 12, "Konu ve yazar odaklı deneme"),
        new ExamDefinition("ayt-matematik", "AYT Matematik", "AYT", 10, 12, "Fonksiyonlar, limit ve türev"),
        new ExamDefinition("genel-karma", "Genel Karma", "Karma", 10, 15, "Farklı derslerden karışık deneme")
    };

    private static readonly IReadOnlyList<ExamQuestion> QuestionBank = new[]
    {
        new ExamQuestion("tyt-turkce", "Dil Bilgisi", "Aşağıdakilerden hangisi bir sözcük türüdür?", "Fiil", ["Hece", "Fiil", "Nokta", "Cümle"], "Fiil bir sözcük türüdür."),
        new ExamQuestion("tyt-turkce", "Dil Bilgisi", "'Kalem' kelimesinin çoğulu hangisidir?", "Kalemler", ["Kalemler", "Kalemın", "Kalemlar", "Kalemları"], "Çoğul eki '-ler' kullanılır."),
        new ExamQuestion("tyt-turkce", "Sözcük Bilgisi", "'Hızlıca koştu.' cümlesinde zarf hangisidir?", "Hızlıca", ["Koştu", "Hızlıca", "Cümle", "Koş"], "'Hızlıca' durum zarfıdır."),
        new ExamQuestion("tyt-turkce", "Paragraf", "Bir metnin ana fikri neyi ifade eder?", "Verilmek istenen temel düşünce", ["Kısa özet", "Yan düşünce", "Verilmek istenen temel düşünce", "Başlık sayısı"], "Ana fikir metnin temel mesajıdır."),

        new ExamQuestion("tyt-matematik", "Temel İşlemler", "2x + 4 = 10 ise x kaçtır?", "3", ["2", "3", "4", "5"], "2x = 6 olur, x = 3.") ,
        new ExamQuestion("tyt-matematik", "Geometri", "Bir üçgenin iç açılar toplamı kaç derecedir?", "180", ["90", "120", "180", "360"], "Üçgenin iç açıları toplamı 180 derecedir."),
        new ExamQuestion("tyt-matematik", "Temel İşlemler", "7 x 8 kaçtır?", "56", ["48", "54", "56", "64"], "7 ile 8'in çarpımı 56'dır."),
        new ExamQuestion("tyt-matematik", "Problemler", "Bir otobüste 24 yolcu vardı, 6 yolcu indi. Kaç yolcu kaldı?", "18", ["16", "17", "18", "19"], "24 - 6 = 18."),

        new ExamQuestion("ayt-edebiyat", "Divan", "Divan edebiyatında gazelin temel konusu nedir?", "Aşk", ["Savaş", "Aşk", "Tarih", "Doğa"], "Gazel çoğunlukla aşk ve sevgili temalıdır."),
        new ExamQuestion("ayt-edebiyat", "Tanzimat", "Tanzimat edebiyatı hangi yüzyılda başlar?", "19", ["17", "18", "19", "20"], "Tanzimat edebiyatı 19. yüzyılda başlar."),
        new ExamQuestion("ayt-edebiyat", "Söz Sanatları", "Kişileştirme hangi söz sanatıdır?", "Söz Sanatı", ["Nazım Birimi", "Söz Sanatı", "Redif", "Kafiye"], "Kişileştirme bir söz sanatıdır."),
        new ExamQuestion("ayt-edebiyat", "Cumhuriyet", "Nazım Hikmet hangi edebiyat döneminde değerlendirilir?", "Cumhuriyet", ["Divan", "Tanzimat", "Servetifünun", "Cumhuriyet"], "Nazım Hikmet Cumhuriyet dönemi sanatçısıdır."),

        new ExamQuestion("ayt-matematik", "Fonksiyonlar", "f(x)=x^2 ise f(3) kaçtır?", "9", ["6", "8", "9", "12"], "3^2 = 9."),
        new ExamQuestion("ayt-matematik", "Limit", "x 2'ye yaklaşırken (x-2)/(x-2) limit değeri nedir?", "1", ["0", "1", "2", "Tanımsız"], "x≠2 iken ifade 1'e eşittir."),
        new ExamQuestion("ayt-matematik", "Türev", "x^2 fonksiyonunun türevi nedir?", "2x", ["x", "2x", "x^2", "2"], "Üs kuralına göre türev 2x olur."),
        new ExamQuestion("ayt-matematik", "Analitik", "Orijin noktasının koordinatları nedir?", "(0,0)", ["(1,1)", "(0,0)", "(-1,0)", "(0,1)"], "Orijin (0,0) noktasıdır."),

        new ExamQuestion("genel-karma", "Karma", "Suyun kimyasal formülü nedir?", "H2O", ["CO2", "H2O", "O2", "NaCl"], "Su H2O formülüne sahiptir."),
        new ExamQuestion("genel-karma", "Karma", "Dünyanın uydusunun adı nedir?", "Ay", ["Mars", "Ay", "Güneş", "Venüs"], "Dünyanın doğal uydusu Ay'dır."),
        new ExamQuestion("genel-karma", "Karma", "Atatürk'ün doğum yeri hangisidir?", "Selanik", ["Ankara", "Selanik", "İstanbul", "Bursa"], "Atatürk Selanik'te doğmuştur."),
        new ExamQuestion("genel-karma", "Karma", "Türkiye'nin başkenti neresidir?", "Ankara", ["İzmir", "Ankara", "İstanbul", "Bursa"], "Türkiye'nin başkenti Ankara'dır.")
    };

    public IReadOnlyList<ExamDefinition> GetAvailableExams() => ExamDefinitions;

    public IReadOnlyList<ExamQuestion> GetQuestions(string examKey, int questionCount)
    {
        var filteredQuestions = QuestionBank.Where(question =>
            string.Equals(question.ExamKey, examKey, StringComparison.OrdinalIgnoreCase)).ToList();

        if (filteredQuestions.Count == 0)
        {
            return Array.Empty<ExamQuestion>();
        }

        return filteredQuestions.Take(Math.Max(1, questionCount)).ToList();
    }

    public IReadOnlyList<ExamSessionRecord> GetSessions()
    {
        return LoadSessions().OrderByDescending(session => session.CompletedAt).ToList();
    }

    public ExamSessionRecord? GetLatestSession()
    {
        return GetSessions().FirstOrDefault();
    }

    public PracticeStatistics GetStatistics()
    {
        var sessions = GetSessions();
        var totalQuestions = sessions.Sum(session => session.QuestionCount);
        var correctCount = sessions.Sum(session => session.CorrectCount);
        var wrongCount = sessions.Sum(session => session.WrongCount);
        var totalDuration = TimeSpan.FromSeconds(sessions.Sum(session => session.Duration.TotalSeconds));
        var averageAccuracy = totalQuestions <= 0
            ? 0
            : Math.Round((double)correctCount / totalQuestions * 100, 1);

        return new PracticeStatistics(
            sessions.Count,
            totalQuestions,
            correctCount,
            wrongCount,
            totalDuration,
            averageAccuracy,
            CalculateStreakDays(sessions));
    }

    public void SaveSession(ExamSessionRecord session)
    {
        var sessions = LoadSessions().ToList();
        sessions.Insert(0, session);

        while (sessions.Count > 20)
        {
            sessions.RemoveAt(sessions.Count - 1);
        }

        var serialized = JsonSerializer.Serialize(sessions, JsonOptions);
        Preferences.Default.Set(StorageKey, serialized);
    }

    private static List<ExamSessionRecord> LoadSessions()
    {
        var serialized = Preferences.Default.Get(StorageKey, string.Empty);

        if (string.IsNullOrWhiteSpace(serialized))
        {
            return new List<ExamSessionRecord>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<ExamSessionRecord>>(serialized, JsonOptions) ?? new List<ExamSessionRecord>();
        }
        catch
        {
            return new List<ExamSessionRecord>();
        }
    }

    private static int CalculateStreakDays(IReadOnlyList<ExamSessionRecord> sessions)
    {
        var orderedDates = sessions
            .Select(session => session.CompletedAt.Date)
            .Distinct()
            .OrderByDescending(date => date)
            .ToList();

        if (orderedDates.Count == 0)
        {
            return 0;
        }

        var streak = 1;
        var currentDate = orderedDates[0];

        for (var i = 1; i < orderedDates.Count; i++)
        {
            if (orderedDates[i] == currentDate.AddDays(-1))
            {
                streak++;
                currentDate = orderedDates[i];
                continue;
            }

            break;
        }

        return streak;
    }
}