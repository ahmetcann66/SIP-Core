Açıklama
========
Bu repository içinde web, mobil ve backend kodları mantıksal olarak ayrılmıştır. Aşağıda mevcut klasör yapısı ve her bileşeni bağımsız olarak nasıl çalıştıracağınız açıklanmıştır.

Klasörler
--------
- `SIP_Frontend/` — Statik web istemcisi (HTML, CSS, JS). Tek başına bir HTTP sunucusunda veya GitHub Pages/Netlify gibi servislerde çalıştırılabilir.
- `SipCoreDotnet/` — .NET / MAUI projeleri (mobil/masaüstü istemci). İçinde `SipCore.Mobile` mobil uygulaması bulunur.
- `backend/` — Java / Spring Boot sunucu uygulaması (API).

Ayrıştırma İlkeleri
-------------------
- Mobil uygulama `SipCore.Mobile` içinde çalışır ve web dosyalarına hiçbir şekilde gömülü referans içermez.
- `TokenService` (Preferences) ve `ApiClient` ile mobilde kimlik doğrulama yönetiliyor; web tarafı kendi JS bazlı oturum mantığını kullanır. İki taraf tamamen bağımsızdır.

Nasıl çalıştırılır
------------------
1) Backend (Spring Boot)

```bash
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

2) Web istemci (statik)

```bash
cd SIP_Frontend
# hızlı test için
npx --yes serve . -l 5500
# aç: http://localhost:5500
```

3) Mobil / MAUI

- Visual Studio veya `dotnet` ile:

```bash
cd SipCoreDotnet/SipCore.Mobile
dotnet restore
dotnet build
# emulator/cihaz ile çalıştır
```

Tavsiyeler
---------
- Eğer istersen `SIP_Frontend` klasörünü ayrı bir repository'ye taşıyıp, frontend CI/CD'yi web-repo üzerinden yönetmek en temiz yaklaşımdır.
- Mobil ve web için farklı deployment/hosting süreçleri kullan; örneğin web için Netlify/GitHub Pages, mobil için mağaza dağıtımı veya AD-HOC CI pipeline.

Notlar
------
- Repo içinde şu anda mobil kodu (`SipCore.Mobile`) hiçbir şekilde `SIP_Frontend` dosyalarına referans vermez.
- Eğer fiziksel olarak klasörleri taşımamı (yeni repo oluşturma veya monorepo yeniden düzenleme) istersen, bunu yapabilirim; işlem için onayına ihtiyacım var.

Önlem: Kazara aynı commit'te hem web hem mobil değişiklik yapmayı engelleme
-------------------------------------------------------------------
Bu repo içinde istemeden hem `SIP_Frontend/` hem `SipCoreDotnet/` dizinlerinde değişiklik yapıp tek bir commit'e dahil etmek istemiyorsanız, yerel bir git hook ile bunu engelleyebilirsiniz. Aşağıdaki adımları uygulayın:

1. Proje kökünde hook'ları etkinleştirin:

```bash
git config core.hooksPath .githooks
```

2. `./.githooks/pre-commit` (Unix) veya `./.githooks/pre-commit.ps1` (Windows PowerShell) dosyaları zaten eklendi. Bu scriptler, commit aşamasında eğer aynı commit'te `SIP_Frontend/` ve `SipCoreDotnet/` içine ait dosyalar varsa commit'i reddeder.

3. Eğer CI/CD pipeline'ınız varsa, aynı kontrolü pipeline içinde de uygulamanızı öneririm (ör. GitHub Actions step ile `git diff --name-only ${{ github.event.before }} ${{ github.sha }}` kontrolü).

Bu önlem, web ve mobil kodlarının istemeden birbirini etkilemesini önlemeye yardımcı olur.

CI Notu: Bu repoda artık bir GitHub Actions workflow bulunmaktadır: `.github/workflows/separation-check.yml`. Bu workflow `pull_request` ve `push` olaylarında çalışır ve eğer değişiklikler aynı PR/commit içinde hem `SIP_Frontend/` hem `SipCoreDotnet/` dizinlerini etkiliyorsa pipeline'ı başarısız yapar.
