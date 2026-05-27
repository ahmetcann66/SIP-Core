using System.Collections.Generic;

namespace SipCore.Core.DTOs;

public class EnglishHubStateDto
{
    public Dictionary<string, List<WordItemDto>> Words { get; set; } = new();
    public Dictionary<string, string> Notes { get; set; } = new();
    public Dictionary<string, Dictionary<string, List<string>>> Curriculum { get; set; } = new();

    public class WordItemDto
    {
        public string Ana { get; set; } = string.Empty;
        public string Turkce { get; set; } = string.Empty;
        public List<string> Tabu { get; set; } = new();
    }
}
