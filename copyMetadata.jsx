/*

	copyMetadataCont Script created by 9yz
	11/23/24

	Adds the ability to copy IPTC metadata between files.

	TO ADD A NEW TYPE:
	1. add a value for it in typeFlags
		a. also add to allTypeFlags
	2. add storage for it in copiedData
	3. add a check for it in resetClipboard
	4. add a checkbox for it in cmDialog
		a. make sure it gets reset in winCopyMetadata.panel1.cbAll.onClick()
		b. give it a onClick function to modify copyTypes
	5. add a check for it in cmCopy
		a. make sure to verify its namespace and copy the param name exactly
		b. check if it's a string, array, or some other godforsaken tata structure
	6. add a check for it in cmPaste
		a.

*/


// basically just an enum
// when passed to a function, specifies which types to copy/paste
// only specifically noted types can use the append method
const typeFlags = {
	description:	1,
	tags: 			2, // can be appended
	location: 		4,
	headline:		8,
	accessability:	16 // alt text & extended escription
};
const allTypeFlags = typeFlags.description+typeFlags.tags+typeFlags.location+typeFlags.headline+typeFlags.accessability;

// enum: when passed to a paste function, specifies how it should be pasted. Only certian types can be appended - see typeFlags
const methodFlags = {
	append: 		1
};


// param storing all copied data
var copiedData = {
	description:		null,
	tags:				null, 	// array of tags
	sublocation:		null,
	city:				null,
	state:				null,
	country:			null,
	countryCode:		null,
	headline:			null,
	altText:			null,
	extDesc:			null
};




#target bridge
// STARTUP FUNCTION: run when bridge starts, used for setup
if(BridgeTalk.appName == 'bridge'){ 
	try{

		// Load the XMP Script library
		if( xmpLib == undefined ){
			if(Folder.fs == "Windows"){
				var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.dll";
			} 
			else {
				var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.framework";
			}
		
			var libfile = new File( pathToLib );
			var xmpLib = new ExternalObject("lib:" + pathToLib );
		}

		// menu items; weird ordering so they get ordered correctly in the menus
		var cmMenuCopy 					= MenuElement.create('command', 'Copy Property...', 'at the end of Tools'); 
		var cmMenuPaste 				= MenuElement.create('command', 'Paste Property (Append)', 'at the end of Tools'); 
		var cmMenuPasteOverwrite 		= MenuElement.create('command', 'Paste Property (Overwrite)', 'at the end of Tools'); 
		var cmMenuPasteContOverwrite 	= MenuElement.create('command', 'Paste Property (Overwrite)', 'after Thumbnail/Open'); 
		var cmMenuPasteCont 			= MenuElement.create('command', 'Paste Property (Append)', 'after Thumbnail/Open'); 
		var cmMenuCopyCont 				= MenuElement.create('command', 'Copy Property...', 'after Thumbnail/Open'); 

	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}


// clears the clipboard for all chosen properties
function resetClipboard(type){
	if(type & typeFlags.description){
		copiedData.description = null;
	}
	if(type & typeFlags.tags){
		copiedData.tags = null;
	}
	if(type & typeFlags.location){
		copiedData.sublocation = 	null;
		copiedData.city = 			null;
		copiedData.state = 			null;
		copiedData.country = 		null;
		copiedData.countryCode = 	null;
	}
	if(type & typeFlags.headline){
		copiedData.headline = null;
	}
	if(type & typeFlags.accessability){
		copiedData.altText = null;
		copiedData.extDesc = null;
	}
}


// creates a modal dialog asking what fields to copy
function cmDialog(){

	var copyTypes = allTypeFlags; // stores what values we'll be copying based on user selection
	var safeClose = false; // only set to true if window is closed via ok/cancel

	/*
	Code for Import https://scriptui.joonas.me — (Triple click to select): 
	{"activeId":0,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"copyMetadata","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Copy metadata...","preferredSize":[150,100],"margins":16,"orientation":"column","spacing":5,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Group","parentId":10,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":[0,0,0,20],"orientation":"column","spacing":5,"alignChildren":["left","center"],"alignment":null}},"item-2":{"id":2,"type":"Checkbox","parentId":10,"style":{"enabled":true,"varName":"cbAll","text":"All","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-3":{"id":3,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":[15,0,0,0],"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-4":{"id":4,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"cbHeadline","text":"Headline","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-5":{"id":5,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"cbDescription","text":"Description","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-6":{"id":6,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"cbKeywords","text":"Keywords","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"cbLocation","text":"Location","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-8":{"id":8,"type":"Button","parentId":3,"style":{"enabled":true,"varName":"butCancel","text":"Cancel","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-9":{"id":9,"type":"Button","parentId":3,"style":{"enabled":true,"varName":"butOk","text":"Ok","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":"","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Properties","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-11":{"id":11,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":"cbAltText","text":"Alt Text","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,10,2,1,4,5,6,11,7,3,8,9],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
	*/ 

	// COPYMETADATA
	var winCopyMetadata = new Window("dialog", undefined, undefined, {closeButton: false}); 
	winCopyMetadata.text = "Copy metadata..."; 
	winCopyMetadata.preferredSize.width = 150; 
	winCopyMetadata.preferredSize.height = 100; 
	winCopyMetadata.orientation = "column"; 
	winCopyMetadata.alignChildren = ["fill","top"]; 
	winCopyMetadata.spacing = 5; 
	winCopyMetadata.margins = 16; 

	// PANEL1
	var panel1 = winCopyMetadata.add("panel", undefined, undefined, {name: "panel1"}); 
	panel1.text = "Properties"; 
	panel1.orientation = "column"; 
	panel1.alignChildren = ["fill","top"]; 
	panel1.spacing = 10; 
	panel1.margins = 10; 

	var cbAll = panel1.add("checkbox", undefined, undefined, {name: "cbAll"}); 
	cbAll.text = "All"; 
	cbAll.value = true;

	// GROUP1
	var group1 = panel1.add("group", undefined, {name: "group1"}); 
	group1.orientation = "column"; 
	group1.alignChildren = ["left","center"]; 
	group1.spacing = 5; 
	group1.margins = [20,0,0,0]; 

	var cbHeadline = group1.add("checkbox", undefined, undefined, {name: "cbHeadline"}); 
	cbHeadline.text = "Headline"; 
	cbHeadline.value = true;

	var cbDescription = group1.add("checkbox", undefined, undefined, {name: "cbDescription"}); 
	cbDescription.text = "Description";
	cbDescription.value = true;

	var cbKeywords = group1.add("checkbox", undefined, undefined, {name: "cbKeywords"}); 
	cbKeywords.text = "Keywords";
	cbKeywords.value = true;

	var cbAltText = group1.add("checkbox", undefined, undefined, {name: "cbAltText"}); 
    cbAltText.text = "Alt Text";
	cbAltText.value = true; 

	var cbLocation = group1.add("checkbox", undefined, undefined, {name: "cbLocation"}); 
	cbLocation.text = "Location";
	cbLocation.value = true;


	//// GROUP1 INTERACTIVITY

	// called when "All" is clicked
	winCopyMetadata.panel1.cbAll.onClick = function(){ 
		cbHeadline.value = cbDescription.value = cbKeywords.value = cbLocation.value = cbAltText.value 
			= this.value; // set the other checkboxes to this box's value

		//set result value
		if(this.value) 
			copyTypes = allTypeFlags;
		else 
			copyTypes = 0;
	}

	// called when "Headline" is clicked
	winCopyMetadata.panel1.group1.cbHeadline.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= typeFlags.headline; // remove this value from the result
		}
		else copyTypes |= typeFlags.headline; // add this val to the result
	}
	// called when "Description" is clicked
	winCopyMetadata.panel1.group1.cbDescription.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= typeFlags.description; // remove this value from the result
		}
		else copyTypes |= typeFlags.description; // add this val to the result
	}
	// called when "Keywords" is clicked
	winCopyMetadata.panel1.group1.cbKeywords.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= typeFlags.tags; // remove this value from the result
		}
		else copyTypes |= typeFlags.tags; // add this val to the result
	}
	// called when "Alt Text" is clicked
	winCopyMetadata.panel1.group1.cbAltText.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= typeFlags.accessability; // remove this value from the result
		}
		else copyTypes |= typeFlags.accessability; // add this val to the result
	}
	// called when "Location" is clicked
	winCopyMetadata.panel1.group1.cbLocation.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= typeFlags.location; // remove this value from the result
		}
		else copyTypes |= typeFlags.location; // add this val to the result
	}



	// GROUP2
	var group2 = winCopyMetadata.add("group", undefined, {name: "group2"}); 
	group2.orientation = "row"; 
	group2.alignChildren = ["left","center"]; 
	group2.spacing = 10; 
	group2.margins = [0,15,0,0]; 

	var butCancel = group2.add("button", undefined, undefined, {name: "butCancel"}); 
	butCancel.text = "Cancel"; 

	var butOk = group2.add("button", undefined, undefined, {name: "butOk"}); 
	butOk.text = "Ok"; 


	//// GROUP2 INTERACTIVITY

	// called when "Cancel" is clicked
	winCopyMetadata.group2.butCancel.onClick = function(){
		winCopyMetadata.close();
		copyTypes = -1;
		safeClose = true;
	}
	
	// called when "Ok" is clicked
	winCopyMetadata.group2.butOk.onClick = function(){
		winCopyMetadata.close();
		safeClose = true;
	}

	winCopyMetadata.show(); // display the window
	if(safeClose) return copyTypes; // async function; not called until the window is closed.
	else return -1; // called if the window closes not from ok/cancel
}





// Identifies a file to copy from; prompts user to select the fields to be copied; saves those fields into memory
function cmCopy(){
	try{
		app.synchronousMode = true; // ensures we're getting the full metadata

		//////////////////////////////
		/////// SELECTION VALIDATION

		var selection = app.document.selections; // get selected files
		if(!selection.length){ // nothing selected
			alert('Nothing selected!');
			return;
		}
		if(selection.length > 1){ // more than 1 selected
			alert('You can only copy from one file at a time.'); 
			return;
		} 
		if(selection[0].container){ // selection is a folder
			alert('Folders cannot be copied from.');
			return;
		}

		var copyTypes;
		copyTypes = cmDialog();
		if(copyTypes != -1){ // -1 means user canceled dialog

			////////////////
			////// COPYING		

			resetClipboard(allTypeFlags); // blank the clipboard

			if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API

			// get existing metadata for this item
			var newMetadata = selection[0].synchronousMetadata; 
			var myXMP = new XMPMeta(newMetadata.serialize());


			// get copied data and save it based on set flags
			if(copyTypes & typeFlags.description){
				copiedData.description = selection[0].metadata.read(XMPConst.NS_DC, 'description');
				// we DON'T use getProperty here because it doesn't return a string, it returns an XMPProperty object which can have localization and arrays and other bullshit and fuck that
			}
			if(copyTypes & typeFlags.tags){
				var tags = selection[0].metadata.read(XMPConst.NS_DC, 'subject').toString(); // convert to one long string
				copiedData.tags = tags.split(','); // separate string into array
			}
			if(copyTypes & typeFlags.location){
				copiedData.sublocation = 	selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'Location');
				copiedData.city = 			selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'City');
				copiedData.state = 			selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'State');
				copiedData.country = 		selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'Country');
				copiedData.countryCode = 	selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'CountryCode');
			}
			if(copyTypes & typeFlags.headline){
				copiedData.headline = selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'Headline');
			}
			if(copyTypes & typeFlags.accessability){
				copiedData.altText = selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility');
				copiedData.extDesc = selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility');
			}

		}

		app.synchronousMode = false;
	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}

// Pastes from memory into all selected files
function cmPaste(method){
	try{
		app.synchronousMode = true;

		var selection = app.document.selections; // get selected files
		if(!selection.length){ // nothing selected
			alert('Nothing selected!');
			return;
		} 

		if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API
		
		for(var i in selection){ // iterate through selection
			if(!selection[i].container){ // exclude folders
				// get existing metadata for this item
				var newMetadata = selection[i].synchronousMetadata; 
				var newXMP = new XMPMeta(newMetadata.serialize());
				

				// paste appropriate data based on type flags
				if(copiedData.description != null){
					newXMP.deleteProperty(XMPConst.NS_DC, 'description'); // delete old desc
					newXMP.setProperty(XMPConst.NS_DC, 'description', copiedData.description); // update w/ new desc
				}
				if(copiedData.tags != null){
					if(!method & methodFlags.append) newXMP.deleteProperty(XMPConst.NS_DC, 'subject'); // delete old tags if we aren't appending

					for(var j in copiedData.tags){ // iterate through tags, adding all
						newXMP.appendArrayItem(XMPConst.NS_DC, 'subject', copiedData.tags[j], 0, XMPConst.ARRAY_IS_ORDERED);
					}
				}
				if(copiedData.sublocation != null){ 
					newXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'Location');
					newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'Location', copiedData.sublocation);
					//                 ^ namespace             ^ key (case sensitive)    ^ value
				}
				if(copiedData.city != null){
					newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'City');
					newXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'City', copiedData.city);
				}
				if(copiedData.state != null){
					newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'State');
					newXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'State', copiedData.state); 
				}
				if(copiedData.country != null){
					newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'Country');
					newXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'Country', copiedData.country); 
				}
				if(copiedData.countryCode != null){
					newXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'CountryCode');
					newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'CountryCode', copiedData.countryCode);
				}
				if(copiedData.headline != null){
					newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'Headline');
					newXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'Headline', copiedData.headline);
				}
				if(copiedData.extDesc != null){
					newXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility');
					newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility', copiedData.extDesc);
				}
				if(copiedData.altText != null){
					newXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility');
					newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility', copiedData.altText);
				}


				var updatedMetadata = newXMP.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
				selection[i].metadata = new Metadata(updatedMetadata); //write to file
			}
		}


		app.synchronousMode = false;
	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}




// called when copy metadata is selected in menu
cmMenuCopy.onSelect = function(){
	cmCopy();
}
cmMenuCopyCont.onSelect = function(){
	cmCopy();
}

// called when paste metadata is selected in menu
cmMenuPaste.onSelect = function(){
	cmPaste(methodFlags.append);
}
cmMenuPasteCont.onSelect = function(){
	cmPaste(methodFlags.append);
}
cmMenuPasteOverwrite.onSelect = function(){
	cmPaste(0);
}
cmMenuPasteContOverwrite.onSelect = function(){
	cmPaste(0);
}

