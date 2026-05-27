using System;

namespace SipCore.Core.Models;

public class EnglishHubState : BaseEntity
{
    private string _stateKey = string.Empty;
    private string _payloadJson = "{}";

    public string StateKey
    {
        get => _stateKey;
        set => _stateKey = value ?? string.Empty;
    }

    public string PayloadJson
    {
        get => _payloadJson;
        set => _payloadJson = string.IsNullOrWhiteSpace(value) ? "{}" : value;
    }

    public EnglishHubState() : base()
    {
        TouchUpdated();
    }

    public EnglishHubState(long id, string stateKey, string payloadJson) : base(id)
    {
        StateKey = stateKey;
        PayloadJson = payloadJson;
        TouchUpdated();
    }

    public override string GetDisplayLabel() => $"EnglishHubState[{Id}] Key={StateKey}";
}
