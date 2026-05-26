using System.Collections.Generic;

namespace SipCore.Core.Models;

public class Student : BaseEntity
{
    // Private backing fields + properties for encapsulation
    private string _name = string.Empty;
    private string _email = string.Empty;

    public string Name
    {
        get => _name;
        set => _name = value ?? string.Empty;
    }

    public string Email
    {
        get => _email;
        set
        {
            if (string.IsNullOrWhiteSpace(value)) throw new System.ArgumentException("Email boş olamaz");
            _email = value;
        }
    }

    // Collection usage
    public List<StudyHistory> Histories { get; } = new();

    public Student() : base() { }

    public Student(long id, string name, string email) : base(id)
    {
        Name = name;
        Email = email;
    }

    public override string GetDisplayLabel() => $"Student[{Id}] {Name} <{Email}>";
}
