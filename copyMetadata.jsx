/*

	copyMetadataCont Script created by 9yz
	Last modifed 11/22/24

	Adds the ability to copy IPTC metadata between files.

	/// TODO:
	- UI?

*/


// basically just an enum
// when passed to a function, specifies which types to copy/paste
// only specifically noted types can use the append method
const typeFlags = {
	description:	1,
	tags: 			2, // can be appended
	location: 		4,
};
const allTypeFlags = typeFlags.description+typeFlags.tags+typeFlags.location;

// enum: when passed to a paste function, specifies how it should be pasted
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
	countrycode:		null
};




#target bridge
if(BridgeTalk.appName == 'bridge'){ // STARTUP FUNCTION: run when bridge starts, used for setup
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

		// create tool menu folders
		if(MenuElement.find('copyMetadata') == null){
			MenuElement.create('menu', 'Copy property...', 'at the end of Tools', 'copyMetadata');
		}
		if(MenuElement.find('pasteMetadata') == null){
			MenuElement.create('menu', 'Paste property...', 'at the end of Tools', 'pasteMetadata');
		}

		// create tools menu options
		var cmCopyAll = 			MenuElement.create('command', 'All', 'at the end of copyMetadata'); 
		var cmPasteAll = 			MenuElement.create('command', 'All (Overwrite)', 'at the end of pasteMetadata'); 
		var cmCopyDescription = 	MenuElement.create('command', 'Description', 'at the end of copyMetadata'); 
		var cmPasteDescription = 	MenuElement.create('command', 'Description', 'at the end of pasteMetadata');
		var cmCopyTags =			MenuElement.create('command', 'Keywords', 'at the end of copyMetadata'); 
		var cmPasteTags = 			MenuElement.create('command', 'Keywords (Overwrite)', 'at the end of pasteMetadata');
		var cmPasteTagsApp = 		MenuElement.create('command', 'Keywords (Append)', 'at the end of pasteMetadata');
		var cmCopyLocation = 		MenuElement.create('command', 'Location', 'at the end of copyMetadata'); 
		var cmPasteLocation = 		MenuElement.create('command', 'Location', 'at the end of pasteMetadata');
	
		// create context (right click) menu folders
		if(MenuElement.find('pasteMetadataCont') == null){
			MenuElement.create('menu', 'Paste property...', 'after Thumbnail/Open', 'pasteMetadataCont');
		}
		if(MenuElement.find('copyMetadataCont') == null){
			MenuElement.create('menu', 'Copy property...', 'after Thumbnail/Open', 'copyMetadataCont');
		}

		// items for context menu folders
		var cmCopyAllCont = 			MenuElement.create('command', 'All', 'at the end of copyMetadataCont');
		var cmPasteAllCont = 			MenuElement.create('command', 'All (Overwrite)', 'at the end of pasteMetadataCont');
		var cmCopyDescriptionCont = 	MenuElement.create('command', 'Description', 'at the end of copyMetadataCont'); 
		var cmPasteDescriptionCont = 	MenuElement.create('command', 'Description', 'at the end of pasteMetadataCont'); 
		var cmCopyTagsCont = 			MenuElement.create('command', 'Keywords', 'at the end of copyMetadataCont'); 
		var cmPasteTagsCont = 			MenuElement.create('command', 'Keywords (Overwrite)', 'at the end of pasteMetadataCont'); 
		var cmPasteTagsAppCont = 		MenuElement.create('command', 'Keywords (Append)', 'at the end of pasteMetadataCont'); 
		var cmCopyLocationCont = 		MenuElement.create('command', 'Location', 'at the end of copyMetadataCont'); 
		var cmPasteLocationCont = 		MenuElement.create('command', 'Location', 'at the end of pasteMetadataCont');

	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}




function cmCopy(type, method){
	try{
		app.synchronousMode = true; // ensures we're getting the full metadata

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

		

		if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API

		// get existing metadata for this item
		var newMetadata = selection[0].synchronousMetadata; 
		var myXMP = new XMPMeta(newMetadata.serialize());


		// get copied data and save it based on set flags
		if(type & typeFlags.description){
			copiedData.description = selection[0].metadata.read(XMPConst.NS_DC, 'description');
			// we DON'T use .getProperty here because it doesn't return a string, it returns an XMPProperty object which can have localization and arrays and other bullshit and fuck that
		}
		if(type & typeFlags.tags){
			var tags = selection[0].metadata.read(XMPConst.NS_DC, 'subject').toString(); // convert to one long string
			copiedData.tags = tags.split(','); // separate string into array
		}
		if(type & typeFlags.location){
			copiedData.sublocation = 	selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'Location');
			copiedData.city = 			selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'City');
			copiedData.state = 			selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'State');
			copiedData.country = 		selection[0].metadata.read(XMPConst.NS_PHOTOSHOP, 'Country');
			copiedData.countrycode = 	selection[0].metadata.read(XMPConst.NS_IPTC_CORE, 'CountryCode');
		}
		/*
		if(type & typeFlags.author){
			// TODO
		} */


		app.synchronousMode = false;
	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}

function cmPaste(type, method){
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
				if(type & typeFlags.description && copiedData.description != null){
					newXMP.deleteProperty(XMPConst.NS_DC, 'description'); // delete old desc
					newXMP.setProperty(XMPConst.NS_DC, 'description', copiedData.description); // update w/ new desc
				}
				if(type & typeFlags.tags && copiedData.tags != null){
					if(!method & methodFlags.append) newXMP.deleteProperty(XMPConst.NS_DC, 'subject'); // delete old desc if we aren't appending

					for(var j in copiedData.tags){ // iterate through tags, adding all
						newXMP.appendArrayItem(XMPConst.NS_DC, 'subject', copiedData.tags[j], 0, XMPConst.ARRAY_IS_ORDERED);
					}
				}
				if(type & typeFlags.location){
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
					if(copiedData.countrycode != null){
						newXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'CountryCode');
						newXMP.setProperty(XMPConst.NS_IPTC_CORE, 'CountryCode', copiedData.countrycode);
					}
				}
				/*
				if(type & typeFlags.author){
					// TODO
				}*/


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


// ALL
cmCopyAll.onSelect = function(){ 
	cmCopy(allTypeFlags, 0);
}
cmCopyAllCont.onSelect = function(){ 
	cmCopy(allTypeFlags, 0);
}

cmPasteAll.onSelect = function(){ 
	cmPaste(allTypeFlags, 0);
}
cmPasteAllCont.onSelect = function(){ 
	cmPaste(allTypeFlags, 0);
}



// DESCRIPTION
cmCopyDescription.onSelect = function(){ 
	cmCopy(typeFlags.description, 0);
}
cmCopyDescriptionCont.onSelect = function(){ 
	cmCopy(typeFlags.description, 0);
}

cmPasteDescription.onSelect = function(){ 
	cmPaste(typeFlags.description, 0);
}
cmPasteDescriptionCont.onSelect = function(){ 
	cmPaste(typeFlags.description, 0);
}



// TAGS
cmCopyTags.onSelect = function(){ 
	cmCopy(typeFlags.tags, 0);
}
cmCopyTagsCont.onSelect = function(){ 
	cmCopy(typeFlags.tags, 0);
}

cmPasteTags.onSelect = function(){ 
	cmPaste(typeFlags.tags, 0);
}
cmPasteTagsCont.onSelect = function(){ 
	cmPaste(typeFlags.tags, 0);
}
cmPasteTagsApp.onSelect = function(){ 
	cmPaste(typeFlags.tags, methodFlags.append);
}
cmPasteTagsAppCont.onSelect = function(){ 
	cmPaste(typeFlags.tags, methodFlags.append);
}


// LOCATION
cmCopyLocation.onSelect = function(){ 
	cmCopy(typeFlags.location, 0);
}
cmCopyLocationCont.onSelect = function(){ 
	cmCopy(typeFlags.location, 0);
}

cmPasteLocation.onSelect = function(){ 
	cmPaste(typeFlags.location, 0);
}
cmPasteLocationCont.onSelect = function(){ 
	cmPaste(typeFlags.location, 0);
}
