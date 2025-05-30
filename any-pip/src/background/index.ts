import { defineBackground } from "wxt/background"
import { MESSAGE_TYPES } from "../utils/types"
import * as chrome from "webextension-polyfill"

export default defineBackground({
  main() {
    // 监听扩展图标点击
    chrome.action.onClicked.addListener(handleActionClick)

    // 监听快捷键
    chrome.commands.onCommand.addListener(handleCommand)

    // 创建右键菜单
    createContextMenus()

    // 监听标签页更新
    chrome.tabs.onUpdated.addListener(handleTabUpdate)

    console.log("PiP Extension background service started")
  },
})

async function handleActionClick(tab: chrome.tabs.Tab) {
  if (!tab.id) return

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_TYPES.TOGGLE_PIP,
    })
  } catch (error) {
    console.error("Failed to send message to content script:", error)
  }
}

async function handleCommand(command: string) {
  if (command === "toggle-pip") {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (activeTab?.id) {
      await handleActionClick(activeTab)
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender) => {
  switch (message.type) {
    case MESSAGE_TYPES.VIDEO_DETECTED:
      updateBadge(sender.tab?.id, message.count)
      break

    case MESSAGE_TYPES.PIP_STATUS_CHANGED:
      updateIcon(sender.tab?.id, message.active)
      break
  }
})

async function createContextMenus() {
  try {
    await chrome.contextMenus.removeAll()

    chrome.contextMenus.create({
      id: "pip-toggle",
      title: "画中画播放",
      contexts: ["video"],
    })

    chrome.contextMenus.create({
      id: "pip-settings",
      title: "插件设置",
      contexts: ["action"],
    })

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === "pip-toggle" && tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: MESSAGE_TYPES.TOGGLE_PIP,
        })
      } else if (info.menuItemId === "pip-settings") {
        await chrome.runtime.openOptionsPage()
      }
    })
  } catch (error) {
    console.error("Failed to create context menus:", error)
  }
}

async function updateBadge(tabId: number | undefined, count: number) {
  if (!tabId) return

  try {
    await chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : "",
      tabId,
    })

    await chrome.action.setBadgeBackgroundColor({
      color: "#4285f4",
      tabId,
    })
  } catch (error) {
    console.error("Failed to update badge:", error)
  }
}

async function updateIcon(tabId: number | undefined, pipActive: boolean) {
  if (!tabId) return

  try {
    const iconPath = pipActive ? "assets/icons/icon-active" : "assets/icons/icon"
    await chrome.action.setIcon({
      path: {
        16: `${iconPath}16.png`,
        32: `${iconPath}32.png`,
        48: `${iconPath}48.png`,
        128: `${iconPath}128.png`,
      },
      tabId,
    })
  } catch (error) {
    console.error("Failed to update icon:", error)
  }
}

async function handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) {
  if (changeInfo.status === "complete") {
    // 重置图标和徽章
    await updateIcon(tabId, false)
    await updateBadge(tabId, 0)
  }
}
