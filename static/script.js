const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const charCount = document.getElementById("charCount");
const audioPlayer = document.getElementById("audioPlayer");

const sourceSelect = document.getElementById("sourceLang")
const targetSelect = document.getElementById("targetLang")
const sourceSpeakBtn = document.getElementById("sourceSpeakBtn")
const targetSpeakBtn = document.getElementById("targetSpeakBtn")


function copyText() {
  if (!outputText.value) return;
  navigator.clipboard.writeText(outputText.value).then(() => {
    showToast("Copied to clipboard!")
  });
}

function showToast(message, type="default") {
  const toast = document.createElement("div");

  toast.className = "toast";
  if (type==="error") toast.classList.add("error-toast");

  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}

function updateSpeakButtons() {
  if(sourceSpeakBtn && sourceSelect) {
    sourceSpeakBtn.disabled = sourceSelect.value === "auto" || !ttsLanguages.includes(sourceSelect.value);
  }

  if (targetSpeakBtn && targetSelect) {
    targetSpeakBtn.disabled = !ttsLanguages.includes(targetSelect.value);
  }
}


async function handleTranslate() {
  const text = inputText.value.trim();
  const sourceLang = sourceSelect.value;
  const targetLang = targetSelect.value;

  if (!text) {
    outputText.value = "";
    return;
  }

  outputText.value = "";
  outputText.placeholder = "Translating...";

  try {
    const response = await fetch("/translate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        text: text,
        source_language: sourceLang,
        target_language: targetLang
      })
    });

    const data = await response.json();

    if (data.error) {
      outputText.value = "";
      outputText.placeholder = "Translated text appears here...";
      showToast(data.error, "error");
    } else {
      outputText.value = data.translated_text || "";
      outputText.placeholder = "Translated text appears here...";
    }
  } catch (err) {
    outputText.value = "";
    showToast("Translation failed", "error");
  }
}

function speakText(textAreaId, languageCode) {
  const text = document.getElementById(textAreaId).value.trim();

  if(!text || languageCode==="auto" || !ttsLanguages.includes(languageCode)) return;

  audioPlayer.pause();
  audioPlayer.currentTime=0;

  fetch("/speak", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      text: text,
      language_code: languageCode
    })
  })
  .then(response => response.json())
  .then(data => {
    if(data.audio) {
      audioPlayer.src = "data:audio/mp3;base64,"+data.audio;
      audioPlayer.style.display="block";
      audioPlayer.play();
    }
  });
}


if(inputText) {
  inputText.addEventListener("input", () => {
    charCount.textContent = inputText.value.length + "/" + inputText.maxLength;
    outputText.value = "";
  });
}

if(targetSelect) {
  targetSelect.addEventListener("change", () => {
    handleTranslate();
    updateSpeakButtons();
  });
}

if(sourceSelect) {
  sourceSelect.addEventListener("change", () => {
    updateSpeakButtons();
  });
}

if(sourceSpeakBtn) {
  sourceSpeakBtn.addEventListener("click", () => {
    speakText("inputText", sourceSelect.value);
  });
}

if(targetSpeakBtn) {
  targetSpeakBtn.addEventListener("click", () => {
    speakText("outputText", targetSelect.value);
  });
}

document.addEventListener("DOMContentLoaded", function () { 
  updateSpeakButtons();
  if (inputText && charCount) {
    charCount.textContent = inputText.value.length + "/" + inputText.maxLength;
  }
});
