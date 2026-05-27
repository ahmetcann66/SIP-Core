namespace SipCore.Mobile.Services;

public record AuthRequest(string Email, string Password);
public record AuthResponse(string Token, long ExpiresIn, string? RefreshToken);
