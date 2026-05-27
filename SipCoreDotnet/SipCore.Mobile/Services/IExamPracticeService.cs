using SipCore.Mobile.Models;

namespace SipCore.Mobile.Services;

public interface IExamPracticeService
{
    IReadOnlyList<ExamDefinition> GetAvailableExams();

    IReadOnlyList<ExamQuestion> GetQuestions(string examKey, int questionCount);

    IReadOnlyList<ExamSessionRecord> GetSessions();

    ExamSessionRecord? GetLatestSession();

    PracticeStatistics GetStatistics();

    void SaveSession(ExamSessionRecord session);
}