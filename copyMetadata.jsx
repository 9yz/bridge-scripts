/*
	copyMetadata Script created by 9yz
	Last modifed 05/28/24

	Adds the ability to copy IPTC metadata between files.


	/// Based on:
	Utility Pack Scripts created by David M. Converse ©2018-21

	/// License:
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/


#target bridge
if(BridgeTalk.appName == 'bridge'){
    try{
        var copyMetadata = new Object; // id object for this script

		var cmCopy = MenuElement.create('command', 'Copy Metadata', 'at the end of Tools'); // create tools menu option
		var cmPaste = MenuElement.create('command', 'Paste Metadata', 'at the end of Tools'); // create tools menu option

		// var ftContCmd = MenuElement.create('command', 'Filename to Title', 'after Thumbnail/Open', this.menuID); // create context menu option
	}
    catch(e){
        alert(e + ' ' + e.line);
    }
}


cmCopy.onSelect = function(){ 
    cmCopyMetadata();
}

cmPaste.onSelect = function(){ 
    cmPasteMetadata();
}



var copiedXMP; // xmp-formatted metadata from the file we're copying from


// grab metadata from selected file, save it to copiedXMP
function cmCopyMetadata(){
    try{

        var selection = app.document.selections; // get selected files
        if(!selection.length) return; // nothing selected
		if(selection.length > 1){ // more than 1 selected
			alert('You can only copy from one file at a time.'); 
			return;
		} 
		if(selection[0].container){ // selection is a folder
			alert('Folders cannot be copied from.');
			return;
		}

        if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API


		// var ftTitle = selection[a].name; //get filename
		
		// get copied data and save it
		var copiedMetadata = selection[a].synchronousMetadata;
		copiedXMP = new XMPMeta(copiedMetadata.serialize()); // save copied data

    }
    catch(e){
        alert(e + ' ' + e.line);
    }
}


// iterate across selected files, replace their IPTC data with that from copiedXMP
function cmPasteMetadata(){
	try{

		// on paste call, iterate through pasting files:
		var selection = app.document.selections; // get selected files
        if(!selection.length) return; // nothing selected

		if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API

		for(var i in selection){ // iterate through selection
			if(!selection[i].container){ // exclude folders

				/// make copy of copied metadata, but only iptc data (all other data from pasting file remains intact)
				/// apply new metadata to pasting file
				var replacementXMP = copiedXMP;

				copiedXMP.deleteProperty(XMPConst.NS_DC, 'title'); //delete old title
				copiedXMP.appendArrayItem(XMPConst.NS_DC, 'title', ftTitle, 0, XMPConst.ALIAS_TO_ALT_TEXT); //write new title
				copiedXMP.setQualifier(XMPConst.NS_DC, 'title[1]', 'http://www.w3.org/XML/1998/namespace', 'lang', 'x-default');
				
				var ftUpdatedPacket = copiedXMP.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
				selection[i].metadata = new Metadata(ftUpdatedPacket); //write to file
			}
		}
	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}