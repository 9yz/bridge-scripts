# Bridge Scripts
A collection of useful scripts I've made for Adobe Bridge

## Scripts
### copyMetadata
A simple interface for copying selected metadata fields between files. These fields can be copied:
- Headline
- Description
- Keywords
- Alt Text (Alt Text & Extended Description)
- Location (Sublocation, City, State, Country, and Country Code)
#### Usage:
1. Select a file.
2. Right click > Copy Property... OR Tools > Copy Property...
3. Select the fields you would like to be copied
4. Select the files you would like to paste to
5. Right click > Paste Property OR Tools > Paste Property. You have the option of Overwriting the existing values or Appending, which appends Keywords but overwrites other fields.

Tested and working for Bridge 25.0 on Windows.

## Installation
1. Go to Preferences and select the "Startup Scripts" tab.
2. Click "Reveal Scripts in Explorer"
3. Place the script file in the folder that opens
4. Restart Bridge
5. When prompted upon restarting, choose to enable the script.
6. If the script is not enabled, go to Preferences > Startup Scripts and enable the script, then restart Bridge
