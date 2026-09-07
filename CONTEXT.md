# Pip-Helper

Pip-Helper is a browser extension that lets a person move a playable webpage video into native Picture-in-Picture. This context establishes the product vocabulary used for its user-visible behavior.

## Language

**General Web PiP**:
The reliable selection and activation of native Picture-in-Picture for standard HTML video elements across ordinary websites.
_Avoid_: Site-specific player integration, platform adapter

**Control Center**:
The extension popup where a person reviews video availability, starts PiP, chooses among candidates, and manages PiP rules.
_Avoid_: Direct toolbar action, settings-only popup

**PiP Candidate**:
A visible, enabled HTML video element that is eligible to be selected for native Picture-in-Picture.
_Avoid_: Any video element, background video, hidden ad

**Site Access Mode**:
The global rule that decides whether PiP is normally available or normally blocked before a website appears in an exception list.
_Avoid_: Implicit whitelist behavior, mixed blacklist and whitelist rules

**Supported Browser**:
A browser for which PiP activation, site rules, and the control center are release requirements.
_Avoid_: Best-effort browser, Chromium-only support

**Native PiP Controls**:
The controls provided by the browser in its native Picture-in-Picture window for a selected video.
_Avoid_: Injected PiP controls, simulated PiP window

**PiP Session**:
The period from when a selected video enters native Picture-in-Picture until that video leaves it.
_Avoid_: Popup open state, video detection state

**Current-Site Rule**:
The exception a person can add or remove from the control center for the website in the active tab.
_Avoid_: Global preference, implicit rule change
