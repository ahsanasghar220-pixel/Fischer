@echo off
REM Video Compression Script for Fischer Hero Video
REM This script compresses the hero video from ~10MB to ~2-3MB
REM
REM Prerequisites:
REM   - Install FFmpeg: https://ffmpeg.org/download.html
REM   - Or use: winget install ffmpeg
REM
REM Usage:
REM   1. Place your original video as: frontend\public\videos\hero-video-original.mp4
REM   2. Run this script
REM   3. Compressed video will be saved as: frontend\public\videos\hero-video.mp4

echo ====================================
echo Fischer Video Compression Tool
echo ====================================
echo.

set INPUT=frontend\public\videos\hero-video-original.mp4
set OUTPUT=frontend\public\videos\hero-video.mp4

if not exist "%INPUT%" (
    echo ERROR: Input video not found!
    echo Please place your video at: %INPUT%
    pause
    exit /b 1
)

echo Input:  %INPUT%
echo Output: %OUTPUT%
echo.
echo Starting compression...
echo This may take a few minutes...
echo.

REM Compress video to ~2MB with good quality
REM - Scale to 1080p (if larger)
REM - Use H.264 codec
REM - CRF 28 (good balance of quality/size, lower = better quality)
REM - Audio bitrate 128k
ffmpeg -i "%INPUT%" ^
    -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" ^
    -c:v libx264 ^
    -crf 28 ^
    -preset medium ^
    -c:a aac ^
    -b:a 128k ^
    -movflags +faststart ^
    -y "%OUTPUT%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo SUCCESS! Video compressed
    echo ====================================
    echo.
    echo Original: %INPUT%
    echo Compressed: %OUTPUT%
    echo.

    REM Show file sizes
    for %%A in ("%INPUT%") do set ORIGINAL_SIZE=%%~zA
    for %%A in ("%OUTPUT%") do set COMPRESSED_SIZE=%%~zA

    set /a ORIGINAL_MB=%ORIGINAL_SIZE% / 1048576
    set /a COMPRESSED_MB=%COMPRESSED_SIZE% / 1048576

    echo Original size: %ORIGINAL_MB% MB
    echo Compressed size: %COMPRESSED_MB% MB
    echo.
    echo Next steps:
    echo 1. Extract a poster image for faster loading
    echo 2. Run: ffmpeg -i "%OUTPUT%" -ss 00:00:02 -vframes 1 frontend\public\images\hero-poster.jpg
    echo.
) else (
    echo.
    echo ERROR: Compression failed!
    echo Make sure FFmpeg is installed and in your PATH
    echo.
)

pause
