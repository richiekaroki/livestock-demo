@echo off
echo Wam Mfugo - Maestro E2E Tests
echo =============================
echo.
echo Prerequisites:
echo   1. Install Maestro CLI: curl -Ls "https://get.maestro.mobile.dev" | bash
echo   2. Connect Android device or start emulator
echo   3. Run: npx expo start (in apps/mobile)
echo.

echo Running tests...
maestro test .maestro/login.yaml
maestro test .maestro/navigation.yaml
maestro test .maestro/register-animal.yaml
maestro test .maestro/health-assessment.yaml

echo.
echo All tests complete!
pause
