// DOM Elements
const triggerAuto = document.getElementById('trigger-auto');
const triggerManual = document.getElementById('trigger-manual');
const actionFill = document.getElementById('action-fill');
const actionSubmit = document.getElementById('action-submit');
const loopMode = document.getElementById('loop-mode');
const loopContainer = document.getElementById('loop-container');
const loopLimit = document.getElementById('loop-limit');
const loopLimitContainer = document.getElementById('loop-limit-container');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file-input');
const fillNowBtn = document.getElementById('fill-now-btn');
const statusMessage = document.getElementById('status-message');
const dynamicContainer = document.getElementById('dynamic-questions-container');

// Default Settings
const defaultSettings = {
  trigger: 'auto',
  action: 'submit',
  loop: true,
  loopLimit: 0,
  percentages: {}
};

// Show a temporary status message
let statusTimeout;
function showStatus(text, isSaved = true) {
  statusMessage.textContent = text;
  if (isSaved) {
    statusMessage.classList.add('saved');
  } else {
    statusMessage.classList.remove('saved');
  }
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusMessage.textContent = 'Guardado automáticamente';
    statusMessage.classList.remove('saved');
  }, 2000);
}

// Update UI state (enable/disable loop option depending on action)
function updateUIState() {
  const isSubmitMode = actionSubmit.checked;
  if (isSubmitMode) {
    loopContainer.classList.remove('disabled');
    if (loopMode.checked) {
      loopLimitContainer.classList.remove('disabled');
    } else {
      loopLimitContainer.classList.add('disabled');
    }
  } else {
    loopContainer.classList.add('disabled');
    loopLimitContainer.classList.add('disabled');
  }
}

// Load settings from chrome.storage
function loadSettings() {
  chrome.storage.local.get(defaultSettings, (settings) => {
    if (settings.trigger === 'auto') {
      triggerAuto.checked = true;
    } else {
      triggerManual.checked = true;
    }

    if (settings.action === 'submit') {
      actionSubmit.checked = true;
    } else {
      actionFill.checked = true;
    }

    loopMode.checked = settings.loop;
    loopLimit.value = settings.loopLimit || 0;
    updateUIState();

    // Scan questions on active tab
    scanActiveTabQuestions();
  });
}

// Save settings to chrome.storage
function saveSettings() {
  const limitVal = parseInt(loopLimit.value);
  const settings = {
    trigger: triggerAuto.checked ? 'auto' : 'manual',
    action: actionSubmit.checked ? 'submit' : 'fill',
    loop: loopMode.checked,
    loopLimit: isNaN(limitVal) ? 0 : Math.max(0, limitVal)
  };

  chrome.storage.local.set(settings, () => {
    showStatus('Configuración guardada ✔');
    updateUIState();
  });
}

// Hook up change listeners
[triggerAuto, triggerManual, actionFill, actionSubmit, loopMode, loopLimit].forEach(el => {
  el.addEventListener('change', saveSettings);
  if (el === loopLimit) {
    el.addEventListener('input', saveSettings);
  }
});

// Scan questions in active Google Forms tab
function scanActiveTabQuestions() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      dynamicContainer.innerHTML = '<div class="no-questions">Error al conectar con la pestaña.</div>';
      return;
    }

    if (!tab.url || !tab.url.includes("docs.google.com/forms")) {
      dynamicContainer.innerHTML = '<div class="no-questions">Abre un formulario de Google para ver sus preguntas.</div>';
      return;
    }

    // Try messaging the content script
    chrome.tabs.sendMessage(tab.id, { action: "scan" }, (response) => {
      if (chrome.runtime.lastError) {
        // Not loaded yet, let's inject it first and then scan
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["chance.min.js", "content.js"]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            dynamicContainer.innerHTML = '<div class="no-questions">Error al inyectar script. Recarga la página.</div>';
          } else {
            // Wait and retry message
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: "scan" }, (retryResponse) => {
                if (retryResponse && retryResponse.questions) {
                  loadAndRender(retryResponse.questions);
                } else {
                  dynamicContainer.innerHTML = '<div class="no-questions">No se detectaron preguntas de opción.</div>';
                }
              });
            }, 400);
          }
        });
      } else if (response && response.questions) {
        loadAndRender(response.questions);
      } else {
        dynamicContainer.innerHTML = '<div class="no-questions">No se detectaron preguntas de opción.</div>';
      }
    });
  });
}

function loadAndRender(questions) {
  chrome.storage.local.get({ percentages: {} }, (result) => {
    renderQuestions(questions, result.percentages || {});
  });
}

function renderQuestions(questions, savedPercentages) {
  if (!questions || questions.length === 0) {
    dynamicContainer.innerHTML = '<div class="no-questions">No se encontraron preguntas de opción múltiple o casillas en esta página.</div>';
    return;
  }

  dynamicContainer.innerHTML = '';

  questions.forEach(q => {
    const card = document.createElement('div');
    card.className = 'question-card';

    const header = document.createElement('div');
    header.className = 'question-header-flex';

    const titleEl = document.createElement('span');
    titleEl.className = 'question-card-title';
    titleEl.textContent = q.title;
    header.appendChild(titleEl);

    // Sum validation badge for radio buttons
    let badge;
    if (q.type === 'radio') {
      badge = document.createElement('span');
      badge.className = 'validation-badge';
      header.appendChild(badge);
    }

    card.appendChild(header);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    // Retrieve saved weights or default
    const savedQuestionConfig = savedPercentages[q.title] || {};
    
    // Equal distribution defaults
    const defaultVal = q.type === 'radio' ? Math.floor(100 / q.options.length) : 50;

    const optionInputs = [];

    q.options.forEach((opt, idx) => {
      const row = document.createElement('div');
      row.className = 'option-row';

      const label = document.createElement('span');
      label.className = 'option-text-label';
      label.textContent = opt;
      row.appendChild(label);

      const inputWrap = document.createElement('div');
      inputWrap.className = 'option-input-wrap';

      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'option-input';
      input.min = '0';
      input.max = '100';

      // Load saved weight or distribute equally
      let val = savedQuestionConfig[opt];
      if (val === undefined) {
        if (q.type === 'radio') {
          // make last option cover remainder so it sums to 100%
          if (idx === q.options.length - 1) {
            val = 100 - (defaultVal * (q.options.length - 1));
          } else {
            val = defaultVal;
          }
        } else {
          val = defaultVal;
        }
      }
      input.value = val;

      inputWrap.appendChild(input);

      const percent = document.createElement('span');
      percent.className = 'option-percent-symbol';
      percent.textContent = '%';
      inputWrap.appendChild(percent);

      row.appendChild(inputWrap);
      optionsContainer.appendChild(row);

      optionInputs.push({ name: opt, input: input });

      // Save on input change
      input.addEventListener('input', () => {
        // Enforce bounds
        let v = parseInt(input.value) || 0;
        if (v < 0) v = 0;
        if (v > 100) v = 100;
        input.value = v;

        savePercentages();
        if (q.type === 'radio') {
          updateValidationBadge();
        }
      });
    });

    card.appendChild(optionsContainer);
    dynamicContainer.appendChild(card);

    // Initial badge update
    if (q.type === 'radio') {
      updateValidationBadge();
    }

    function updateValidationBadge() {
      if (!badge) return;
      const sum = optionInputs.reduce((acc, curr) => acc + (parseInt(curr.input.value) || 0), 0);
      if (sum === 100) {
        badge.className = 'validation-badge valid';
        badge.textContent = '100%';
      } else {
        badge.className = 'validation-badge invalid';
        badge.textContent = `${sum}%`;
      }
    }
  });
}

function savePercentages() {
  const percentages = {};
  const cards = dynamicContainer.querySelectorAll('.question-card');
  cards.forEach(card => {
    const title = card.querySelector('.question-card-title').textContent;
    percentages[title] = {};
    const rows = card.querySelectorAll('.option-row');
    rows.forEach(row => {
      const optText = row.querySelector('.option-text-label').textContent;
      const val = parseInt(row.querySelector('.option-input').value) || 0;
      percentages[title][optText] = val;
    });
  });

  // Get current storage, update percentages, and save
  chrome.storage.local.get({ percentages: {} }, (result) => {
    const current = result.percentages || {};
    // Merge new percentages with existing ones for other forms
    const updated = { ...current, ...percentages };
    chrome.storage.local.set({ percentages: updated }, () => {
      showStatus('Porcentajes guardados ✔');
    });
  });
}

// Trigger fill action
fillNowBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  if (!tab.url || !tab.url.includes("docs.google.com/forms")) {
    showStatus('Solo funciona en Google Forms ❌', false);
    return;
  }

  // Reset loop counter to start a new batch run
  chrome.storage.local.set({ currentLoopCount: 1 }, () => {
    chrome.tabs.sendMessage(tab.id, { action: "fill" }, (response) => {
      if (chrome.runtime.lastError) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["chance.min.js", "content.js"]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            showStatus('Error al inyectar script ❌', false);
          } else {
            showStatus('Ejecutando... 🚀');
          }
        });
      } else {
        showStatus('Rellenando... 🚀');
      }
    });
  });
});

// Export configurations
exportBtn.addEventListener('click', () => {
  chrome.storage.local.get(null, (items) => {
    // Exclude runtime loop states
    delete items.currentLoopCount;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "fakefiller-config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showStatus('Configuración exportada 📥');
  });
});

// Trigger import file selector
importBtn.addEventListener('click', () => {
  importFileInput.click();
});

// Import configurations from JSON file
importFileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedConfig = JSON.parse(e.target.result);
      if (typeof importedConfig !== 'object' || importedConfig === null) {
        throw new Error('Formato de JSON inválido');
      }

      // Save imported keys to chrome.storage
      chrome.storage.local.set(importedConfig, () => {
        showStatus('Configuración importada 📤');
        // Reload settings in the UI
        loadSettings();
      });
    } catch (err) {
      console.error(err);
      showStatus('Error al importar archivo ❌', false);
    }
  };
  reader.readAsText(file);
  // Reset value to allow importing same file again if modified
  importFileInput.value = '';
});

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);