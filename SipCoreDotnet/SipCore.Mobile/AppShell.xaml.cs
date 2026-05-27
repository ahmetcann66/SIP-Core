namespace SipCore.Mobile;

public partial class AppShell : Shell
{
	private static bool _routesRegistered;

	public AppShell()
	{
		InitializeComponent();
		RegisterRoutes();
	}

	protected override async void OnAppearing()
	{
		base.OnAppearing();
		try
		{
			// Ensure app starts at LandingPage without using Shell URI routing
			// Pop any restored navigation stack to return to the root (first ShellContent)
			await Shell.Current.Navigation.PopToRootAsync();
		}
		catch (Exception ex)
		{
			System.Diagnostics.Debug.WriteLine($"AppShell OnAppearing navigation failed: {ex.Message}");
		}
	}

	private static void RegisterRoutes()
	{
		if (_routesRegistered)
		{
			return;
		}

		void safeRegister(string route, Type pageType)
		{
			try
			{
				Routing.RegisterRoute(route, pageType);
			}
			catch (ArgumentException)
			{
				// Route already exists (possibly declared in XAML). Ignore duplicate.
			}
		}

		safeRegister("LandingPage", typeof(Views.LandingPage));
		safeRegister("DashboardPage", typeof(Views.DashboardPage));
		safeRegister("MainPage", typeof(MainPage));
		safeRegister("PomodoroPage", typeof(Views.PomodoroPage));
		safeRegister("SipCorePage", typeof(Views.SipCorePage));
		safeRegister("WorkspacePage", typeof(Views.WorkspacePage));
		safeRegister("RoadMapPage", typeof(Views.RoadMapPage));
		safeRegister("HistoryPage", typeof(Views.HistoryPage));
		safeRegister("ScorePage", typeof(Views.ScorePage));
		safeRegister("LevelSelectPage", typeof(Views.LevelSelectPage));
		safeRegister("ExamPracticePage", typeof(Views.ExamPracticePage));

		_routesRegistered = true;
	}
}
