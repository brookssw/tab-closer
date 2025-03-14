# Tab Closer Chrome Extension

A Chrome extension that automatically closes tabs with matching URL patterns after a configurable timeout.

## Features

- Automatically close tabs with URLs matching specific patterns
- Configure multiple URL patterns to match
- Enable/disable individual patterns
- Set custom timeout duration (in seconds)
- Visual countdown banner on tabs scheduled for closing
- Simple popup interface for quick status overview
- Detailed options page for configuration

## Default Settings

The extension comes with the following default settings:
- Default timeout: 5 seconds
- Default URL patterns:
  - peerspace.twingate.com/client-auth-status
  - peerspace.zoom.us/j/

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the directory containing this extension
5. The extension should now be installed and active

## Usage

### Basic Configuration

1. Click on the Tab Closer icon in your Chrome toolbar
2. Click the "Options" button to open the configuration page
3. Set the desired timeout duration (in seconds)
4. Add URL patterns to match (e.g., "facebook.com", "twitter.com")
5. Enable/disable patterns using the checkboxes
6. Click "Save Settings" to apply your changes

### How It Works

- When you open a tab with a URL that contains any of your enabled patterns, the extension will start a timer
- A countdown banner will appear at the top of the page showing the time remaining until the tab closes
- After the specified timeout duration, the tab will automatically close
- You can see which patterns are active in the popup by clicking the extension icon

## Notes

- URL patterns are simple string matches (not regular expressions)
- A tab will be closed if its URL contains any of the enabled patterns
- The extension needs the "tabs", "storage", and "scripting" permissions to function properly

## License

MIT 