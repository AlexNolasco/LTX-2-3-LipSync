@echo off
setlocal EnableExtensions DisableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..") do set "COMFY_ROOT=%%~fI"
for %%I in ("%COMFY_ROOT%\models") do set "DEFAULT_MODELS_ROOT=%%~fI"

set "DEFAULT_DOWNLOAD_ROOT=%UserProfile%\OneDrive\Downloads\LTX-2.3"
if not exist "%UserProfile%\OneDrive" set "DEFAULT_DOWNLOAD_ROOT=%UserProfile%\Downloads\LTX-2.3"

set "ARG_DOWNLOAD_ROOT=%~1"
set "ARG_MODELS_ROOT=%~2"
set "ARG_GEMMA_SHARD_DIR=%~3"
set "ARG_SKIP_FFMPEG=%~4"

echo.
echo LTX 2.3 Motion Full Installer
echo.
echo This script installs Python dependencies, configures ffmpeg, and downloads
echo the required workflow models into your ComfyUI folders.
echo.

if defined ARG_DOWNLOAD_ROOT (
  set "DOWNLOAD_ROOT=%ARG_DOWNLOAD_ROOT%"
) else (
  set /p "DOWNLOAD_ROOT=Download cache folder [%DEFAULT_DOWNLOAD_ROOT%]: "
  if not defined DOWNLOAD_ROOT set "DOWNLOAD_ROOT=%DEFAULT_DOWNLOAD_ROOT%"
)

if defined ARG_MODELS_ROOT (
  set "MODELS_ROOT=%ARG_MODELS_ROOT%"
) else (
  set /p "MODELS_ROOT=ComfyUI models folder [%DEFAULT_MODELS_ROOT%]: "
  if not defined MODELS_ROOT set "MODELS_ROOT=%DEFAULT_MODELS_ROOT%"
)

set "GEMMA_SHARD_DIR=%ARG_GEMMA_SHARD_DIR%"
if not defined GEMMA_SHARD_DIR set "GEMMA_SHARD_DIR=%MODELS_ROOT%\text_encoders\gemma"

call :ensure_dir "%DOWNLOAD_ROOT%"
call :ensure_dir "%COMFY_ROOT%\tools"

echo.
echo ComfyUI root:
echo   %COMFY_ROOT%
echo Download cache:
echo   %DOWNLOAD_ROOT%
echo Models root:
echo   %MODELS_ROOT%
echo Gemma shard folder:
echo   %GEMMA_SHARD_DIR%

call :find_python
if errorlevel 1 goto :fail

echo.
echo Using Python:
echo   %PYTHON_EXE% %PYTHON_ARGS%

call :install_python_deps
if errorlevel 1 goto :fail

if /I "%ARG_SKIP_FFMPEG%"=="skip-ffmpeg" (
  echo.
  echo Skipping ffmpeg setup because skip-ffmpeg was requested.
) else (
  call :ensure_ffmpeg
  if errorlevel 1 goto :fail
)

echo.
echo Running model installer...
call "%SCRIPT_DIR%install_ltx23_motion_models.bat" "%DOWNLOAD_ROOT%" "%MODELS_ROOT%" "%GEMMA_SHARD_DIR%"
if errorlevel 1 goto :fail

echo.
echo Finished. Restart ComfyUI before opening the workflows.
exit /b 0

:fail
echo.
echo Install did not complete successfully.
exit /b 1

:ensure_dir
if not exist "%~1" mkdir "%~1"
exit /b 0

:find_python
set "PYTHON_EXE="
set "PYTHON_ARGS="
for %%I in ("%COMFY_ROOT%\.venv\Scripts\python.exe") do if exist "%%~fI" set "PYTHON_EXE=%%~fI"
if defined PYTHON_EXE exit /b 0
for %%I in ("%COMFY_ROOT%\python_embeded\python.exe") do if exist "%%~fI" set "PYTHON_EXE=%%~fI"
if defined PYTHON_EXE exit /b 0
for %%I in ("%SCRIPT_DIR%.venv\Scripts\python.exe") do if exist "%%~fI" set "PYTHON_EXE=%%~fI"
if defined PYTHON_EXE exit /b 0
where python >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_EXE=python"
  exit /b 0
)
where py >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_EXE=py"
  set "PYTHON_ARGS=-3"
  exit /b 0
)
echo.
echo ERROR: No Python executable was found.
echo Install Python or use the ComfyUI .venv / python_embeded distribution.
exit /b 1

:install_python_deps
echo.
echo Installing Python packages required by this custom node...
call :run_python -m pip --version
if errorlevel 1 (
  echo.
  echo pip is not available in the selected Python environment.
  echo Install pip for that environment, then rerun install.bat.
  exit /b 1
)

call :run_python -m pip install --upgrade pip
if errorlevel 1 exit /b 1

call :run_python -m pip install --upgrade numpy pillow aiohttp imageio-ffmpeg
if errorlevel 1 exit /b 1
exit /b 0

:ensure_ffmpeg
echo.
echo Checking ffmpeg...
where ffmpeg >nul 2>nul
if not errorlevel 1 (
  for /f "delims=" %%I in ('where ffmpeg 2^>nul') do (
    set "FFMPEG_EXE=%%~fI"
    goto :set_ffmpeg_env
  )
)

if exist "%COMFY_ROOT%\ffmpeg.exe" (
  set "FFMPEG_EXE=%COMFY_ROOT%\ffmpeg.exe"
  goto :set_ffmpeg_env
)

set "FFMPEG_ZIP=%DOWNLOAD_ROOT%\ffmpeg-release-essentials.zip"
set "FFMPEG_EXTRACT_DIR=%COMFY_ROOT%\tools\ffmpeg"
call :download_public "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" "%FFMPEG_ZIP%"
if errorlevel 1 exit /b 1

if exist "%FFMPEG_EXTRACT_DIR%" rmdir /s /q "%FFMPEG_EXTRACT_DIR%"
mkdir "%FFMPEG_EXTRACT_DIR%"

tar -xf "%FFMPEG_ZIP%" -C "%FFMPEG_EXTRACT_DIR%"
if errorlevel 1 (
  echo ERROR: Could not extract ffmpeg archive.
  exit /b 1
)

set "FFMPEG_EXE="
for /r "%FFMPEG_EXTRACT_DIR%" %%I in (ffmpeg.exe) do (
  set "FFMPEG_EXE=%%~fI"
  goto :copy_ffmpeg
)

echo ERROR: ffmpeg.exe was not found after extraction.
exit /b 1

:copy_ffmpeg
copy /Y "%FFMPEG_EXE%" "%COMFY_ROOT%\ffmpeg.exe" >nul
if errorlevel 1 (
  echo ERROR: Could not copy ffmpeg.exe into %COMFY_ROOT%
  exit /b 1
)
for %%N in (ffprobe.exe ffplay.exe) do (
  for /r "%FFMPEG_EXTRACT_DIR%" %%I in (%%N) do copy /Y "%%~fI" "%COMFY_ROOT%\%%N" >nul
)
set "FFMPEG_EXE=%COMFY_ROOT%\ffmpeg.exe"

:set_ffmpeg_env
echo Using ffmpeg:
echo   %FFMPEG_EXE%
setx VHS_FORCE_FFMPEG_PATH "%FFMPEG_EXE%" >nul
if errorlevel 1 (
  echo WARNING: Could not persist VHS_FORCE_FFMPEG_PATH. ComfyUI can still use ffmpeg if it runs from:
  echo   %FFMPEG_EXE%
  exit /b 0
)
echo Persisted VHS_FORCE_FFMPEG_PATH for future ComfyUI runs.
exit /b 0

:download_public
set "URL=%~1"
set "DEST=%~2"
if exist "%DEST%" (
  echo Found existing file:
  echo   %DEST%
  exit /b 0
)
echo Downloading:
echo   %DEST%
curl.exe -L --fail --progress-bar -o "%DEST%" "%URL%"
if errorlevel 1 (
  echo ERROR: Download failed for %DEST%
  exit /b 1
)
exit /b 0

:run_python
"%PYTHON_EXE%" %PYTHON_ARGS% %*
exit /b %errorlevel%