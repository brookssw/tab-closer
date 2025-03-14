// DOM elements
const statusText = document.getElementById('status-text');
const timeoutValue = document.getElementById('timeout-value');
const patternsList = document.getElementById('patterns-list');
const optionsButton = document.getElementById('options-button');

// Load and display settings
function loadSettings() {
  chrome.storage.sync.get('tabCloserSettings', (result) => {
    const settings = result.tabCloserSettings || DEFAULT_SETTINGS;
    
    // Update timeout display
    timeoutValue.textContent = settings.timeoutSeconds;
    
    // Update status text
    const enabledPatterns = settings.urlPatterns.filter(p => p.enabled);
    if (enabledPatterns.length > 0) {
      statusText.textContent = 'Tab Closer is active';
      statusText.className = 'status-enabled';
    } else {
      statusText.textContent = 'No active patterns';
      statusText.className = 'status-disabled';
    }
    
    // Clear and update patterns list
    patternsList.innerHTML = '';
    
    if (settings.urlPatterns.length === 0) {
      const noPatterns = document.createElement('div');
      noPatterns.textContent = 'No patterns configured';
      patternsList.appendChild(noPatterns);
    } else {
      settings.urlPatterns.forEach(patternObj => {
        const patternItem = document.createElement('div');
        patternItem.className = 'pattern-item' + (patternObj.enabled ? '' : ' pattern-disabled');
        
        const patternText = document.createElement('span');
        patternText.textContent = patternObj.pattern;
        
        const patternStatus = document.createElement('span');
        patternStatus.textContent = patternObj.enabled ? 'Active' : 'Disabled';
        
        patternItem.appendChild(patternText);
        patternItem.appendChild(patternStatus);
        
        patternsList.appendChild(patternItem);
      });
    }
  });
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Event listeners
optionsButton.addEventListener('click', openOptions);

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', loadSettings); 