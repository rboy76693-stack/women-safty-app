@echo off
echo Starting SafeGuard...
cd /d "C:\Users\kshit\Desktop\Rehan project\women-safety-app"
pm2 delete all 2>nul
pm2 start ecosystem.config.js
pm2 save
echo SafeGuard is running!
echo Check ngrok URL at: http://localhost:4040
pause
