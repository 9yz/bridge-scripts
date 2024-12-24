# Bridge Scripts
A collection of useful scripts I've made for Adobe Bridge. This readme contains basic information on the scripts - for more comprehensive information, see the [wiki](https://github.com/9yz/bridge-scripts/wiki).

## Scripts
### copyMetadata
A simple interface for copying selected metadata fields between files. These fields can be copied:
- Headline
- Description
- Keywords
- Alt Text (Alt Text & Extended Description)
- Location (Sublocation, City, State, Country, and Country Code)
- Title
#### Usage:
1. Select a file.
2. Right click > Copy Property... OR Tools > Copy Property...
3. Select the fields you would like to be copied
4. Select the files you would like to paste to
5. Right click > Paste Property OR Tools > Paste Property. You have the option of Overwriting the existing values or Appending, which appends Keywords but overwrites other fields.

### textSubstitutions
Inspired by the PhotoMechanic's code replacements feature, this lets you designate special codes to be replaced by any kind of text! For example, typing `[[tTime]]` in the description of an image then running this tool will replace it with the timestamp the photo was created. `[[mFileName]]` will be replaced with the file's name. In addition to nearly 50 special codes that retrieve the file's metadata, you can also create your own substitutions.

Text Substiutions currently work in these metadata fields:
- City, State, Country, Sublocation
- Title
- Headline
- Alt Text
- Extended Description
- Keywords
- Description

#### Usage
1. Edit one of the above properties of any file to include a [code](https://github.com/9yz/bridge-scripts/wiki/Built%E2%80%90In-Substitutions).
2. Run Text Substitutions from the right-click (context) or Tools menu.

##### Creating Custom Substitutions
After installing [textSubstitutions.jsx](textSubstitutions.jsx) as described below, install [ts_customSubstitutions.jsx](ts_customSubstitutions.txt) the same way. The file contains information on the format for custom substitutions.

### scratchPad
Opens a simple, dockable text box for taking notes. Contents are not saved on program close.

#### Usage
1. Select Window > Scratch Pad
2. Move the newly-created window to the location of your choice.

## Installation
1. Go to Preferences and select the "Startup Scripts" tab.
2. Click "Reveal Scripts in Explorer"
3. Place the script file in the folder that opens
4. Restart Bridge
5. When prompted upon restarting, choose to enable the script.
6. If the script is not enabled, go to Preferences > Startup Scripts and enable the script, then restart Bridge
