$ops = $PSScriptRoot
$psExe = "powershell.exe"
function Arg($f) { "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ops\$f`"" }

# Wi-Fi watchdog: at logon, keep alive, highest privileges
$act  = New-ScheduledTaskAction  -Execute $psExe -Argument (Arg "wifi-watchdog.ps1")
$trg  = New-ScheduledTaskTrigger -AtLogOn
$set  = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
          -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero)
$prin = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -RunLevel Highest
Register-ScheduledTask -TaskName "KeelWifiWatchdog" -Action $act -Trigger $trg -Settings $set -Principal $prin -Force

# Resume messages at 16:15 and 16:30 daily
$ract = New-ScheduledTaskAction -Execute $psExe -Argument (Arg "resume-message.ps1")
Register-ScheduledTask -TaskName "KeelResume415" -Action $ract -Trigger (New-ScheduledTaskTrigger -Daily -At 4:15PM) -Force
Register-ScheduledTask -TaskName "KeelResume430" -Action $ract -Trigger (New-ScheduledTaskTrigger -Daily -At 4:30PM) -Force

Start-ScheduledTask -TaskName "KeelWifiWatchdog"
Write-Host "Ops armed: KeelWifiWatchdog running; KeelResume415 / KeelResume430 scheduled."
