@echo off
rem Abre La Torre de Morvath en el navegador (necesita un servidor local por los modulos JS)
cd /d "%~dp0"
start "" http://localhost:8750
python -m http.server 8750 --bind 127.0.0.1
