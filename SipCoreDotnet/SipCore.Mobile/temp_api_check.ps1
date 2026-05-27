$adb = 'C:\Program Files\Unity\Hub\Editor\6000.2.7f2\Editor\Data\PlaybackEngines\AndroidPlayer\SDK\platform-tools\adb.exe'
$project = 'C:\Users\ahmet\OneDrive\Belgeler\Local\web_editor_proje\SipCoreDotnet\SipCore.Mobile'
Set-Location $project
& $adb logcat -c
& $adb shell am force-stop com.companyname.sipcore.mobile
& $adb shell am start -n com.companyname.sipcore.mobile/crc64baadc33364787230.MainActivity
& $adb logcat -v brief ActivityTaskManager:I *:S | ForEach-Object { if ($_ -match 'Displayed com.companyname.sipcore.mobile') { $_; break } }
& $adb shell input tap 450 1470
Start-Sleep -Seconds 5
& $adb shell input tap 150 715
Start-Sleep -Seconds 5
& $adb logcat -d > .\logcat_api_check.txt
Select-String -Path .\logcat_api_check.txt -Pattern 'EnglishHubViewModel|ApiClient|api/english-hub|Response Status|BaseAddress|LoadStateAsync|exception' | Select-Object -First 100
Get-Item .\logcat_api_check.txt | Select-Object FullName, Length