using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Microsoft.Maui.Controls;
using SipCore.Mobile.Services;

namespace SipCore.Mobile.ViewModels;

public class AuthViewModel : INotifyPropertyChanged
{
    private string _email = string.Empty;
    private string _password = string.Empty;
    private string _statusMessage = "Giriş bilgilerinizi girin";
    private ICommand? loginCommand;
    private ICommand? registerCommand;
    private ICommand? navigateBackCommand;

    public event PropertyChangedEventHandler? PropertyChanged;

    public string Email
    {
        get => _email;
        set
        {
            _email = value;
            OnPropertyChanged();
        }
    }

    public string Password
    {
        get => _password;
        set
        {
            _password = value;
            OnPropertyChanged();
        }
    }

    public string StatusMessage
    {
        get => _statusMessage;
        set
        {
            _statusMessage = value;
            OnPropertyChanged();
        }
    }

    public ICommand LoginCommand =>
        loginCommand ??= new Command(async () => await LoginAsync());

    public ICommand RegisterCommand =>
        registerCommand ??= new Command(async () => await RegisterAsync());

    public ICommand NavigateBackCommand =>
        navigateBackCommand ??= new Command(NavigateBack);

    private async Task LoginAsync()
    {
        try
        {
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
            {
                StatusMessage = "E-posta ve şifre zorunlu";
                return;
            }

            StatusMessage = "Giriş yapılıyor...";
            var api = ServiceHelper.GetApiClient();
            var normalizedEmail = (Email ?? string.Empty).Trim().ToLowerInvariant();
            var auth = await api.LoginAsync(new AuthRequest(normalizedEmail, Password));
            if (auth is null)
            {
                StatusMessage = "Giriş başarısız: bilgilerinizi kontrol edin";
                return;
            }

            // Save email for future reference
            TokenService.SaveEmail(normalizedEmail);
            
            StatusMessage = "Giriş başarılı";
            System.Diagnostics.Debug.WriteLine($"Login successful for {normalizedEmail}");
            
            // Navigate to Dashboard as the new root to avoid leaving AuthPage on the stack
            try
            {
                await Shell.Current.GoToAsync("//DashboardPage");
            }
            catch (Exception navEx)
            {
                System.Diagnostics.Debug.WriteLine($"Shell navigation failed: {navEx.Message}");
                try
                {
                    await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
                }
                catch (Exception pushEx)
                {
                    System.Diagnostics.Debug.WriteLine($"PushAsync also failed: {pushEx.Message}");
                    StatusMessage = $"Giriş başarılı ama gezinme hatası";
                }
            }
        }
        catch (Exception ex)
        {
            StatusMessage = $"Hata: {ex.Message}";
            System.Diagnostics.Debug.WriteLine($"Login failed: {ex}");
        }
    }

    private async Task RegisterAsync()
    {
        try
        {
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
            {
                StatusMessage = "Kayıt için alanları doldurun";
                return;
            }

            StatusMessage = "Kayıt gerçekleştiriliyor...";
            var api = ServiceHelper.GetApiClient();
            var normalizedEmail = (Email ?? string.Empty).Trim().ToLowerInvariant();
            var auth = await api.RegisterAsync(new AuthRequest(normalizedEmail, Password));
            if (auth is null)
            {
                StatusMessage = "Kayıt başarısız";
                return;
            }

            // Save email for future reference
            TokenService.SaveEmail(normalizedEmail);
            
            StatusMessage = "Kayıt başarılı";
            System.Diagnostics.Debug.WriteLine($"Registration successful for {normalizedEmail}");
            
            // After registration, navigate to Dashboard as root
            try
            {
                await Shell.Current.GoToAsync("//DashboardPage");
            }
            catch (Exception navEx)
            {
                System.Diagnostics.Debug.WriteLine($"Shell navigation failed: {navEx.Message}");
                try
                {
                    await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
                }
                catch (Exception pushEx)
                {
                    System.Diagnostics.Debug.WriteLine($"PushAsync also failed: {pushEx.Message}");
                    StatusMessage = $"Kayıt başarılı ama gezinme hatası";
                }
            }
        }
        catch (Exception ex)
        {
            StatusMessage = $"Hata: {ex.Message}";
            System.Diagnostics.Debug.WriteLine($"Register failed: {ex}");
        }
    }

    private static async void NavigateBack()
    {
        try
        {
            // If user is not authenticated, ensure we return to the safe LandingPage root
            var token = Services.TokenService.GetToken();
            if (string.IsNullOrWhiteSpace(token))
            {
                try
                {
                    await Shell.Current.GoToAsync("//LandingPage");
                    return;
                }
                catch { /* fallback to PopAsync below */ }
            }

            // Default: pop the current page
            if (Shell.Current.Navigation.NavigationStack.Count > 0)
            {
                await Shell.Current.Navigation.PopAsync();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex.Message}");
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}

