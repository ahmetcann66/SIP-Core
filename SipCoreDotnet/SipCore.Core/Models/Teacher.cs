namespace SipCore.Core.Models;

public class Teacher : BaseEntity
{
    private string _name = string.Empty;
    private string _classCode = string.Empty;

    public string Name
    {
        get => _name;
        set => _name = value ?? string.Empty;
    }

    public string ClassCode
    {
        get => _classCode;
        set => _classCode = value ?? string.Empty;
    }

    public Teacher() : base() { }

    public Teacher(long id, string name, string classCode) : base(id)
    {
        Name = name;
        ClassCode = classCode;
    }

    public override string GetDisplayLabel() => $"Teacher[{Id}] {Name} (Sınıf: {ClassCode})";
}
