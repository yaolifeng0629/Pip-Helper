# Content Controller Owns PiP State

The content script owns video discovery, native PiP lifecycle, and the current-site rule because those facts exist in the page document. The popup and background script request or display that state through typed messages instead of independently inferring it, preventing stale badge, popup, and PiP status from competing with each other.
