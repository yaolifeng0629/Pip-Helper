import type { PlasmoCSConfig } from "plasmo"

import { PipController } from "~/utils/pipController"
import { isPipRequest, type PipStateChangedMessage } from "~/utils/pipMessages"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const controller = new PipController((state) => {
  const message: PipStateChangedMessage = { type: "pip:state-changed", state }
  void chrome.runtime.sendMessage(message).catch(() => undefined)
})

controller.start()

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isPipRequest(message)) return

  void controller.handle(message).then(sendResponse)
  return true
})
