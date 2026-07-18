# Disarms all Keel ops automation: stops the Wi-Fi watchdog and removes all scheduled tasks.
foreach ($t in "KeelWifiWatchdog","KeelResume415","KeelResume430") {
  try { Stop-ScheduledTask -TaskName $t -ErrorAction Stop } catch {}
  try { Unregister-ScheduledTask -TaskName $t -Confirm:$false -ErrorAction Stop; Write-Host "Removed $t" } catch { Write-Host "$t not present" }
}
# Kill any orphaned watchdog process still looping
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
  Where-Object { $_.CommandLine -match 'wifi-watchdog\.ps1' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Write-Host "Keel ops disarmed."
