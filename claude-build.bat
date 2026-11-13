@echo off
cd /d D:\vamos-properties-llc
echo BUILD_START %DATE% %TIME% > claude-build-log.txt
call npm run build >> claude-build-log.txt 2>&1
echo BUILD_EXIT_CODE=%ERRORLEVEL% >> claude-build-log.txt
exit
