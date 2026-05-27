# PowerShell pre-commit hook: prevent changes touching both web and mobile folders
$staged = git diff --cached --name-only
$web = $staged -split "`n" | Where-Object { $_ -match '^SIP_Frontend/' }
$mob = $staged -split "`n" | Where-Object { $_ -match '^SipCoreDotnet/' }

if ($web.Count -gt 0 -and $mob.Count -gt 0) {
    Write-Error "ERROR: Commit contains changes in both SIP_Frontend/ and SipCoreDotnet/."
    Write-Error "Split changes into separate commits or repositories to keep web and mobile independent."
    exit 1
}

exit 0
