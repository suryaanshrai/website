param (
    [switch]$SkipTts
)

# Anchor everything to the script's own folder so this works no matter
# which worktree/directory it's sitting in (quartz, quartz-v5, etc.)
$RepoRoot = $PSScriptRoot
$SourcePath = "D:\COde\Obsidian\My Notebook\My Notebook\Surya\*Website\*"

# --- 1. UPDATE WEBSITE CONTENT ---
if (Test-Path "$RepoRoot\content") { Remove-Item "$RepoRoot\content\*" -Recurse -Force }
else { New-Item -Type Directory "$RepoRoot\content" | Out-Null }

Copy-Item -Path $SourcePath -Destination "$RepoRoot\content\" -Recurse -Force

# # --- 2. UPDATE TTS CONTENT ---
# if (Test-Path "$RepoRoot\..\text-to-speech-local\content") { Remove-Item "$RepoRoot\..\text-to-speech-local\content\*" -Recurse -Force }
# else { New-Item -Type Directory "$RepoRoot\..\text-to-speech-local\content" | Out-Null }

# Copy-Item -Path $SourcePath -Destination "$RepoRoot\..\text-to-speech-local\content\" -Recurse -Force

# # --- 3. RUN PYTHON & SYNC ---
# if (-not $SkipTts) {
#     Set-Location "$RepoRoot\..\text-to-speech-local"
#     & ".\.venv\Scripts\python.exe" "main2.py"
# }

# # Copy Audios
if (-not (Test-Path "$RepoRoot\audios")) { New-Item -Type Directory "$RepoRoot\audios" | Out-Null }
Copy-Item "$RepoRoot\..\text-to-speech-local\audios\*" "$RepoRoot\audios\" -Recurse -Force

# # Final Sync
Set-Location $RepoRoot
npx quartz sync
