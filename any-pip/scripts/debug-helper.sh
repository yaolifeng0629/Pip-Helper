#!/bin/bash

# Chrome扩展调试辅助脚本

echo "🐛 Chrome扩展调试助手"
echo "===================="

# 检查Chrome进程
chrome_running=$(pgrep -f "Google Chrome" | wc -l)
if [ $chrome_running -gt 0 ]; then
    echo "✅ Chrome正在运行 ($chrome_running 个进程)"
else
    echo "❌ Chrome未运行，请先启动Chrome"
fi

# 检查构建文件
if [ -d "dist" ]; then
    echo "✅ 构建文件存在"
    echo "📁 构建文件列表:"
    ls -la dist/
else
    echo "❌ 构建文件不存在，请先运行 npm run build"
    exit 1
fi

# 检查manifest.json
if [ -f "dist/manifest.json" ]; then
    echo "✅ manifest.json存在"
    # 验证JSON格式
    if command -v jq &> /dev/null; then
        if jq empty dist/manifest.json 2>/dev/null; then
            echo "✅ manifest.json格式正确"
        else
            echo "❌ manifest.json格式错误"
            jq . dist/manifest.json
        fi
    fi
else
    echo "❌ manifest.json不存在"
fi

# 检查图标文件
echo ""
echo "🎨 图标文件检查:"
for size in 16 32 48 128; do
    if [ -f "icons/icon${size}.png" ]; then
        echo "✅ icon${size}.png 存在"
    else
        echo "❌ icon${size}.png 缺失"
    fi
done

# 提供调试链接
echo ""
echo "🔗 调试链接:"
echo "  扩展管理页面: chrome://extensions/"
echo "  扩展错误页面: chrome://extensions/?errors"
echo "  开发者工具: F12"

# 常用调试命令
echo ""
echo "🛠️ 常用调试命令:"
echo "  npm run dev      - 开发模式"
echo "  npm run build    - 重新构建"
echo "  npm run refresh  - 快速刷新"

# 检查端口占用
echo ""
echo "🌐 端口检查:"
if command -v lsof &> /dev/null; then
    port_3000=$(lsof -ti:3000)
    if [ ! -z "$port_3000" ]; then
        echo "⚠️  端口3000被占用 (PID: $port_3000)"
    else
        echo "✅ 端口3000可用"
    fi
fi
