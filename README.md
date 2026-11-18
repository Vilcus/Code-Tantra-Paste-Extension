# Vilcus CT Paste

A sleek, lightweight browser extension designed to inject code directly into the CodeTantra online code editor with a single click or keyboard shortcut.

## Features

- **One-Click Injection:** Paste code directly into the active editor session.
- **Cyberpunk Dark UI:** High-contrast HUD-style dark theme with glowing accents.
- **Quick Actions:**
  - `[ Clipboard ]`: Import code directly from your system clipboard.
  - `[ Clear ]`: Reset the input editor instantly.
- **Customizable Keyboard Shortcut:** Defaults to `Ctrl + Enter` (or `Cmd + Enter`), with a clickable key-binder to swap `Enter` to any key of your choice (e.g. `Ctrl + Space`, `Ctrl + V`, `Ctrl + M`). `Ctrl` is always preserved as the primary trigger key.
- **Tab Key Indentation:** Preserves code structure by inserting two spaces on Tab.

## Installation (Unpacked Extension)

1. Clone or download this repository to your local machine.
2. Open Google Chrome and visit `chrome://extensions`.
3. Enable **Developer mode** in the upper-right corner.
4. Click **Load unpacked** in the top-left menu.
5. Select the folder containing these files.

## Permissions

- `activeTab`: Interacts with the currently selected browser tab.
- `scripting`: Executes the code insertion into the editor.
- `clipboardRead`: Reads text when the clipboard button is clicked.
- `host_permissions`: Scoped specifically to `https://*.codetantra.com/*`.


## Disclaimer

By installing, downloading, or using **Vilcus CT Paste**, you acknowledge and agree to the following terms:

1. **Educational & Productivity Purposes:** This tool is intended exclusively for educational, accessibility, and personal workflow testing purposes.
2. **Academic Integrity & Compliance:** You agree that you are solely responsible for adhering to your institution's academic honesty policies, examination guidelines, and CodeTantra's Terms of Service. The developer does not support, encourage, or take responsibility for academic dishonesty, unauthorized test assistance, or policy violations.
3. **No Liability ("As-Is"):** This software is provided on an "as-is" basis without warranties of any kind. The author shall not be held liable for any claims, penalties, account suspensions, lost grades, or data issues resulting from the use of this extension.
4. **Non-Affiliation:** This extension is an independent open-source project and is not affiliated with, endorsed by, or associated with CodeTantra or its parent entities.

## Author

Created and maintained by [**Vilcus**](https://github.com/Vilcus).