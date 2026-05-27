# S.I.P. Core: Eğitim Ekosistemi

🚀 **Eğitim DNA Analizi Destekli Akıllı Öğrenme Platformu**

[![License](https://img.shields.io/github/license/ahmetcann66/SIP-Core)](LICENSE)
[![Languages](https://img.shields.io/github/languages/top/ahmetcann66/SIP-Core)](https://github.com/ahmetcann66/SIP-Core)
[![Repo Size](https://img.shields.io/github/repo-size/ahmetcann66/SIP-Core)](https://github.com/ahmetcann66/SIP-Core)

---

## 🌟 Proje Hakkında

**S.I.P. Core**, öğrencilerin ve dil öğrenenlerin süreçlerini kişiselleştiren modern bir eğitim ekosistemidir. "Öğrenme DNA" analizi ile kullanıcının güçlü ve zayıf yönlerini belirler, buna uygun çalışma yolları sunar. Platform, hem kapsamlı bir **Web Arayüzü** hem de her an erişilebilir bir **Mobil Uygulama** üzerinden hizmet verir.

---

## 👨‍💻 Kullanılan Teknolojiler

- **Backend:** Java / Spring Boot (REST API, WebSocket, Hibernate, MySQL)
- **Mobil:** C# / .NET MAUI (Android, Windows Desktop)
- **Web:** JavaScript, HTML5, CSS3, Bootstrap 5
- **İletişim:** WebSocket (Gerçek zamanlı etkileşim)
- **Veri Saklama:** MySQL & Preferences (Local Storage)

---

## 🧩 Temel Modüller

### 🌍 English Hub
A1'den C2 seviyesine kadar geniş kelime havuzu, interaktif flashcard'lar ve yasaklı kelimeler (Tabu) oyunu ile dil öğrenimini eğlenceli hale getirir.

### 🚀 SIP Dashboard
Deneme sınavları, skor takibi, gelişim grafikleri ve çalışma notlarının bulunduğu kişisel yönetim merkezi.

### ⏱️ Pomodoro Masası
Odaklanmayı artıran zaman yönetimi tekniği. Sesli hatırlatıcılar ve seans geçmişi ile verimli çalışma sağlar.

### 🧠 SIP Core AI
Kullanıcının öğrenme alışkanlıklarını analiz ederek kişiye özel "Öğrenme DNA" raporu oluşturur ve yapay zeka destekli materyal üretir.

---

## 🗂️ Proje Yapısı

```
SIP-Core/
├── backend/        # Spring Boot tabanlı Java API Sunucusu
├── SipCoreDotnet/  # .NET MAUI Mobil & Masaüstü Uygulaması
├── SIP_Frontend/   # Web Arayüzü (HTML, JS, CSS)
└── run_backend.bat # Tek tıkla backend başlatma scripti
```

---

## ⚡ Hızlı Başlatma

### 1️⃣ Backend'i Başlatma
`run_backend.bat` dosyasına çift tıklayarak veya manuel olarak:
```bash
cd backend
mvnw spring-boot:run
```
> Sunucu varsayılan olarak `http://localhost:8080` portunda çalışır.

### 2️⃣ Mobil Uygulamayı Çalıştırma
Görsel arayüz için Android Emülatör veya Windows üzerinde:
```bash
cd SipCoreDotnet/SipCore.Mobile
dotnet build -t:Run -f net8.0-android  # Android için
```

### 3️⃣ Web Arayüzüne Erişim
`SIP_Frontend/index.html` dosyasını tarayıcınızda açmanız yeterlidir.

---

## 🛡️ Erişim ve Kullanım

Mobil uygulama, kullanıcı deneyimini pürüzsüz hale getirmek için **kayıt/giriş zorunluluğu olmadan** doğrudan tüm özelliklere erişim imkanı sunar. Tüm veriler yerel olarak senkronize edilir ve backend ile entegre çalışır.

---

## 📬 İletişim

📧 ahmetcanbozkurt295@gmail.com  
🐞 [GitHub Issues](https://github.com/ahmetcann66/SIP-Core/issues)

---

## 📝 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Ayrıntılar için [LICENSE](LICENSE) dosyasını inceleyin.
