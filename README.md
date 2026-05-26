# SIP Core

Kısa açıklama: SIP Core servisleri — Java (Maven) backend ve .NET istemci bileşenleri içeren monorepo.

## Hızlı Başlangıç

Gereksinimler:
- JDK 17+ (backend için)
- Maven
- .NET SDK (SipCoreDotnet için)

Backend (Maven) derleme:

```bash
cd backend
mvn -B clean package
```

.NET çözümünü derleme:

```bash
cd SipCoreDotnet
dotnet restore
dotnet build
dotnet test
```

## Katkıda Bulunma
Lütfen öncelikle bir issue açın ve sonra PR gönderin. PR'lar için kod incelemesi ve CI zorunludur.

## Lisans
Proje MIT lisansı ile yayımlanmıştır. Ayrıntılar için LICENSE dosyasına bakın.
