document.addEventListener("DOMContentLoaded", () => {
  const pasteBtn = document.querySelector("#submit");
  const codeElem = document.querySelector("#code");
  const status = document.querySelector("#status");
  const clipboardBtn = document.querySelector("#btn-clipboard");
  const clearBtn = document.querySelector("#btn-clear");

  // Focus textarea on load
  if (codeElem) {
    codeElem.focus();
  }

  // Keyboard shortcut: Ctrl + Enter to submit & Tab indentation
  codeElem.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
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
