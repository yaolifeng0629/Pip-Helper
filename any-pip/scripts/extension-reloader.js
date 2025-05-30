// Chrome扩展自动重载脚本
// 在开发过程中自动检测文件变化并重载扩展

const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")

class ExtensionReloader {
  constructor() {
    this.distPath = path.join(__dirname, "../dist")
    this.manifestPath = path.join(this.distPath, "manifest.json")
    this.lastModified = new Map()
    this.isReloading = false
  }

  // 检查文件是否存在
  checkFiles() {
    const requiredFiles = ["manifest.json", "background.js", "content.js", "popup.html", "options.html"]

    const missingFiles = requiredFiles.filter((file) => {
      return !fs.existsSync(path.join(this.distPath, file))
    })

    if (missingFiles.length > 0) {
      console.log("❌ 缺失文件:", missingFiles.join(", "))
      return false
    }

    console.log("✅ 所有必需文件都存在")
    return true
  }

  // 获取文件修改时间
  getFileModTime(filePath) {
    try {
      return fs.statSync(filePath).mtime.getTime()
    } catch (error) {
      return 0
    }
  }

  // 检查文件是否有变化
  hasFileChanged(filePath) {
    const currentModTime = this.getFileModTime(filePath)
    const lastModTime = this.lastModified.get(filePath) || 0

    if (currentModTime > lastModTime) {
      this.lastModified.set(filePath, currentModTime)
      return true
    }

    return false
  }

  // 监听文件变化
  watchFiles() {
    console.log("👀 开始监听文件变化...")

    const watchPaths = [this.distPath]

    watchPaths.forEach((watchPath) => {
      if (fs.existsSync(watchPath)) {
        fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (filename && !this.isReloading) {
            console.log(`📝 文件变化: ${filename}`)
            this.scheduleReload()
          }
        })
      }
    })
  }

  // 延迟重载（避免频繁重载）
  scheduleReload() {
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer)
    }

    this.reloadTimer = setTimeout(() => {
      this.reloadExtension()
    }, 1000) // 1秒延迟
  }

  // 重载扩展
  reloadExtension() {
    if (this.isReloading) return

    this.isReloading = true
    console.log("🔄 重载扩展...")

    // 这里可以添加自动重载Chrome扩展的逻辑
    // 目前需要手动在Chrome中刷新
    console.log("请在Chrome扩展管理页面手动刷新扩展")

    setTimeout(() => {
      this.isReloading = false
    }, 2000)
  }

  // 启动监听
  start() {
    console.log("🚀 启动扩展重载器...")

    if (!this.checkFiles()) {
      console.log("请先构建项目: npm run build")
      return
    }

    this.watchFiles()
    console.log("✅ 监听已启动，修改文件后扩展将自动提示重载")
  }
}

// 启动重载器
const reloader = new ExtensionReloader()
reloader.start()

// 优雅退出
process.on("SIGINT", () => {
  console.log("\n👋 停止监听")
  process.exit(0)
})
