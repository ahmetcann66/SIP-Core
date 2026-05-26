using Microsoft.Maui.Controls;

namespace SipCore.Mobile.Views;

public partial class WorkspacePage : ContentPage
{
    private const string TitleKey = "sip_ws_title";
    private const string ContentKey = "sip_ws_content";

    public WorkspacePage()
    {
        InitializeComponent();
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        LoadWorkspace();
    }

    private void OnSaveClicked(object sender, EventArgs e)
    {
        Preferences.Set(TitleKey, WorkspaceTitleEntry.Text ?? string.Empty);
        Preferences.Set(ContentKey, WorkspaceContentEditor.Text ?? string.Empty);
        DisplayAlert("Kayıt", "Çalışma alanı kaydedildi.", "Tamam");
    }

    private void OnLoadClicked(object sender, EventArgs e)
    {
        LoadWorkspace();
    }

    private void OnClearClicked(object sender, EventArgs e)
    {
        WorkspaceTitleEntry.Text = string.Empty;
        WorkspaceContentEditor.Text = string.Empty;
    }

    private async void OnBackClicked(object sender, EventArgs e)
    {
        await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
    }

    private void LoadWorkspace()
    {
        WorkspaceTitleEntry.Text = Preferences.Get(TitleKey, string.Empty);
        WorkspaceContentEditor.Text = Preferences.Get(ContentKey, string.Empty);
    }
}