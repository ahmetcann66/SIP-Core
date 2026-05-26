namespace SipCore.Mobile.Models;

public record ExamDefinition(
    string Key,
    string Title,
    string Category,
    int DefaultQuestionCount,
    int DefaultMinutes,
    string Description);

public record ExamQuestion(
    string ExamKey,
    string Topic,
    string Question,
    string CorrectAnswer,
    IReadOnlyList<string> Options,
    string Explanation);

public record ExamAnswerRecord(
    int QuestionNumber,
    string Question,
    string SelectedAnswer,
    string CorrectAnswer,
    bool IsCorrect,
    string Explanation);

public record ExamSessionRecord(
    Guid Id,
    string ExamKey,
    string ExamTitle,
    DateTimeOffset StartedAt,
    DateTimeOffset CompletedAt,
    int QuestionCount,
    int AnsweredCount,
    int CorrectCount,
    int WrongCount,
    TimeSpan Duration,
    List<ExamAnswerRecord> Answers)
{
    public double Accuracy => QuestionCount <= 0
        ? 0
        : Math.Round((double)CorrectCount / QuestionCount * 100, 1);
}

public record PracticeStatistics(
    int SessionCount,
    int TotalQuestions,
    int CorrectCount,
    int WrongCount,
    TimeSpan TotalDuration,
    double AverageAccuracy,
    int CurrentStreakDays);