#!/bin/bash

# Chrome扩展开发环境设置脚本

echo "🚀 设置Chrome扩展开发环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装"
    exit 1
fi

echo "✅ npm版本: $(npm --version)"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位于: ./dist"
    echo ""
    echo "🔧 下一步操作："
    echo "1. 打开Chrome浏览器"
    echo "2. 访问 chrome://extensions/"
    echo "3. 启用'开发者模式'"
    echo "4. 点击'加载已解压的扩展程序'"
    echo "5. 选择项目的 'dist' 文件夹"
    echo ""
    echo "🎯 开发命令："
    echo "  npm run dev     - 开发模式（监听文件变化）"
    echo "  npm run build   - 生产构建"
    echo "  npm run refresh - 快速重新构建"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi
