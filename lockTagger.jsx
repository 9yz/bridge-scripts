/*
@@@START_XML@@@
<?xml version="1.0" encoding="UTF-8"?>
<ScriptInfo xmlns:dc="http://purl.org/dc/elements/1.1/" xml:lang="en_US">
<dc:title>Lock Tagger</dc:title>
<dc:description>This script allows bulk tagging and unlocking of locked files. Select a group of files then run from Tools -> "Tag locked files..."</dc:description>
<dc:source>https://github.com/9yz/bridge-scripts</dc:source>
@@@END_XML@@
*/

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
		alert("Lock Tagger error:\n" + e + ' ' + e.line);
	}
}


// called when menu item is selected
ltToolsMenuItem.onSelect = function(){
	if(this.shiftDown) ltRun(true); // shift key was pressed when selected
	else ltRun(false);
}



// Runs the script: shows dialog for settings, then tags locked files and unlocks them if requested.
// if runWithoutDialog is true, dialog is not shown and tagging is done using the settings stored in preferences.
function ltRun(runWithoutDialog){
	try{
		app.synchronousMode = true; // make sure we're getting the most current data when loading files
		
		var selection = app.document.selections; // get selected files
		if(selection.length == 0){ // check for empty selection
			alert("Lock Tagger error:\nNothing selected!")
			return;
		}
		
		// dont open dialog if requested not to, but always open if we don't have prefs sset
		if(!runWithoutDialog || app.preferences.ltPrefsSet == false){ 
			if( !ltMenu() ) return; // don't proceed if the user canceled out of the menu
		}

		// load the xmp scripting API
		if(ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); 

		// load saved preferences
		var applyLabel = app.preferences.ltLabel;
		var rating = -Infinity;
		var label = "";

		// set `rating` or `label` based on user preference - if a star option or Reject was selected, that value is set for `rating`. 
		// if a label was selected, the text name of that label is grabbed from preferences and set for `label`.
		switch(applyLabel){
			case "Reject":
				rating = -1; break;
			case "0 Stars":
				rating = 0; break;
			case "1 Star":
				rating = 1; break;
			case "2 Stars":
				rating = 2; break;
			case "3 Stars":
				rating = 3; break;
			case "4 Stars":
				rating = 4; break;
			case "5 Stars":
				rating = 5; break;
			case "Red Label":
				label = app.preferences.label1; break;
			case "Yellow Label":
				label = app.preferences.label2; break;
			case "Green Label":
				label = app.preferences.label3; break;
			case "Blue Label":
				label = app.preferences.label4; break;
			case "Purple Label":
				label = app.preferences.label5; break;
			case "No Label":
				label = ""; break;
			default:
				alert("Lock Tagger error:\nUnknown label \"" + applyLabel + "\"!");
				return;
		}


		for(var i in selection){ // iterate through each selected item
			if(selection[i].locked){

				/// the way we tag the locked files is intentionally slow!
				/// setting thumb.spec.readonly is a filesystem operation, which is slow
				/// if we were to just set thumb.rating immediately after, it would fail because bridge would think the file is still locked.
				/// instead, we use the more cumbersome method of manually writing XMP metadata - 
				/// Because it's slower, it actually succeeds.

				selection[i].spec.readonly = false; // unlock file  (thumb.spec returns a File object)
				// alert(selection[i].locked); // displays "true", indicating that bridge still thinks the file is locked

				/// fast method: use the built-in function for setting a rating
				/// this doesn't work because bridge still thinks the file is locked
				// if(rating >= -1 && rating <= 5) selection[i].rating = rating;
				// else selection[i].label = label;

				
				/// slow method: load all of the file's metadata, parse it, edit it, return to the original format, write it back
				var existingMetadata = selection[i].synchronousMetadata; // get existing metadata for this item
				if(!existingMetadata) continue; // abort if this file doesn't support metadata
				var myXMP = new XMPMeta(existingMetadata.serialize());		

				// set new value
				if(rating >= -1 && rating <= 5){
					myXMP.deleteProperty(XMPConst.NS_XMP, "Rating");
					myXMP.setProperty(XMPConst.NS_XMP, "Rating", rating); 
				}
				else{
					myXMP.deleteProperty(XMPConst.NS_XMP, "Label");
					myXMP.setProperty(XMPConst.NS_XMP, "Label", label); 
				} 

				var updatedMetadata = myXMP.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
				selection[i].metadata = new Metadata(updatedMetadata); // write back to file

			}
		}

		app.synchronousMode = false;

	} catch(e){
		alert("Lock Tagger error:\n" + e + ' ' + e.line);
	}
}


// Show settings dialog.
// Returns true if the script is to continue, false if it should terminate.
// When returning true, the settings are saved into app preferences.
function ltMenu(){
	var exitGood = false;
	var applyLabel = "";
	if(app.preferences.ltPrefsSet == true){ // load from saved preferences, if they've been saved before
		applyLabel = app.preferences.ltLabel;
	}

	/*
		Code for Import https://scriptui.joonas.me — (Triple click to select): 
		{"activeId":3,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"ltDialog","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Lock Tagger","preferredSize":[280,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Group","parentId":4,"style":{"enabled":true,"varName":"row1","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-2":{"id":2,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Tag locked files with:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"DropDownList","parentId":1,"style":{"enabled":true,"varName":"ltDDApplyLabel","text":"DropDownList","listItems":"0 Stars, 1 Star, 2 Stars, 3 Stars, 4 Stars, 5 Stars, -,  No Label, Red Label, Yellow Label, Green Label, Blue Label, Purple Label, -, Reject","preferredSize":[100,0],"alignment":null,"selection":0,"helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":7,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":2,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-7":{"id":7,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Settings","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-8":{"id":8,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["right","center"],"alignment":"right"}},"item-9":{"id":9,"type":"Button","parentId":8,"style":{"enabled":true,"varName":"ltBTRun","text":"Run","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"Button","parentId":8,"style":{"enabled":true,"varName":"ltBTCancel","text":"Cancel","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":4,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-12":{"id":12,"type":"StaticText","parentId":11,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"Hold Shift when selecting this menu item to Run using the previous settings.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,7,4,1,2,3,11,12,8,10,9],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
	*/ 

	// LTDIALOG
	// ========
	var ltDialog = new Window("dialog"); 
		ltDialog.text = "Lock Tagger Settings"; 
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
		ltDDApplyLabel.preferredSize.width = 100; 

	ltDDApplyLabel.selection = 1; 
	// initalize value in dropdown with one stored in preferences
	for(var i = 0; i < ltDDApplyLabel_array.length; i++){
		if(ltDDApplyLabel_array[i] == applyLabel)
			ltDDApplyLabel.selection = i; 
	}


	// GROUP2
	// ======
	var group2 = ltDialog.add("group", undefined, {name: "group2"}); 
		group2.orientation = "row"; 
		group2.alignChildren = ["left","center"]; 
		group2.spacing = 10; 
		group2.margins = 4; 

	var statictext2 = group2.add("statictext", undefined, undefined, {name: "statictext2", multiline: true}); 
		statictext2.text = "Hold Shift when selecting this menu item to run using previous settings."; 

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
		ltBTRun.text = "Ok"; 


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


	/// GROUP 3 INTERACTIVITY
	// cancel button
	ltDialog.group3.ltBTCancel.onClick = function(){
		ltDialog.close();
	}

	// run button
	ltDialog.group3.ltBTRun.onClick = function(){
		// save to prefs
		app.preferences.ltLabel = applyLabel.toString();
		app.preferences.ltPrefsSet = true;

		ltDialog.close();
		exitGood = true;
	}

	ltDialog.show();
	return exitGood; // if we returned directly out of either onClick function, it seems to always return true??
}

