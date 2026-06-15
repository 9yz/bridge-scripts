/* 

	lockTagger.jsx

	Allows bulk tagging and unlocking of locked/protected files.

	See repo for doccumentation:
	https://github.com/9yz/bridge-scripts

*/

// for ESTK
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

		// Tools menu button
		var ltToolsMenuItem = MenuElement.create('command', 'Tag Locked Files...', 'at the end of Tools'); // create an item in the Tools menu
	

	} catch(e){
		alert("LockTagger Error:\n" + e + ' ' + e.line);
	}
}


// called when menu item is selected
ltToolsMenuItem.onSelect = function(){
	if(this.ShiftDown) ltRun(true); // shift key was pressed when selected
	ltRun(false);
}



// Runs the script: shows dialog for settings, then tags locked files and unlocks them if requested.
// if runWithoutDialog is true, dialog is not shown and tagging is done using the settings stored in preferences.
function ltRun(runWithoutDialog){
	try{
		app.synchronousMode = true; // make sure we're getting the most current data
		
		var selection = app.document.selections; // get selected files
		if(selection.length == 0){ // check for empty selection
			alert("LockTagger Error:\nNothing selected!")
			return;
		}
		
		if(!runWithoutDialog){ // open dialog
			if(!ltMenu()) return; // don't proceed if the user canceled
		}

		/* for(var i in selection){ // iterate through each selected item
			if(selection[i].container == false){ // only does this code if the selection is not a folder
				var description = selection[i].metadata.read(XMPConst.NS_DC, "description"); // Get the Dublin Core Description field
				var name = selection[i].name; // get the file name
				alert("Name: " + name + "\nDescription: " + description);
			}
		} */


		app.synchronousMode = false;
	} catch(e){
		alert("LockTagger Error:\n" + e + ' ' + e.line);
	}
}


// Show settings dialog.
// Returns true if the script is to continue, false if it should terminate.
// When returning true, the settings are saved into app preferences.
function ltMenu(){
	var applyLabel = "";
	var unlockFiles = true; 
	if(app.preferences.ltPrefsSet == true){
		applyLabel = app.preferences.ltLabel;
		unlockFiles = app.preferences.ltUnlockFiles;
	}

	/*
	Code for Import https://scriptui.joonas.me — (Triple click to select): 
	{"activeId":9,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"ltDialog","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"LockTagger","preferredSize":[280,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Group","parentId":4,"style":{"enabled":true,"varName":"row1","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-2":{"id":2,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Tag locked files with:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"DropDownList","parentId":1,"style":{"enabled":true,"varName":"ltDDApplyLabel","text":"DropDownList","listItems":"0 Stars, 1 Star, 2 Stars, 3 Stars, 4 Stars, 5 Stars, -,  No Label, Red Label, Yellow Label, Green Label, Blue Label, Purple Label, -, Reject","preferredSize":[0,0],"alignment":null,"selection":0,"helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":7,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":2,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-5":{"id":5,"type":"Group","parentId":4,"style":{"enabled":true,"varName":"row2","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-6":{"id":6,"type":"Checkbox","parentId":5,"style":{"enabled":true,"varName":"ltCBUnlockFiles","text":"Unlock files","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Settings","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-8":{"id":8,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["right","center"],"alignment":"right"}},"item-9":{"id":9,"type":"Button","parentId":8,"style":{"enabled":true,"varName":"ltBTRun","text":"Run","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"Button","parentId":8,"style":{"enabled":true,"varName":"ltBTCancel","text":"Cancel","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":4,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-12":{"id":12,"type":"StaticText","parentId":11,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"Hold Shift when selecting this menu item to Run using the previous settings.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,7,4,1,2,3,5,6,11,12,8,10,9],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
	*/ 

	// LTDIALOG
	// ========
	var ltDialog = new Window("dialog"); 
		ltDialog.text = "LockTagger"; 
		// ltDialog.preferredSize.width = 300; 
		ltDialog.orientation = "column"; 
		ltDialog.alignChildren = ["left","top"]; 
		ltDialog.spacing = 10; 
		ltDialog.margins = 16; 

	// PANEL1
	// ======
	var panel1 = ltDialog.add("panel", undefined, undefined, {name: "panel1"}); 
		panel1.text = "Settings"; 
		panel1.orientation = "column"; 
		panel1.alignChildren = ["left","top"]; 
		panel1.spacing = 10; 
		panel1.margins = 10; 

	// GROUP1
	// ======
	var group1 = panel1.add("group", undefined, {name: "group1"}); 
		group1.orientation = "column"; 
		group1.alignChildren = ["left","center"]; 
		group1.spacing = 10; 
		group1.margins = 2; 

	// ROW1
	// ====
	var row1 = group1.add("group", undefined, {name: "row1"}); 
		row1.orientation = "row"; 
		row1.alignChildren = ["left","center"]; 
		row1.spacing = 10; 
		row1.margins = 0; 

	var statictext1 = row1.add("statictext", undefined, undefined, {name: "statictext1"}); 
		statictext1.text = "Tag locked files with:"; 

	var ltDDApplyLabel_array = ["0 Stars","1 Star","2 Stars","3 Stars","4 Stars","5 Stars","-","No Label","Red Label","Yellow Label","Green Label","Blue Label","Purple Label","-","Reject"]; 
	var ltDDApplyLabel = row1.add("dropdownlist", undefined, undefined, {name: "ltDDApplyLabel", items: ltDDApplyLabel_array}); 

	ltDDApplyLabel.selection = 1; 
	// initalize value in dropdown with one stored in preferences
	for(var i = 0; i < ltDDApplyLabel_array.length; i++){
		if(ltDDApplyLabel_array[i] == applyLabel)
			ltDDApplyLabel.selection = i; 
	}

	// ROW2
	// ====
	var row2 = group1.add("group", undefined, {name: "row2"}); 
		row2.orientation = "row"; 
		row2.alignChildren = ["left","center"]; 
		row2.spacing = 10; 
		row2.margins = 0; 

	var ltCBUnlockFiles = row2.add("checkbox", undefined, undefined, {name: "ltCBUnlockFiles"}); 
		ltCBUnlockFiles.text = "Unlock files"; 
		ltCBUnlockFiles.value = unlockFiles;


	// GROUP2
	// ======
	var group2 = ltDialog.add("group", undefined, {name: "group2"}); 
		group2.orientation = "row"; 
		group2.alignChildren = ["left","center"]; 
		group2.spacing = 10; 
		group2.margins = 4; 

	var statictext2 = group2.add("statictext", undefined, undefined, {name: "statictext2", multiline: true}); 
		statictext2.text = "Hold Shift when selecting this menu item to Run using the previous settings."; 

	// GROUP3
	// ======
	var group3 = ltDialog.add("group", undefined, {name: "group3"}); 
		group3.orientation = "row"; 
		group3.alignChildren = ["right","center"]; 
		group3.spacing = 10; 
		group3.margins = 0; 
		group3.alignment = ["right","top"]; 

	var ltBTCancel = group3.add("button", undefined, undefined, {name: "ltBTCancel"}); 
		ltBTCancel.text = "Cancel"; 

	var ltBTRun = group3.add("button", undefined, undefined, {name: "ltBTRun"}); 
		ltBTRun.text = "Run"; 



	/// DROPDOWN INTERACTIVITY
	ltDialog.panel1.group1.row1.ltDDApplyLabel.onChange = function(){
		if(ltDialog.panel1.group1.row1.ltDDApplyLabel.selection == "-"){ // disable ok button if a divider is selected
			ltDialog.group3.ltBTRun.enabled = false;
		}
		else{
			ltDialog.group3.ltBTRun.enabled = true;
			applyLabel = ltDialog.panel1.group1.row1.ltDDApplyLabel.selection;
		}
	}

	/// CHECKBOX INTERACTIVITY
	ltDialog.panel1.group1.row2.ltCBUnlockFiles.onClick = function(){
		unlockFiles = ltDialog.panel1.group1.row2.ltCBUnlockFiles.value;
	}

	/// GROUP 3 INTERACTIVITY
	ltDialog.group3.ltBTCancel.onClick = function(){
		ltDialog.close();
		return false;
	}

	ltDialog.group3.ltBTRun.onClick = function(){
		app.preferences.ltLabel = applyLabel.toString();
		app.preferences.ltUnlockFiles = unlockFiles;
		app.preferences.ltPrefsSet = true;

		ltDialog.close();
		alert("Prefs:\n" + app.preferences.ltLabel + "\n" + app.preferences.ltUnlockFiles);
		return true;
	}

	ltDialog.show();

}

