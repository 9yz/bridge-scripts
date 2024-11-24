/* 

	textSubstitutions.jsx
	11/24/24

	1. read property
	2. find opening and closing [[brackets]]
	3. identify corresponding subst
	4. run function to determinereplacement
	5. replace
	6. repeat 2-6 till end of string
	7. write property 

*/

// start and end strings must be the same size
const TS_START_CHAR = "[[";
const TS_END_CHAR = "]]";
const TS_EDGE_CHAR_SIZE = TS_START_CHAR.length;


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

		var tsMenuRun 			= MenuElement.create('command', 'Text Substitutions...', 'at the end of Tools');
		var tsMenuRunCont 		= MenuElement.create('command', 'Text Substitutions...', 'after Thumbnail/Open'); 

	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}


// Gets user input, selects properties to edit, and passes them to tsDoSubstitutions()
function tsRun(){
	try{
		app.synchronousMode = true;

		var selection = app.document.selections; // get selected files
		if(!selection.length){ // nothing selected
			alert('Nothing selected!');
			return;
		} 

		if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API
		
		for(var i in selection){ 
			if(!selection[i].container){ // exclude folders
				// get existing metadata for this item
				var existingMetadata = selection[i].synchronousMetadata; 
				var myXMP = new XMPMeta(existingMetadata.serialize());

				// BEGIN PER-PROPERTY CODE
				var value = selection[0].metadata.read(XMPConst.NS_DC, 'description');
				value = tsDoSubstitutions(myXMP, "PLACEHOLDER_FILENAME.uwu", value); // find and replace substutions
				myXMP.deleteProperty(XMPConst.NS_DC, 'description'); // delete old desc
				myXMP.setProperty(XMPConst.NS_DC, 'description', value); // update w/ new desc
				// END PER-PROP CODE


				 // write updated metadata to file
				var updatedMetadata = myXMP.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
				selection[i].metadata = new Metadata(updatedMetadata);
			}

		}		

		app.synchronousMode = false;
	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}

// given a string of text, finds brackets surrpounding substitutions and replaces them with the string given by tsFindReplacement()
function tsDoSubstitutions(sourceXMP, sourceFileName, sourceText){
	alert("tsDoSubstitutions(): " + sourceText);
	var progressIndex = 0; // index of sourceText representing the farthest char we've analysed

	while(progressIndex <= sourceText.length){
		var start, end; 
		var targetString; // bracket-less string to be replaced
		var replacementString; 

		// find start and end indicies
		start = sourceText.indexOf(TS_START_CHAR, progressIndex);
		progressIndex = start + TS_EDGE_CHAR_SIZE; 
		end = sourceText.indexOf(TS_END_CHAR, progressIndex);
		progressIndex = start + TS_EDGE_CHAR_SIZE; 
		
		targetString = sourceText.toString().substr(start+TS_EDGE_CHAR_SIZE, end); // get the substr between the brackets
		replacementString = tsFindReplacement(sourceXMP, sourceFileName, targetString); // find replacement

		alert(sourceText.toString().substr(0, start) + " + \n" +
			replacementString + " + \n" +
			sourceText.toString().substr(end+TS_EDGE_CHAR_SIZE, sourceText.length-1)
		);

		sourceText =  // update sourcetext with replacementString
			sourceText.toString().substr(0, start) + 
			replacementString + 
			sourceText.toString().substr(end+TS_EDGE_CHAR_SIZE, sourceText.length-1); 

		// update progressIndex - length of the string is now different
		progressIndex -= TS_EDGE_CHAR_SIZE*2;
		progressIndex += replacementString-targetString;
	}

	return sourceText;
}


// given a target string, returns the replacement for it
function tsFindReplacement(sourceXMP, sourceFileName, targetString){
	alert("tsFindReplacement(): " + targetString);
	return "pizza";
}




// called when text substitutions is selected in menu
tsMenuRun.onSelect = function(){
	tsRun();
}
tsMenuRunCont.onSelect = function(){
	tsRun();
}

Array.prototype.indexOf = function(item){
	var index = 0, length = this.length;
	for(; index < length; index++){
		if(this[index] === item) return index;
	}
}