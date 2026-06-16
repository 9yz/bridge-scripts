/*
@@@START_XML@@@
<?xml version="1.0" encoding="UTF-8"?>
<ScriptInfo xmlns:dc="http://purl.org/dc/elements/1.1/" xml:lang="en_US">
<dc:title>Script Name</dc:title>
<dc:description>The text here is displayed in Bridge's Startup Script listing and defined in the header of the script file.</dc:description>
<dc:source>This field is not displayed in Bridge but is suggested as a helpful include in Adobe's documentation.</dc:source>
@@@END_XML@@
*/

// The above block defines metadata for the script; it is used by Bridge in the listing for Startup Scripts in the preferences window.

/* 

	scriptFramework.jsx

	A simple framework for developers to builf off of.

*/


// for the ExtendScript ToolKit (ESTK)
#target bridge 

// STARTUP FUNCTION: run when bridge starts, used for setup
if(BridgeTalk.appName == 'bridge'){ 
	try{


		if(Folder.fs == "Windows"){ // run only on windows
			if( xmpLib == undefined ) var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.dll"; // Load the XMP Script library
		} 
		else { // run only on mac
			if( xmpLib == undefined ) var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.framework"; // Load the XMP Script library
		}


		// MENU OPTIONS

		// Tools menu buttons
		var toolsOption = MenuElement.create('command', 'Script - Tools Option', 'at the end of Tools'); // create an item in the Tools menu
		if(MenuElement.find('toolsFolder') == null){ 
			MenuElement.create('menu', 'Script - Tools Folder', 'at the end of Tools', 'toolsFolder'); // create a folder in the Tools menu
		}
		var toolsFolderOption = MenuElement.create('command', 'Script - Tools Folder Option', 'at the end of toolsFolder'); // create an item in the folder we just created

		// Context (right-click) menu buttons
		if(MenuElement.find('contextFolder') == null){
			MenuElement.create('menu', 'Script - Context Menu Folder', 'after Thumbnail/Open', 'contextFolder');
		}
		var contextFolderOption = MenuElement.create('command', 'Script - Context Folder Option', 'at the end of contextFolder');
		var contextOption = MenuElement.create('command', 'Script - Context Option', 'after Thumbnail/Open');  


	} catch(e){
		alert("Script error:\n" + e + ' ' + e.line);
	}
}


// These functions are run when their respective menu item is selected
toolsFolderOption.onSelect = function(){
	alertDescriptions();
}

toolsOption.onSelect = function(){
	alertDescriptions();
}


contextFolderOption.onSelect = function(){
	alertDescriptions();
}

contextOption.onSelect = function(){
	alertDescriptions();
}



// creates an alert with the file name and description field of each selected non-folder file
function alertDescriptions(){
	try{
		app.synchronousMode = true; // make sure we're getting the most current data

		var selection = app.document.selections; // get selected files
		if(selection.length == 0){ // check for empty selection
			alert("Nothing selected!");
			return;
		}


		for(var i in selection){ // iterate through each selected item
			if(selection[i].container == false){ // only does this code if the selection is not a folder
				var description = selection[i].metadata.read(XMPConst.NS_DC, "description"); // Get the Dublin Core Description field
				var name = selection[i].name; // get the file name
				alert("Name: " + name + "\nDescription: " + description);
			}
		}


		app.synchronousMode = false;
	} catch(e){
		alert("Script error:\n" + e + ' ' + e.line);
	}
}
