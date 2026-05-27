namespace SipCore.Core.Models;

public class StudyHistory : BaseEntity
{
    public long StudentId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public int Minutes { get; set; }

    public StudyHistory() : base() { }

    public StudyHistory(long id, long studentId, string subject, string topic, int minutes) : base(id)
    {
        StudentId = studentId;
        Subject = subject;
        Topic = topic;
        Minutes = minutes;
    }

    public override string GetDisplayLabel() =>
        $"StudyHistory[{Id}] Öğrenci={StudentId}, {Subject}/{Topic}, {Minutes} dk";
}
