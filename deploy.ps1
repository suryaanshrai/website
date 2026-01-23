param (
    [switch]$SkipTts
)

# Define source path using a wildcard (*) to bypass the emoji encoding error
$SourcePath = "D:\COde\Obsidian\My Notebook\My Notebook\*Website\*"

Set-Location ..

# --- 1. UPDATE WEBSITE CONTENT ---
if (Test-Path "quartz\content") { Remove-Item "quartz\content\*" -Recurse -Force }
else { New-Item -Type Directory "quartz\content" | Out-Null }

Copy-Item -Path $SourcePath -Destination "quartz\content\" -Recurse -Force

# --- 2. UPDATE TTS CONTENT ---
if (Test-Path "text-to-speech-local\content") { Remove-Item "text-to-speech-local\content\*" -Recurse -Force }
else { New-Item -Type Directory "text-to-speech-local\content" | Out-Null }

Copy-Item -Path $SourcePath -Destination "text-to-speech-local\content\" -Recurse -Force

# --- 3. RUN PYTHON & SYNC ---
# if (-not $SkipTts) {
#     Set-Location "text-to-speech-local"
#     & ".\.venv\Scripts\python.exe" "main2.py"
#     Set-Location ..
# }

# Copy Audios
if (-not (Test-Path "quartz\audios")) { New-Item -Type Directory "quartz\audios" | Out-Null }
Copy-Item "text-to-speech-local\audios\*" "quartz\audios\" -Recurse -Force

# Final Sync
Set-Location "quartz"
npx quartz sync