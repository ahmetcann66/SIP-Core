using Microsoft.AspNetCore.Mvc;
using SipCore.Core.Models;

namespace SipCore.Api.Controllers;

/// <summary>
/// Domain modellerinin (Student, Teacher) OOP hiyerarşisini gösteren örnek uç noktalar.
/// </summary>
[ApiController]
[Route("api/domain")]
public class DomainEntitiesController : ControllerBase
{
    [HttpGet("students/sample")]
    public ActionResult<IEnumerable<object>> GetSampleStudents()
    {
        var samples = new List<Student>
        {
            new(1, "Demo Öğrenci", "demo@sipcore.local"),
            new(2, "Ayşe Yılmaz", "ayse@example.com"),
        };
        return Ok(samples.Select(s => new { s.Id, s.Name, s.Email, Label = s.GetDisplayLabel() }));
    }

    [HttpGet("teachers/sample")]
    public ActionResult<IEnumerable<object>> GetSampleTeachers()
    {
        var samples = new List<Teacher>
        {
            new(1, "Demo Öğretmen", "SINIF-A1"),
        };
        return Ok(samples.Select(t => new { t.Id, t.Name, t.ClassCode, Label = t.GetDisplayLabel() }));
    }
}
