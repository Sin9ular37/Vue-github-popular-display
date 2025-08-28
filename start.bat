@echo off
echo 启动 Vue GitHub 热门项目...
echo.

echo 1. 安装前端依赖...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败！
    pause
    exit /b 1
)

echo.
echo 2. 启动前端开发服务器...
start "Vue 前端" cmd /k "npm run dev"

echo.
echo 3. 可选：启动代理服务器...
echo 如果你有 GitHub Token，建议启动代理服务器以避免 API 限制
echo.
set /p start_proxy="是否启动代理服务器？(y/n): "
if /i "%start_proxy%"=="y" (
    echo 安装代理依赖...
    cd ../proxy
    call npm install
    if %errorlevel% equ 0 (
        echo 启动代理服务器...
        start "GitHub 代理" cmd /k "node server.js"
        echo 代理服务器已启动在 http://localhost:5174
        echo 请在前端目录创建 .env 文件并设置：VITE_API_BASE=http://localhost:5174/github
    ) else (
        echo 代理依赖安装失败！
    )
)

echo.
echo 前端应用将在 http://localhost:3000 启动
echo 按任意键退出...
pause >nul 