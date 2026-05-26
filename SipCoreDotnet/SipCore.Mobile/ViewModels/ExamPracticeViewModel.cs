using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using SipCore.Mobile.Models;
using SipCore.Mobile.Services;

namespace SipCore.Mobile.ViewModels;

public class ExamPracticeViewModel : INotifyPropertyChanged
{
    private readonly IExamPracticeService _examPracticeService = new ExamPracticeService();
    private readonly ObservableCollection<ExamQuestion> _questions = new();
    private readonly List<ExamAnswerRecord> _answers = new();

    private ExamDefinition? selectedExam;
    private bool isPracticeActive;
    private int currentQuestionIndex = -1;
    private int correctAnswers;
    private string selectedAnswer = string.Empty;
    private string statusMessage = "Bir sınav seçin, ardından denemeyi başlatın.";
    private string activeLevel = NormalizeLevelCode(Preferences.Default.Get("sip_selected_level", "A1"));

    public event PropertyChangedEventHandler? PropertyChanged;

    public ExamPracticeViewModel()
    {
        Exams = new ObservableCollection<ExamDefinition>(_examPracticeService.GetAvailableExams());

        AnswerOptions = new ObservableCollection<string>();

        SelectExamCommand = new Command<ExamDefinition>(SelectExam);
        StartPracticeCommand = new Command(StartPractice);
        AnswerCommand = new Command<string>(SelectAnswer);
        NextQuestionCommand = new Command(GoNextQuestion);
        GoDashboardCommand = new Command(async () => await Shell.Current.Navigation.PushAsync(new Views.DashboardPage()));
    }

    public ObservableCollection<ExamDefinition> Exams { get; }

    public ObservableCollection<string> AnswerOptions { get; }

    public ICommand SelectExamCommand { get; }

    public ICommand StartPracticeCommand { get; }

    public ICommand AnswerCommand { get; }

    public ICommand NextQuestionCommand { get; }

    public ICommand GoDashboardCommand { get; }

    public ExamDefinition? SelectedExam
    {
        get => selectedExam;
        private set
        {
            selectedExam = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanStartPractice));
            OnPropertyChanged(nameof(SelectedExamTitle));
        }
    }

    public bool IsPracticeActive
    {
        get => isPracticeActive;
        private set
        {
            isPracticeActive = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanStartPractice));
        }
    }

    public string StatusMessage
    {
        get => statusMessage;
        private set
        {
            statusMessage = value;
            OnPropertyChanged();
        }
    }

    public string SelectedExamTitle => SelectedExam is null ? "Seçilmedi" : SelectedExam.Title;

    public string ActiveLevel
    {
        get => activeLevel;
        private set
        {
            activeLevel = value;
            OnPropertyChanged();
        }
    }

    public bool CanStartPractice => SelectedExam is not null && !IsPracticeActive;

    public string ProgressText => currentQuestionIndex < 0
        ? "0 / 0"
        : $"{currentQuestionIndex + 1} / {TotalQuestions}";

    public string CurrentQuestionText =>
        currentQuestionIndex >= 0 && currentQuestionIndex < _questions.Count
            ? _questions[currentQuestionIndex].Question
            : "Henüz soru yok";

    public string SelectedAnswer
    {
        get => selectedAnswer;
        private set
        {
            selectedAnswer = value;
            OnPropertyChanged();
        }
    }

    public int TotalQuestions => _questions.Count;

    public string ResultSummary => IsPracticeActive
        ? "Deneme sürüyor"
        : correctAnswers > 0
            ? $"Doğru: {correctAnswers} / {TotalQuestions}"
            : "Sonuç bekleniyor";

    public void SelectExam(ExamDefinition? exam)
    {
        if (exam is null)
        {
            return;
        }

        SelectedExam = exam;
        StatusMessage = $"{exam.Title} seçildi. Denemeyi başlatabilirsiniz.";
        LoadQuestionsForExam(exam);
    }

    private void StartPractice()
    {
        if (SelectedExam is null)
        {
            StatusMessage = "Önce bir sınav seçin.";
            return;
        }

        if (_questions.Count == 0)
        {
            LoadQuestionsForExam(SelectedExam);
        }

        currentQuestionIndex = 0;
        correctAnswers = 0;
        _answers.Clear();
        IsPracticeActive = true;
        SelectedAnswer = string.Empty;
        RefreshQuestionView();
        StatusMessage = $"{SelectedExam.Title} denemesi başladı. Seviye: {ActiveLevel}";
    }

    private static string NormalizeLevelCode(string level)
    {
        var trimmedLevel = level.Trim();
        var separatorIndex = trimmedLevel.IndexOf(' ');

        return separatorIndex > 0
            ? trimmedLevel[..separatorIndex]
            : trimmedLevel;
    }

    private void SelectAnswer(string? answer)
    {
        if (!IsPracticeActive || currentQuestionIndex < 0 || currentQuestionIndex >= _questions.Count)
        {
            return;
        }

        SelectedAnswer = answer ?? string.Empty;
        var currentQuestion = _questions[currentQuestionIndex];
        RecordAnswer(currentQuestion, SelectedAnswer);

        if (string.Equals(SelectedAnswer, currentQuestion.CorrectAnswer, StringComparison.OrdinalIgnoreCase))
        {
            correctAnswers++;
            StatusMessage = "Doğru cevap.";
        }
        else
        {
            StatusMessage = $"Yanlış. Doğru cevap: {currentQuestion.CorrectAnswer}";
        }
    }

    private void GoNextQuestion()
    {
        if (!IsPracticeActive)
        {
            return;
        }

        if (currentQuestionIndex < _questions.Count - 1)
        {
            currentQuestionIndex++;
            SelectedAnswer = string.Empty;
            RefreshQuestionView();
            StatusMessage = $"{ProgressText} soruya geçildi.";
            return;
        }

        IsPracticeActive = false;
        SaveCompletedSession();
        StatusMessage = $"Deneme tamamlandı. {ResultSummary}";
        OnPropertyChanged(nameof(ResultSummary));
        OnPropertyChanged(nameof(CanStartPractice));
    }

    private void LoadQuestionsForExam(ExamDefinition exam)
    {
        _questions.Clear();
        _questions.AddRange(_examPracticeService.GetQuestions(exam.Key, exam.DefaultQuestionCount));
        OnPropertyChanged(nameof(TotalQuestions));
        OnPropertyChanged(nameof(ProgressText));
        OnPropertyChanged(nameof(CurrentQuestionText));
        OnPropertyChanged(nameof(ResultSummary));
    }

    private void RefreshQuestionView()
    {
        AnswerOptions.Clear();

        if (currentQuestionIndex < 0 || currentQuestionIndex >= _questions.Count)
        {
            OnPropertyChanged(nameof(CurrentQuestionText));
            OnPropertyChanged(nameof(ProgressText));
            return;
        }

        var currentQuestion = _questions[currentQuestionIndex];
        foreach (var option in currentQuestion.Options)
        {
            AnswerOptions.Add(option);
        }

        OnPropertyChanged(nameof(CurrentQuestionText));
        OnPropertyChanged(nameof(ProgressText));
        OnPropertyChanged(nameof(ResultSummary));
    }

    private void RecordAnswer(ExamQuestion question, string answer)
    {
        var isCorrect = string.Equals(answer, question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
        var record = new ExamAnswerRecord(
            currentQuestionIndex + 1,
            question.Question,
            answer,
            question.CorrectAnswer,
            isCorrect,
            question.Explanation);

        if (_answers.Count > currentQuestionIndex)
        {
            _answers[currentQuestionIndex] = record;
        }
        else
        {
            _answers.Add(record);
        }
    }

    private void SaveCompletedSession()
    {
        if (SelectedExam is null || _questions.Count == 0)
        {
            return;
        }

        var session = new ExamSessionRecord(
            Guid.NewGuid(),
            SelectedExam.Key,
            SelectedExam.Title,
            DateTimeOffset.Now.AddMinutes(-Math.Max(1, SelectedExam.DefaultMinutes)),
            DateTimeOffset.Now,
            _questions.Count,
            _answers.Count(record => !string.IsNullOrWhiteSpace(record.SelectedAnswer)),
            correctAnswers,
            Math.Max(0, _answers.Count(record => !record.IsCorrect && !string.IsNullOrWhiteSpace(record.SelectedAnswer))),
            TimeSpan.FromMinutes(SelectedExam.DefaultMinutes),
            _answers.ToList());

        _examPracticeService.SaveSession(session);
    }

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
}

internal static class ObservableCollectionExtensions
{
    public static void AddRange<T>(this ObservableCollection<T> collection, IEnumerable<T> items)
    {
        foreach (var item in items)
        {
            collection.Add(item);
        }
    }
}