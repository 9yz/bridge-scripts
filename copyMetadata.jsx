/*

	copyMetadataCont Script created by 9yz
	12/08/24

	Adds the ability to copy IPTC metadata between files.
	Activate via Tools > Copy Property or Tools > Paste Property..

*/


// basically just an enum
// when passed to a function, specifies which types to copy/paste
// only specifically noted types can use the append method
const CM_TYPE_FLAGS = {
	description:	1,
	tags: 			2, // can be appended
	location: 		4,
	headline:		8,
	accessability:	16, // alt text & extended escription
	title:			32
};
const CM_ALL_TYPE_FLAGS = CM_TYPE_FLAGS.description+CM_TYPE_FLAGS.tags+CM_TYPE_FLAGS.location+CM_TYPE_FLAGS.headline+CM_TYPE_FLAGS.accessability+CM_TYPE_FLAGS.title;

// enum: when passed to a paste function, specifies how it should be pasted. Only certian types can be appended - see CM_TYPE_FLAGS
const CM_METHOD_FLAGS = {
	append: 		1
};


// param storing all copied data
var cmCopiedData = {
	description:		null,
	tags:				null, 	// array of tags
	sublocation:		null,
	city:				null,
	state:				null,
	country:			null,
	countryCode:		null,
	headline:			null,
	altText:			null,
	extDesc:			null,
	title:				null
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
		alert("Copy Metadata Error:\n" + e + ' ' + e.line);
	}
}


// clears the clipboard for all chosen properties
function cmResetClipboard(type){
	if(type & CM_TYPE_FLAGS.description){
		cmCopiedData.description = null;
	}
	if(type & CM_TYPE_FLAGS.tags){
		cmCopiedData.tags = null;
	}
	if(type & CM_TYPE_FLAGS.location){
		cmCopiedData.sublocation = 	null;
		cmCopiedData.city = 		null;
		cmCopiedData.state = 		null;
		cmCopiedData.country = 		null;
		cmCopiedData.countryCode = 	null;
	}
	if(type & CM_TYPE_FLAGS.headline){
		cmCopiedData.headline = null;
	}
	if(type & CM_TYPE_FLAGS.accessability){
		cmCopiedData.altText = null;
		cmCopiedData.extDesc = null;
	}
	if(type & CM_TYPE_FLAGS.title){
		cmCopiedData.title = null;
	}
}


// creates a modal dialog asking what fields to copy
function cmDialog(){

	var copyTypes = CM_ALL_TYPE_FLAGS; // stores what values we'll be copying based on user selection
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

	var cbTitle = group1.add("checkbox", undefined, undefined, {name: "cbTitle"}); 
	cbTitle.text = "Title";
	cbTitle.value = true;


	//// GROUP1 INTERACTIVITY

	// called when "All" is clicked
	winCopyMetadata.panel1.cbAll.onClick = function(){ 
		cbHeadline.value = cbDescription.value = cbKeywords.value = cbLocation.value = cbAltText.value = cbTitle.value
			= this.value; // set the other checkboxes to this box's value

		//set result value
		if(this.value) 
			copyTypes = CM_ALL_TYPE_FLAGS;
		else 
			copyTypes = 0;
	}

	// called when "Headline" is clicked
	winCopyMetadata.panel1.group1.cbHeadline.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= CM_TYPE_FLAGS.headline; // remove this value from the result
		}
		else copyTypes |= CM_TYPE_FLAGS.headline; // add this val to the result
	}
	// called when "Description" is clicked
	winCopyMetadata.panel1.group1.cbDescription.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= CM_TYPE_FLAGS.description; // remove this value from the result
		}
		else copyTypes |= CM_TYPE_FLAGS.description; // add this val to the result
	}
	// called when "Keywords" is clicked
	winCopyMetadata.panel1.group1.cbKeywords.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= CM_TYPE_FLAGS.tags; // remove this value from the result
		}
		else copyTypes |= CM_TYPE_FLAGS.tags; // add this val to the result
	}
	// called when "Alt Text" is clicked
	winCopyMetadata.panel1.group1.cbAltText.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= CM_TYPE_FLAGS.accessability; // remove this value from the result
		}
		else copyTypes |= CM_TYPE_FLAGS.accessability; // add this val to the result
	}
	// called when "Location" is clicked
	winCopyMetadata.panel1.group1.cbLocation.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= CM_TYPE_FLAGS.location; // remove this value from the result
		}
		else copyTypes |= CM_TYPE_FLAGS.location; // add this val to the result
	}
	// called when "Title" is clicked
	winCopyMetadata.panel1.group1.cbTitle.onClick = function(){
		if(!this.value){ 
			cbAll.value = false;
			copyTypes ^= CM_TYPE_FLAGS.title; // remove this value from the result
		}
		else copyTypes |= CM_TYPE_FLAGS.title; // add this val to the result
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
			alert('Copy Metadata Error:\nNothing selected!');
			return;
		}
		if(selection.length > 1){ // more than 1 selected
			alert('Copy Metadata Error:\nYou can only copy from one file at a time.'); 
			return;
		} 
		if(selection[0].container){ // selection is a folder
			alert('Copy Metadata Error:\nFolders cannot be copied from.');
			return;
		}
		if(!selection[0].synchronousMetadata){ // selection doesn't support xmp
			alert('Copy Metadata Error:\nThis file does not have XMP metadata.');
			return;
		}
		

		var copyTypes;
		copyTypes = cmDialog();
		if(copyTypes != -1){ // -1 means user canceled dialog

			////////////////
			////// COPYING		

			cmResetClipboard(CM_ALL_TYPE_FLAGS); // blank the clipboard

			if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API

			// get copied data and save it based on set flags
			if(copyTypes & CM_TYPE_FLAGS.description){
				cmCopiedData.description = selection[0].metadata.read(XMPConst.NS_DC, 'description');
				// we DON'T use getProperty here because it doesn't return a string, it returns an XMPProperty object which can have localization and arrays and other bullshit and fuck that
			}
			if(copyTypes & CM_TYPE_FLAGS.tags){
				var tags = selection[0].metadata.read(XMPConst.NS_DC, 'subject').toString(); // convert to one long string
				cmCopiedData.tags = tags.split(','); // separate string into array
			}
			if(copyTypes & CM_TYPE_FLAGS.location){
				cmCopiedData.sublocation = 	selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'Location');
				cmCopiedData.city = 		selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'City');
				cmCopiedData.state = 		selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'State');
				cmCopiedData.country = 		selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'Country');
				cmCopiedData.countryCode = 	selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'CountryCode');
			}
			if(copyTypes & CM_TYPE_FLAGS.headline){
				cmCopiedData.headline = selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'Headline');
			}
			if(copyTypes & CM_TYPE_FLAGS.accessability){
				cmCopiedData.altText = selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility');
				cmCopiedData.extDesc = selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility');
			}
			if(copyTypes & CM_TYPE_FLAGS.title){
				cmCopiedData.title = selection[0].metadata.read(XMPConst.NS_DC, 'title');
			}

		}

		app.synchronousMode = false;
	}
	catch(e){
		alert("Copy Metadata Error:\n" + e + ' ' + e.line);
	}
}

// Pastes from memory into all selected files
function cmPaste(method){
	try{
		app.synchronousMode = true;

		var errorFiles = 0;
		var selection = app.document.selections; // get selected files
		if(!selection.length){ // nothing selected
			alert('Copy Metadata Error:\nNothing selected!');
			return;
		} 

		if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API
		
		for(var i in selection){ // iterate through selection
			if(!selection[i].container && selection[i].core.itemContent.canLabelOrRate){ // exclude folders & files that dont support xmp

				// get existing metadata for this item
				var newMetadata = selection[i].synchronousMetadata;
				if(!newMetadata){ // does this file support metadata?
					errorFiles++;
					continue;
				} 
				var newXMP = new XMPMeta(newMetadata.serialize());
				

				// paste all copied (non-null) data
				if(cmCopiedData.description != null){
					newXMP.deleteProperty(XMPConst.NS_DC, 'description'); // delete old desc
					newXMP.setProperty(XMPConst.NS_DC, 'description', cmCopiedData.description); // update w/ new desc
				}
				if(cmCopiedData.tags != null){
					if(!method & CM_METHOD_FLAGS.append) newXMP.deleteProperty(XMPConst.NS_DC, 'subject'); // delete old tags if we aren't appending

					for(var j in cmCopiedData.tags){ // iterate through tags, adding all
						newXMP.appendArrayItem(XMPConst.NS_DC, 'subject', cmCopiedData.tags[j], 0, XMPConst.ARRAY_IS_ORDERED);
					}
				}
				if(cmCopiedData.sublocation != null){ 
					newXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'Location');
					newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'Location', cmCopiedData.sublocation);
					//                 ^ namespace             ^ key (case sensitive)    ^ value
				}
				if(cmCopiedData.city != null){
					newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'City');
					newXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'City', cmCopiedData.city);
				}
				if(cmCopiedData.state != null){
					newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'State');
					newXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'State', cmCopiedData.state); 
				}
				if(cmCopiedData.country != null){
					newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'Country');
					newXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'Country', cmCopiedData.country); 
				}
				if(cmCopiedData.countryCode != null){
					newXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'CountryCode');
					newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'CountryCode', cmCopiedData.countryCode);
				}
				if(cmCopiedData.headline != null){
					newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'Headline');
					newXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'Headline', cmCopiedData.headline);
				}
				if(cmCopiedData.extDesc != null){
					newXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility');
					newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility', cmCopiedData.extDesc);
				}
				if(cmCopiedData.altText != null){
					newXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility');
					newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility', cmCopiedData.altText);
				}
				if(cmCopiedData.title != null){
					newXMP.deleteProperty(XMPConst.NS_DC, 'title');
					newXMP.setProperty(XMPConst.NS_DC, 'title', cmCopiedData.title);
				}


				var updatedMetadata = newXMP.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
				selection[i].metadata = new Metadata(updatedMetadata); //write to file
			}
		}

		if(errorFiles > 0){
			alert("Copy Metadata Error:\n" + errorFiles + " files were not processed because they do not support metadata.")
		}


		app.synchronousMode = false;
	}
	catch(e){
		alert("Copy Metadata Error:\n" + e + ' ' + e.line);
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
	cmPaste(CM_METHOD_FLAGS.append);
}
cmMenuPasteCont.onSelect = function(){
	cmPaste(CM_METHOD_FLAGS.append);
}
cmMenuPasteOverwrite.onSelect = function(){
	cmPaste(0);
}
cmMenuPasteContOverwrite.onSelect = function(){
	cmPaste(0);
}

