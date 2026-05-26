# S.I.P. Core — Web Arayüzü

## Proje amacı

S.I.P. Core, öğrenci ve öğretmenler için **English Hub** (İngilizce) ve **SIP Dashboard** (akademik takip) modüllerini tek arayüzde sunan akıllı eğitim platformudur.

## Hedef kitle

- **Öğrenciler:** Kelime çalışması, Tabu, Pomodoro, deneme sınavı, çalışma geçmişi
- **Öğretmenler:** Sınıf yönetimi, bildirim, rapor ve içerik yönetimi

## Sayfa / ekran haritası (SPA)

Tek `index.html` dosyasında ekranlar `section.screen` ile yönetilir; navbar ve footer tüm ekranlarda sabittir.

| Ekran ID | İçerik |
|----------|--------|
| `landingEkrani` | Tanıtım ve giriş CTA |
| `authEkrani` | Giriş / kayıt formları |
| `anaKapiEkrani` | Modül seçimi (English / SIP) |
| `sipDashboardEkrani` | Akademik panel |
| `seviyeSecimEkrani` | CEFR seviye seçimi |
| `adminPaneliEkrani` | Öğretmen paneli |
| … | Pomodoro, sınav, workspace, AI vb. |

## Teknik özellikler (rubrik)

- **HTML:** Anlamlı `header`, `main`, `footer`, `section`, `nav`
- **CSS:** Harici `style.css`, responsive `@media` kuralları
- **Bootstrap 5.3:** Navbar, grid, butonlar, collapse
- **JavaScript:** DOM manipülasyonu, `localStorage`, fetch API, form doğrulama, WebSocket (STOMP), çoklu etkileşim (Pomodoro, XP, Tabu, …)

## Çalıştırma

1. Java backend (port **8080**): `backend` klasöründe Spring Boot uygulamasını başlatın.
2. Statik web: `SIP_Frontend` klasöründe bir HTTP sunucusu açın, örneğin:

```bash
npx --yes serve SIP_Frontend -l 5500
```

3. Tarayıcıda `http://localhost:5500` adresini açın.

## Yayınlama

Projeyi GitHub Pages, Netlify veya benzeri bir statik host’a `SIP_Frontend` kökünü yükleyerek yayınlayabilirsiniz. Backend ayrı sunucuda (8080 / API URL) çalışmalıdır; `script.js` içindeki `JAVA_API_URL` değerini production adresine güncelleyin.

## Dosyalar

- `index.html` — yapı ve Bootstrap bileşenleri
- `style.css` — görsel bütünlük ve responsive tasarım
- `script.js` — iş mantığı ve doğrulama
- `data.js` — statik içerik verisi
