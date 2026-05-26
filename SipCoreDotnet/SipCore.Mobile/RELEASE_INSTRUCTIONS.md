Release APK (unsigned) location

After publishing (done by `dotnet publish -f net8.0-android -c Release -p:AndroidPackageFormat=apk`) the unsigned APK(s) and app artifacts are produced under the `bin\Release\net8.0-android\` tree. Common locations:

- bin\Release\net8.0-android\publish\
- bin\Release\net8.0-android\android-arm64\publish\
- bin\Release\net8.0-android\android-arm\publish\

Signing and aligning (recommended)

1) (Optional) Generate a keystore (example using bundled JDK `keytool`):

```powershell
# adjust path to your keytool if needed
"%CD%\\..\\oracleJdk-26\\bin\\keytool.exe" -genkeypair -v -keystore release.keystore -alias mykey -keyalg RSA -keysize 2048 -validity 10000
```

2) Sign & align with Android SDK build-tools (`apksigner` + `zipalign`) or via MSBuild properties.

Using `apksigner` (after building unsigned APK):

```powershell
# locate the unsigned apk, e.g.:
$apk = "bin\Release\net8.0-android\android-arm64\publish\com.companyname.sipcore.mobile.apk"
# align (zipalign comes with Android build-tools)
zipalign -v -p 4 $apk aligned.apk
# sign (apksigner comes with Android build-tools)
apksigner sign --ks release.keystore --ks-key-alias mykey --out signed.apk aligned.apk
```

Using MSBuild to produce a signed APK directly:

```powershell
# provide your keystore and passwords (not recommended on shared shells)
dotnet publish .\SipCore.Mobile.csproj -f net8.0-android -c Release -p:AndroidPackageFormat=apk -p:AndroidSigningKeyStore=release.keystore -p:AndroidSigningKeyAlias=mykey -p:AndroidSigningKeyStorePass=YOUR_STORE_PASS -p:AndroidSigningKeyPass=YOUR_KEY_PASS
```

Notes & tips

- If you don't have Android SDK `zipalign`/`apksigner` on PATH, install Android SDK Build-Tools or use `apksigner` from your Android SDK installation (e.g., `%ANDROID_HOME%\\build-tools\\<version>\\apksigner`).
- For Play Store publishing, prefer building an `aab` bundle: `-p:AndroidPackageFormat=aab` and upload the signed AAB to Play Console.
- Keep your keystore secure and do not commit `release.keystore` to source control.

If you want, I can:
- generate a temporary keystore here and produce a signed APK (I will store the keystore under the repo; say if OK), or
- only produce the unsigned APK and leave signing to you (safer).

Note: I did not commit the keystore to the repository. For safety I moved the generated keystore to your user profile:

- Keystore path: `C:\Users\ahmet\\.keystores\\release.keystore`

Do NOT commit that file to source control. If you want me to place it somewhere else (hardware token, secure share), tell me where.