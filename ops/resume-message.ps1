# Keel auto-resume: brings the Fable terminal to front and types a resume prompt.
$resume = "Continue building Keel exactly where you left off. Re-read FABLE_PROMPT.md, check the git log and file tree for what is already done, and resume the next incomplete task from the execution order. Do NOT restart from scratch or redo finished work."
Add-Type -AssemblyName System.Windows.Forms
# Find the visible terminal window (Windows Terminal / PowerShell / pwsh / cmd)
$term = Get-Process WindowsTerminal,powershell,pwsh,cmd -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if ($term) {
  $sig = '[DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);'
  $api = Add-Type -MemberDefinition $sig -Name Win -Namespace K -PassThru
  $api::SetForegroundWindow($term.MainWindowHandle) | Out-Null
  Start-Sleep -Milliseconds 800
}
[System.Windows.Forms.SendKeys]::SendWait($resume)
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
