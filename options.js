// DOM elements
const timeoutInput = document.getElementById('timeout');
const patternsContainer = document.getElementById('patterns-container');
const addPatternButton = document.getElementById('add-pattern');
const saveButton = document.getElementById('save');
const statusElement = document.getElementById('status');

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get('tabCloserSettings', (result) => {
    const settings = result.tabCloserSettings || DEFAULT_SETTINGS;
    
    // Set timeout value
    timeoutInput.value = settings.timeoutSeconds;
    
    // Clear existing patterns
    patternsContainer.innerHTML = '';
    
    // Add pattern rows
    settings.urlPatterns.forEach(patternObj => {
      addPatternRow(patternObj.pattern, patternObj.enabled);
    });
  });
}

// Create a new pattern row
function addPatternRow(pattern = '', enabled = true) {
  const row = document.createElement('div');
  row.className = 'pattern-row';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = enabled;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = pattern;
  input.placeholder = 'Enter URL pattern (e.g., facebook.com)';
  
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => {
    row.remove();
  });
  
  row.appendChild(checkbox);
  row.appendChild(input);
  row.appendChild(removeButton);
  
  patternsContainer.appendChild(row);
}

// Save settings to storage
function saveSettings() {
  const patternRows = patternsContainer.querySelectorAll('.pattern-row');
  const urlPatterns = [];
  
  patternRows.forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const input = row.querySelector('input[type="text"]');
    
    if (input.value.trim()) {
      urlPatterns.push({
        pattern: input.value.trim(),
        enabled: checkbox.checked
      });
    }
  });
  
  const settings = {
    urlPatterns,
    timeoutSeconds: parseInt(timeoutInput.value, 10) || 5
  };
  
  chrome.storage.sync.set({ tabCloserSettings: settings }, () => {
    // Show saved message
    statusElement.classList.add('show');
    setTimeout(() => {
      statusElement.classList.remove('show');
    }, 2000);
  });
}

// Event listeners
addPatternButton.addEventListener('click', () => {
  addPatternRow();
});

saveButton.addEventListener('click', saveSettings);

// Load settings when page loads
document.addEventListener('DOMContentLoaded', loadSettings); 