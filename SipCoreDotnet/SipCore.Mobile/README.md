Mobile placeholder: create .NET MAUI app locally

To scaffold the MAUI app locally (requires MAUI workload):

```powershell
dotnet new maui -n SipCore.Mobile
dotnet add SipCore.Mobile/SipCore.Mobile.csproj reference ..\SipCore.Core\SipCore.Core.csproj
```

Implement mobile UI to call `https://<api>/api/english-hub/state` and reuse `SipCore.Core` models.
