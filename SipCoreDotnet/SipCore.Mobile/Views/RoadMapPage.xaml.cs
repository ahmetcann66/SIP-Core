using System.Collections.ObjectModel;
using Microsoft.Maui.Controls;

namespace SipCore.Mobile.Views;

public partial class RoadMapPage : ContentPage
{
    public ObservableCollection<RoadMapItem> RoadMapItems { get; } = new();

    public RoadMapPage()
    {
        InitializeComponent();
        BindingContext = this;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();

        if (RoadMapItems.Count == 0)
        {
            BuildRoadMap("Genel Çalışma Planı");
        }
    }

    private void OnGenerateClicked(object sender, EventArgs e)
    {
        BuildRoadMap(TopicEntry.Text);
    }

    private void OnSampleClicked(object sender, EventArgs e)
    {
        TopicEntry.Text = "TYT Matematik";
        BuildRoadMap(TopicEntry.Text);
    }

    private async void OnBackClicked(object sender, EventArgs e)
    {
        await Shell.Current.Navigation.PushAsync(new Views.DashboardPage());
    }

    private void BuildRoadMap(string? topic)
    {
        var normalizedTopic = string.IsNullOrWhiteSpace(topic) ? "Genel Çalışma Planı" : topic.Trim();

        RoadMapItems.Clear();
        RoadMapItems.Add(new RoadMapItem("1. Temel Konular", $"{normalizedTopic} için başlangıç seviyesini ve temel kavramları oturt."));
        RoadMapItems.Add(new RoadMapItem("2. Soru Tipleri", "En sık çıkan soru kalıplarını ve çözüm adımlarını öğren."));
        RoadMapItems.Add(new RoadMapItem("3. Tekrar ve Notlar", "Yanlışları not al, çalışma alanında kısa özetler oluştur."));
        RoadMapItems.Add(new RoadMapItem("4. Deneme Analizi", "Deneme sonrası konu bazlı eksikleri belirle ve tekrar planı çıkar."));
        RoadMapItems.Add(new RoadMapItem("5. Odak Döngüsü", "Pomodoro ile günlük çalışma süresini sabit tut ve streak oluştur."));

        RoadMapCollection.ItemsSource = RoadMapItems;
    }
}

public sealed record RoadMapItem(string Title, string Description);