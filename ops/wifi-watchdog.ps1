# Keel Wi-Fi watchdog — power-cycles the Wi-Fi adapter when the internet is unreachable.
$log = "$env:USERPROFILE\keel-wifi-watchdog.log"
$if  = (Get-NetAdapter | Where-Object { $_.Name -match 'Wi-Fi|Wireless|WLAN' } | Select-Object -First 1).Name
if (-not $if) { $if = "Wi-Fi" }
"$(Get-Date) watchdog started on $if" | Out-File -Append -Encoding utf8 $log
while ($true) {
  $ok = (Test-Connection -Count 1 -Quiet 1.1.1.1) -or (Test-Connection -Count 1 -Quiet 8.8.8.8)
  if (-not $ok) {
    "$(Get-Date) internet down — cycling $if" | Out-File -Append -Encoding utf8 $log
    Disable-NetAdapter -Name $if -Confirm:$false
    Start-Sleep -Seconds 5
    Enable-NetAdapter  -Name $if -Confirm:$false
    Start-Sleep -Seconds 10
  }
  Start-Sleep -Seconds 20
}
