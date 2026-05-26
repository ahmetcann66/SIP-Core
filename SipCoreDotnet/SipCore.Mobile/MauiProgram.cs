using Microsoft.Extensions.Logging;
using SipCore.Mobile.Services;
using SipCore.Mobile.ViewModels;

namespace SipCore.Mobile;

public static class MauiProgram
{
	public static MauiApp CreateMauiApp()
	{
		var builder = MauiApp.CreateBuilder();
		builder
			.UseMauiApp<App>()
			.ConfigureFonts(fonts =>
			{
				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
				fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
			});

		// Configure HTTP Client for API communication
		builder.Services.AddHttpClient<IApiClient, ApiClient>(client =>
		{
			var apiBaseUrl = OperatingSystem.IsAndroid()
				? "http://10.0.2.2:8080"
				: "http://localhost:8080";

			client.BaseAddress = new Uri(apiBaseUrl);
			client.Timeout = TimeSpan.FromSeconds(30);
		});

		// Register services
		builder.Services.AddSingleton<EnglishHubViewModel>();
		builder.Services.AddSingleton<MainPage>();

#if DEBUG
		builder.Logging.AddDebug();
#endif

		// Initialize ApiClient in ServiceHelper
		var app = builder.Build();
		var apiClient = app.Services.GetRequiredService<IApiClient>();
		ServiceHelper.SetApiClient(apiClient);

		// If an auth token was previously stored, apply it to the ApiClient so requests include Authorization header
		var existingToken = SipCore.Mobile.Services.TokenService.GetToken();
		if (!string.IsNullOrWhiteSpace(existingToken))
		{
			apiClient.SetAuthorizationToken(existingToken);
		}

		return app;
	}
}

public static class ServiceHelper
{
	private static IApiClient? _apiClient;

	public static void SetApiClient(IApiClient apiClient)
	{
		_apiClient = apiClient;
	}

	public static IApiClient GetApiClient()
	{
		return _apiClient ?? throw new InvalidOperationException("ApiClient not initialized");
	}
}
