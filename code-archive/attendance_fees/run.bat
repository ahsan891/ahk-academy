@echo off
cd /d "%~dp0"
echo.
echo  Installing/checking dependencies...
"C:\Users\ahk79\AppData\Local\Python\bin\python.exe" -m pip install flask --quiet
echo.
echo  Starting EduTrack Attendance ^& Fees System...
echo  Open your browser at: http://127.0.0.1:5000
echo.
"C:\Users\ahk79\AppData\Local\Python\bin\python.exe" app.py
pause
