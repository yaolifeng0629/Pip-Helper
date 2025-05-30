const fs = require("fs")
const path = require("path")

// 创建图标目录
const iconsDir = path.join(__dirname, "../icons")
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// 基础图标SVG
const baseIconSVG = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="paint0_linear_0_1" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
<stop stop-color="#667EEA"/>
<stop offset="1" stop-color="#764BA2"/>
</linearGradient>
</defs>
<!-- 背景 -->
<rect width="128" height="128" rx="24" fill="url(#paint0_linear_0_1)"/>
<!-- 大屏幕 -->
<rect x="16" y="32" width="96" height="64" rx="8" fill="white" fill-opacity="0.9"/>
<rect x="20" y="36" width="88" height="56" rx="4" fill="#333"/>
<!-- 播放按钮 -->
<polygon points="54,56 70,64 54,72" fill="white"/>
<!-- 小的浮动窗口 -->
<rect x="72" y="72" width="32" height="24" rx="4" fill="white" stroke="#667EEA" stroke-width="2"/>
<rect x="74" y="74" width="28" height="20" rx="2" fill="#333"/>
<polygon points="84,76 94,80 84,84" fill="white"/>
<!-- 连接线 -->
<path d="M76 76L96 76M96 76L92 72M96 76L92 80" stroke="#667EEA" stroke-width="2" stroke-linecap="round"/>
</svg>
`

// 激活状态图标SVG
const activeIconSVG = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="paint0_linear_0_1" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
<stop stop-color="#22C55E"/>
<stop offset="1" stop-color="#16A34A"/>
</linearGradient>
</defs>
<!-- 背景 -->
<rect width="128" height="128" rx="24" fill="url(#paint0_linear_0_1)"/>
<!-- 大屏幕 -->
<rect x="16" y="32" width="96" height="64" rx="8" fill="white" fill-opacity="0.9"/>
<rect x="20" y="36" width="88" height="56" rx="4" fill="#333"/>
<!-- 播放按钮 -->
<polygon points="54,56 70,64 54,72" fill="white"/>
<!-- 激活的小窗口 -->
<rect x="72" y="72" width="32" height="24" rx="4" fill="#22C55E" stroke="#22C55E" stroke-width="2"/>
<rect x="74" y="74" width="28" height="20" rx="2" fill="#333"/>
<polygon points="84,76 94,80 84,84" fill="white"/>
<!-- 激活指示灯 -->
<circle cx="104" cy="68" r="6" fill="#22C55E"/>
<circle cx="104" cy="68" r="3" fill="white"/>
<!-- 连接线 -->
<path d="M76 76L96 76M96 76L92 72M96 76L92 80" stroke="#22C55E" stroke-width="2" stroke-linecap="round"/>
</svg>
`

// 写入SVG文件
fs.writeFileSync(path.join(iconsDir, "icon.svg"), baseIconSVG.trim())
fs.writeFileSync(path.join(iconsDir, "icon-active.svg"), activeIconSVG.trim())

// 生成不同尺寸的PNG文件的HTML模板
const generatePNGHTML = (svgContent, size, filename) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="canvas" width="${size}" height="${size}"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const svgBlob = new Blob([\`${svgContent}\`], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(svgBlob);

        img.onload = function() {
            ctx.drawImage(img, 0, 0, ${size}, ${size});

            // 下载PNG
            canvas.toBlob(function(blob) {
                const link = document.createElement('a');
                link.download = '${filename}';
                link.href = URL.createObjectURL(blob);
                link.click();
            });

            URL.revokeObjectURL(url);
        };

        img.src = url;
    </script>
</body>
</html>
`

// 生成PNG转换HTML文件
const sizes = [16, 32, 48, 96, 128]

sizes.forEach((size) => {
  // 基础图标
  const baseHTML = generatePNGHTML(baseIconSVG, size, `icon${size}.png`)
  fs.writeFileSync(path.join(iconsDir, `generate-icon${size}.html`), baseHTML)

  // 激活状态图标
  const activeHTML = generatePNGHTML(activeIconSVG, size, `icon-active${size}.png`)
  fs.writeFileSync(path.join(iconsDir, `generate-icon-active${size}.html`), activeHTML)
})

console.log("图标文件已生成！")
console.log("请在浏览器中打开 icons/ 目录下的 generate-*.html 文件来下载PNG图标")
