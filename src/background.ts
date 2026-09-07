import type { PipRequest, PipResponse, PipStateChangedMessage } from "~/utils/pipMessages"

const iconPath = {
  normal: (chrome.runtime.getManifest().icons || {}) as Record<string, string>,
  active: {
    16: "assets/pip-icons/active-16.png",
    32: "assets/pip-icons/active-32.png",
    48: "assets/pip-icons/active-48.png",
    96: "assets/pip-icons/active-96.png",
    128: "assets/pip-icons/active-128.png"
  }
}

const actionApi = (chrome.action || chrome.browserAction) as typeof chrome.action

async function sendPipRequest(tabId: number, request: PipRequest): Promise<PipResponse | null> {
  try {
    return await chrome.tabs.sendMessage(tabId, request) as PipResponse
  } catch (error) {
    console.debug("PiP content script is unavailable for this tab:", error)
    return null
  }
}

function handleRuntimeMessage(message: unknown, sender: chrome.runtime.MessageSender): void {
  const stateMessage = message as Partial<PipStateChangedMessage>
  if (stateMessage.type !== "pip:state-changed" || !stateMessage.state || !sender.tab?.id) return

  const { state } = stateMessage as PipStateChangedMessage
  void updateIcon(sender.tab.id, state.status === "active")
  void updateBadge(sender.tab.id, state.status === "active" ? "ON" : state.candidateCount)
}

async function handleCommand(command: string): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return

  if (command === "activate-pip") {
    await sendPipRequest(tab.id, { type: "pip:toggle" })
  }

  if (command === "return-to-tab") {
    await chrome.tabs.update(tab.id, { active: true })
  }
}

async function createContextMenus(): Promise<void> {
  try {
    await chrome.contextMenus.removeAll()
    chrome.contextMenus.create({
      id: "pip-toggle",
      title: "Play in Picture-in-Picture",
      contexts: ["video"]
    })

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === "pip-toggle" && tab?.id) {
        void sendPipRequest(tab.id, { type: "pip:toggle" })
      }
    })
  } catch (error) {
    console.error("Failed to create context menu", error)
  }
}

async function updateIcon(tabId: number, active: boolean): Promise<void> {
  try {
    await actionApi.setIcon({ path: active ? iconPath.active : iconPath.normal, tabId })
  } catch (error) {
    console.debug("Failed to update icon", error)
  }
}

async function updateBadge(tabId: number, value: number | string): Promise<void> {
  try {
    await actionApi.setBadgeText({
      text: typeof value === "number" && value > 0 ? String(value) : typeof value === "string" ? value : "",
      tabId
    })
    await actionApi.setBadgeTextColor({ color: "#FFFFFF", tabId })
    await actionApi.setBadgeBackgroundColor({ color: "#1f7660", tabId })
  } catch (error) {
    console.debug("Failed to update badge", error)
  }
}

chrome.runtime.onMessage.addListener(handleRuntimeMessage)
chrome.commands.onCommand.addListener((command) => void handleCommand(command))
void createContextMenus()
