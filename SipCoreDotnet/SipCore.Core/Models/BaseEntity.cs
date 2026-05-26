namespace SipCore.Core.Models;

/// <summary>
/// Ortak varlık tabanı: kapsülleme, kalıtım ve polimorfizm (virtual/override) için temel sınıf.
/// </summary>
public abstract class BaseEntity
{
    private long _id;

    public long Id
    {
        get => _id;
        protected set => _id = value;
    }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    protected BaseEntity()
    {
    }

    protected BaseEntity(long id)
    {
        _id = id;
    }

    /// <summary>Polimorfik özet metin; türev sınıflar override eder.</summary>
    public virtual string GetDisplayLabel() => $"Entity[{Id}]";

    public override string ToString() => GetDisplayLabel();

    public void TouchUpdated() => UpdatedAt = DateTime.UtcNow;
}
