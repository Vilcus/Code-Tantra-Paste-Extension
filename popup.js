document.addEventListener("DOMContentLoaded", () => {
  const pasteBtn = document.querySelector("#submit");
  const codeElem = document.querySelector("#code");
  const status = document.querySelector("#status");
  const clipboardBtn = document.querySelector("#btn-clipboard");
  const clearBtn = document.querySelector("#btn-clear");
  const keyBtn = document.querySelector("#btn-change-key");

  // Load custom hotkey (Ctrl + [customKey]), default is "Enter"
  let customKey = localStorage.getItem("vilcus_paste_key") || "Enter";
  let isRecording = false;

  function formatKeyName(key, code) {
    if (key === " " || code === "Space") return "Space";
    if (key.length === 1) return key.toUpperCase();
    return key;
  }

  function updateKeyBadge() {
    if (keyBtn) {
      keyBtn.textContent = customKey;
    }
    const hintKeyElem = document.querySelector("#hint-key-name");
    if (hintKeyElem) {
      hintKeyElem.textContent = `"${customKey.toLowerCase()}"`;
    }
  }

  updateKeyBadge();

  // Sync with chrome.storage.local if available
  if (typeof chrome !== "undefined" && chrome?.storage?.local) {
    chrome.storage.local.get(["vilcus_paste_key"], (result) => {
      if (result && result.vilcus_paste_key) {
        customKey = result.vilcus_paste_key;
        localStorage.setItem("vilcus_paste_key", customKey);
        updateKeyBadge();
      }
    });
  }

  // Hotkey customization listener
  if (keyBtn) {
    keyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isRecording) {
        isRecording = false;
        keyBtn.classList.remove("recording");
        updateKeyBadge();
        return;
      }

      isRecording = true;
      keyBtn.classList.add("recording");
      keyBtn.textContent = "PRESS KEY...";

      const onCaptureKey = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        // Cancel on Escape
        if (ev.key === "Escape") {
          isRecording = false;
          keyBtn.classList.remove("recording");
          updateKeyBadge();
          window.removeEventListener("keydown", onCaptureKey, true);
          return;
        }

        // Ctrl is required, so ignore Control key itself and wait for companion key
        if (ev.key === "Control" || ev.key === "Meta") {
          return;
        }

        const pickedKey = formatKeyName(ev.key, ev.code);
        if (pickedKey) {
          customKey = pickedKey;
          localStorage.setItem("vilcus_paste_key", customKey);
          if (typeof chrome !== "undefined" && chrome?.storage?.local) {
            chrome.storage.local.set({ vilcus_paste_key: customKey });
          }
        }

        isRecording = false;
        keyBtn.classList.remove("recording");
        updateKeyBadge();
        window.removeEventListener("keydown", onCaptureKey, true);
        if (codeElem) codeElem.focus();
      };

      window.addEventListener("keydown", onCaptureKey, true);
    });

    // Cancel recording if user clicks anywhere outside
    document.addEventListener("click", (e) => {
      if (isRecording && e.target !== keyBtn) {
        isRecording = false;
        keyBtn.classList.remove("recording");
        updateKeyBadge();
      }
    });
  }

  // Focus textarea on load
  if (codeElem) {
    codeElem.focus();
  }

  // Check if a key event matches Ctrl + [customKey]
  function isCustomShortcut(e) {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (!isCtrl) return false;

    const pressed = formatKeyName(e.key, e.code);
    return (
      pressed.toLowerCase() === customKey.toLowerCase() ||
      e.key.toLowerCase() === customKey.toLowerCase()
    );
  }

  // Keyboard shortcut listener inside code editor
  codeElem.addEventListener("keydown", (e) => {
    if (isRecording) return;

    if (isCustomShortcut(e)) {
      e.preventDefault();
      pasteBtn.click();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const start = codeElem.selectionStart;
      const end = codeElem.selectionEnd;
      const tabSpaces = "  ";

      codeElem.value =
        codeElem.value.substring(0, start) +
        tabSpaces +
        codeElem.value.substring(end);

      codeElem.selectionStart = codeElem.selectionEnd = start + tabSpaces.length;
    }
  });

  // Global window listener for the shortcut when not typing
  window.addEventListener("keydown", (e) => {
    if (isRecording) return;
    if (document.activeElement === codeElem) return; // handled by codeElem listener

    if (isCustomShortcut(e)) {
      e.preventDefault();
      pasteBtn.click();
    }
  });

  function showStatus(text, type = "info") {
    if (!status) return;
    if (!text) {
      status.className = "";
      status.textContent = "";
      return;
    }
    status.className = `visible status-${type}`;
    status.textContent = text;
  }

  // Clipboard button action
  if (clipboardBtn) {
    clipboardBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          codeElem.value = text;
          codeElem.focus();
        } else {
          showStatus("Please enter code first.", "error");
        }
      } catch (err) {
        codeElem.focus();
      }
    });
  }

  // Clear button action
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      codeElem.value = "";
      showStatus("");
      codeElem.focus();
    });
  }

  // Paste / Submit action
  pasteBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const code = codeElem.value.trim();
    if (!code) {
      showStatus("Please enter code first.", "error");
      codeElem.focus();
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.id) {
      showStatus("No active tab found.", "error");
      return;
    }

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (userCode) => {
          const editor = document.querySelector(".cm-content");
          if (!editor) return { ok: false, error: "Editor not found" };

          const div = document.createElement("div");
          div.classList.add("cm-activeLine", "cm-line");
          div.textContent = userCode;
          div.style.whiteSpace = "pre";
          editor.appendChild(div);
          return { ok: true };
        },
        args: [code],
      });

      // Aggregate frame responses
      const success = results && results.some((r) => r?.result?.ok);
      if (success) {
        showStatus("Code pasted successfully ✅", "success");
        setTimeout(() => window.close(), 450);
      } else {
        console.log("Frame results:", results);
        showStatus("Pasting failed: Editor not found", "error");
      }
    } catch (err) {
      console.error(err);
      showStatus(
        "This page isn’t supported. Please open a CodeTantra editor page.",
        "error"
      );
    }
  });
});
