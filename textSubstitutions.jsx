/* 

	textSubstitutions.jsx
	12/08/24

	Adds code replacements (ala PhotoMechanic). These are predefined strings that are replaced with other strings when the program is run via Tools > Text Substitutions...
	Codes are wrapped in [[double brackets]]. See https://github.com/9yz/bridge-scripts/wiki/Built%E2%80%90In-Substitutions for a list of default substitutions, or see commandMap in tsFindReplacement.
	Custom codes can also be added - see ts_customSubstitutions.jsx.

*/

// start and end strings must be the same size
var TS_START_CHAR;
var TS_END_CHAR;
var TS_EDGE_CHAR_SIZE; 
const TS_DELIMITERS = [
	// starting delim, ending delim, delim length.
	["[",  "]",  1],
	["[[", "]]", 2],
	["{",  "}",  1],
	["{{", "}}", 2],
	["=",  "=",  1],
	["==", "==", 2],
]


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

		tsInitalizePrefs();
		tsPrefsPanel();

	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}

function tsPrefsPanel(){

	// Event handler;  called when prefs panel is opened  
	var tsPrefHandler = function(event){
		// Can only add a panel when the Preferences dialog opens
		if(event.type == "create" && event.location == "prefs"){

			/*
			Code for Import https://scriptui.joonas.me — (Triple click to select): 
	{"activeId":16,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"tsPrefsPanelObject","windowType":"Window","creationProps":{"su1PanelCoordinates":true,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Dialog","preferredSize":[400,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Panel","parentId":7,"style":{"enabled":true,"varName":"panelDelimiter","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Code Delimiter","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-2":{"id":2,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleBrackets","text":"[Single Brackets]","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-3":{"id":3,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleBrackets","text":"[[Double Brackets]] ","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-4":{"id":4,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleCurly","text":"{Curly Brackets}","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-5":{"id":5,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleCurly","text":"{{Double Curlies}}","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-6":{"id":6,"type":"Panel","parentId":7,"style":{"enabled":true,"varName":"panelDateField","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Get Creation Date From","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-7":{"id":7,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-8":{"id":8,"type":"RadioButton","parentId":6,"style":{"enabled":true,"varName":"rbUseEXIFDate","text":"EXIF (reccomended)","preferredSize":[0,0],"alignment":null,"helpTip":"Get date from EXIF. This field is updated by Bridge's \"Edit Capture Time\" feature."}},"item-9":{"id":9,"type":"RadioButton","parentId":6,"style":{"enabled":true,"varName":"rbUseIPTCDate","text":"IPTC","preferredSize":[0,0],"alignment":null,"helpTip":"Get date from IPTC. This field is NOT updated by Bridge's \"Edit Capture Time\" feature."}},"item-10":{"id":10,"type":"StaticText","parentId":6,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"Select which field time-based substitutions like tDate and tTime should get the Creation Date from. ","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleEquals","text":"=Single Equals=","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleEquals","text":"==Double Equals==","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"StaticText","parentId":6,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"tEXIFTime and tIPTCTime will always get the ISO 8601 timestamp from their respective fields.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-14":{"id":14,"type":"Divider","parentId":0,"style":{"enabled":true,"varName":null}},"item-15":{"id":15,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"View documentation and contribute to Text Substitutions at https://github.com/9yz/bridge-scripts","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-16":{"id":16,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"Set the delimiter used to identify substitutions. Don't forget to update  any custom recursive substitutions when changing this setting!","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,7,1,16,2,3,4,5,11,12,6,10,13,8,9,14,15],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
			*/ 

			

			// PALETTE
			// =======
			var tsPrefsPanelObject = event.object.addPanel(" Text Substitutions");
				tsPrefsPanelObject.text = "Dialog"; 
				tsPrefsPanelObject.preferredSize.width = 600; 
				tsPrefsPanelObject.orientation = "column"; 
				tsPrefsPanelObject.alignChildren = ["fill","top"]; 
				tsPrefsPanelObject.spacing = 10; 
				tsPrefsPanelObject.margins = 16; 
			
			// GROUP1
			// ======
			var group1 = tsPrefsPanelObject.add("group", undefined, {name: "group1"}); 
				group1.orientation = "column"; 
				group1.alignChildren = ["fill","top"]; 
				group1.spacing = 10; 
				group1.margins = 0; 
			
			// PANELDELIMITER
			// ==============
			var panelDelimiter = group1.add("panel", undefined, undefined, {name: "panelDelimiter"});
				panelDelimiter.text = "Code Delimiter"; 
				panelDelimiter.orientation = "column"; 
				panelDelimiter.alignChildren = ["fill","top"]; 
				panelDelimiter.spacing = 8; 
				panelDelimiter.margins = 10; 

			var statictext1 = panelDelimiter.add("group", undefined , {name: "statictext1"}); 
				statictext1.getText = function() { var t=[]; for ( var n=0; n<statictext1.children.length; n++ ) { var text = statictext1.children[n].text || ''; if ( text === '' ) text = ' '; t.push( text ); } return t.join('\n'); }; 
				statictext1.orientation = "column"; 
				statictext1.alignChildren = ["left","center"]; 
				statictext1.spacing = 0; 

				statictext1.add("statictext", undefined, "Set the delimiter used to identify substitutions. Don't forget to"); 
				statictext1.add("statictext", undefined, "update any custom recursive substitutions when changing this"); 
				statictext1.add("statictext", undefined, "setting!"); 
			
			var rbSingleBrackets = panelDelimiter.add("radiobutton", undefined, undefined, {name: "rbSingleBrackets"}); 
				rbSingleBrackets.text = "[Single Brackets]"; 
			
			var rbDoubleBrackets = panelDelimiter.add("radiobutton", undefined, undefined, {name: "rbDoubleBrackets"}); 
				rbDoubleBrackets.text = "[[Double Brackets]] "; 
			
			var rbSingleCurly = panelDelimiter.add("radiobutton", undefined, undefined, {name: "rbSingleCurly"}); 
				rbSingleCurly.text = "{Curly Brackets}"; 
			
			var rbDoubleCurly = panelDelimiter.add("radiobutton", undefined, undefined, {name: "rbDoubleCurly"}); 
				rbDoubleCurly.text = "{{Double Curlies}}"; 
			
			var rbSingleEquals = panelDelimiter.add("radiobutton", undefined, undefined, {name: "rbSingleEquals"}); 
				rbSingleEquals.text = "=Single Equals="; 
			
			var rbDoubleEquals = panelDelimiter.add("radiobutton", undefined, undefined, {name: "rbDoubleEquals"}); 
				rbDoubleEquals.text = "==Double Equals=="; 

				// initalize delimiter values
				switch(app.preferences.tsDelimiter) {
					case 0:
						rbSingleBrackets.value = true;
						break;
					case 1:
						rbDoubleBrackets.value = true;
						break;
					case 2:
						rbSingleCurly.value = true;
						break;
					case 3:
						rbDoubleCurly.value = true;
						break;
					case 4:
						rbSingleEquals.value = true;
						break;
					case 5:
						rbDoubleEquals.value = true;
						break;
				}

				// update values on select
				rbSingleBrackets.onClick = function(){
					app.preferences.tsDelimiter = 0;
					TS_START_CHAR = 	TS_DELIMITERS[0][0];
					TS_END_CHAR = 		TS_DELIMITERS[0][1];
					TS_EDGE_CHAR_SIZE = TS_DELIMITERS[0][2];
				}
				rbDoubleBrackets.onClick = function(){
					app.preferences.tsDelimiter = 1;
					TS_START_CHAR = 	TS_DELIMITERS[1][0];
					TS_END_CHAR = 		TS_DELIMITERS[1][1];
					TS_EDGE_CHAR_SIZE = TS_DELIMITERS[1][2];
				}
				rbSingleCurly.onClick = function(){
					app.preferences.tsDelimiter = 2;
					TS_START_CHAR = 	TS_DELIMITERS[2][0];
					TS_END_CHAR = 		TS_DELIMITERS[2][1];
					TS_EDGE_CHAR_SIZE = TS_DELIMITERS[2][2];
				}
				rbDoubleCurly.onClick = function(){
					app.preferences.tsDelimiter = 3;
					TS_START_CHAR = 	TS_DELIMITERS[3][0];
					TS_END_CHAR = 		TS_DELIMITERS[3][1];
					TS_EDGE_CHAR_SIZE = TS_DELIMITERS[3][2];
				}
				rbSingleEquals.onClick = function(){
					app.preferences.tsDelimiter = 4;
					TS_START_CHAR = 	TS_DELIMITERS[4][0];
					TS_END_CHAR = 		TS_DELIMITERS[4][1];
					TS_EDGE_CHAR_SIZE = TS_DELIMITERS[4][2];
				}
				rbDoubleEquals.onClick = function(){
					app.preferences.tsDelimiter = 5;
					TS_START_CHAR = 	TS_DELIMITERS[5][0];
					TS_END_CHAR = 		TS_DELIMITERS[5][1];
					TS_EDGE_CHAR_SIZE = TS_DELIMITERS[5][2];
				}


			
			// PANELDATEFIELD
			// ==============
			var panelDateField = group1.add("panel", undefined, undefined, {name: "panelDateField"}); 
				panelDateField.text = "Get Creation Date From"; 
				panelDateField.orientation = "column"; 
				panelDateField.alignChildren = ["fill","top"]; 
				panelDateField.spacing = 8; 
				panelDateField.margins = 10; 
			
			var statictext1 = panelDateField.add("group", undefined , {name: "statictext1"}); 
				statictext1.getText = function() { var t=[]; for ( var n=0; n<statictext1.children.length; n++ ) { var text = statictext1.children[n].text || ''; if ( text === '' ) text = ' '; t.push( text ); } return t.join('\n'); }; 
				statictext1.orientation = "column"; 
				statictext1.alignChildren = ["left","center"]; 
				statictext1.spacing = 0; 
			
				statictext1.add("statictext", undefined, "Select which field time-based substitutions like tDate and"); 
				statictext1.add("statictext", undefined, "tTime should get the Creation Date from. "); 
			
			var statictext2 = panelDateField.add("group", undefined , {name: "statictext2"}); 
				statictext2.getText = function() { var t=[]; for ( var n=0; n<statictext2.children.length; n++ ) { var text = statictext2.children[n].text || ''; if ( text === '' ) text = ' '; t.push( text ); } return t.join('\n'); }; 
				statictext2.orientation = "column"; 
				statictext2.alignChildren = ["left","center"]; 
				statictext2.spacing = 0; 
			
				statictext2.add("statictext", undefined, "tEXIFTime and tIPTCTime will always get the ISO 8601"); 
				statictext2.add("statictext", undefined, "timestamp from their respective fields."); 
			
			var rbUseEXIFDate = panelDateField.add("radiobutton", undefined, undefined, {name: "rbUseEXIFDate"}); 
				rbUseEXIFDate.helpTip = "Get date from EXIF. This field is updated by Bridge's \u0022Edit Capture Time\u0022 feature."; 
				rbUseEXIFDate.text = "EXIF (reccomended)"; 
				rbUseEXIFDate.value = false;
			
			var rbUseIPTCDate = panelDateField.add("radiobutton", undefined, undefined, {name: "rbUseIPTCDate"}); 
				rbUseIPTCDate.helpTip = "Get date from IPTC. This field is NOT updated by Bridge's \u0022Edit Capture Time\u0022 feature."; 
				rbUseIPTCDate.text = "IPTC"; 
				rbUseIPTCDate.value = false;

				// initalize values
				switch (app.preferences.tsDateField) {
					case 0:
						rbUseEXIFDate.value = true;
						break;
					case 1:
						rbUseIPTCDate.value = true;
						break;
				}

				// update values on select
				rbUseEXIFDate.onClick = function(){
					app.preferences.tsDateField = 0;
				}
				rbUseIPTCDate.onClick = function(){
					app.preferences.tsDateField = 1;
				}
			
			// TSPREFSPANELOBJECT
			// ==================
			var divider1 = tsPrefsPanelObject.add("panel", undefined, undefined, {name: "divider1"}); 
				divider1.alignment = "fill"; 
			
			var statictext3 = tsPrefsPanelObject.add("group", undefined , {name: "statictext3"}); 
				statictext3.getText = function() { var t=[]; for ( var n=0; n<statictext3.children.length; n++ ) { var text = statictext3.children[n].text || ''; if ( text === '' ) text = ' '; t.push( text ); } return t.join('\n'); }; 
				statictext3.orientation = "column"; 
				statictext3.alignChildren = ["left","center"]; 
				statictext3.spacing = 0; 
			
				statictext3.add("statictext", undefined, "View documentation and contribute to Text Substitutions at"); 
				statictext3.add("statictext", undefined, "https://github.com/9yz/bridge-scripts"); 
		
			

			tsPrefsPanelObject.layout.layout(true); // not really sure what this does but without it nothing works so ¯\_(ツ)_/¯ 
		}
		
		return { handled: false };
	};

	// Register the event handler
	app.eventHandlers.push( { handler: tsPrefHandler } );
	
	
	return true;
}

// reset prefs to defaults
function tsSetDefaultPrefs(){
	// alert("Text Substitutions:\n No preferences found, setting defaults!")
	app.preferences.tsPrefsSet = true;
	app.preferences.tsDelimiter = 1; // int representing the `delimiters` array index of the delimiter to use
	app.preferences.tsDateField = 0; // 0 = EXIF, 1 = IPTC
}

// set vars based on prefs
function tsInitalizePrefs(){
	// set default prefs if they havent been set
	if(app.preferences.tsPrefsSet != true) tsSetDefaultPrefs();

	switch(app.preferences.tsDelimiter) {
		case 0:
			TS_START_CHAR = 	TS_DELIMITERS[0][0];
			TS_END_CHAR = 		TS_DELIMITERS[0][1];
			TS_EDGE_CHAR_SIZE = TS_DELIMITERS[0][2];
			break;
		case 1:
			TS_START_CHAR = 	TS_DELIMITERS[1][0];
			TS_END_CHAR = 		TS_DELIMITERS[1][1];
			TS_EDGE_CHAR_SIZE = TS_DELIMITERS[1][2];
			break;
		case 2:
			TS_START_CHAR = 	TS_DELIMITERS[2][0];
			TS_END_CHAR = 		TS_DELIMITERS[2][1];
			TS_EDGE_CHAR_SIZE = TS_DELIMITERS[2][2];
			break;
		case 3:
			TS_START_CHAR = 	TS_DELIMITERS[3][0];
			TS_END_CHAR = 		TS_DELIMITERS[3][1];
			TS_EDGE_CHAR_SIZE = TS_DELIMITERS[3][2];
			break;
		case 4:
			TS_START_CHAR = 	TS_DELIMITERS[4][0];
			TS_END_CHAR = 		TS_DELIMITERS[4][1];
			TS_EDGE_CHAR_SIZE = TS_DELIMITERS[4][2];
			break;
		case 5:
			TS_START_CHAR = 	TS_DELIMITERS[5][0];
			TS_END_CHAR = 		TS_DELIMITERS[5][1];
			TS_EDGE_CHAR_SIZE = TS_DELIMITERS[5][2];
			break;
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
		
		for(var i = 0; i < selection.length; i++){ 
			if(!selection[i].container){ // exclude folders
				// get existing metadata for this item
				var existingMetadata = selection[i].synchronousMetadata; 
				var myXMP = new XMPMeta(existingMetadata.serialize());
				var value;
				try{

					// city
					value = selection[i].metadata.read(XMPConst.NS_PHOTOSHOP, 'City');
					value = tsDoSubstitutions(selection[i], value); 
					myXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'City'); 
					myXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'City', value); 

					// state
					value = selection[i].metadata.read(XMPConst.NS_PHOTOSHOP, 'State');
					value = tsDoSubstitutions(selection[i], value); 
					myXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'State'); 
					myXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'State', value); 

					// country
					value = selection[i].metadata.read(XMPConst.NS_PHOTOSHOP, 'Country');
					value = tsDoSubstitutions(selection[i], value); 
					myXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'Country'); 
					myXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'Country', value); 

					// sublocation
					value = selection[i].metadata.read(XMPConst.NS_IPTC_CORE, 'Location');
					value = tsDoSubstitutions(selection[i], value); 
					myXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'Location'); 
					myXMP.setProperty(XMPConst.NS_IPTC_CORE, 'Location', value);

					// title
					value = selection[i].metadata.read(XMPConst.NS_DC, 'title');
					value = tsDoSubstitutions(selection[i], value); 
					myXMP.deleteProperty(XMPConst.NS_DC, 'title'); 
					myXMP.setProperty(XMPConst.NS_DC, 'title', value); 

					// headline
					value = selection[i].metadata.read(XMPConst.NS_PHOTOSHOP, 'Headline');
					value = tsDoSubstitutions(selection[i], value); // find and replace substutions
					myXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'Headline'); // delete old value
					myXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'Headline', value); // update w/ new value

					// alt text
					value = selection[i].metadata.read(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility');
					value = tsDoSubstitutions(selection[i], value); 
					myXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility'); 
					myXMP.setProperty(XMPConst.NS_IPTC_CORE, 'AltTextAccessibility', value); 
					
					// extended description
					value = selection[i].metadata.read(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility');
					value = tsDoSubstitutions(selection[i], value); 
					myXMP.deleteProperty(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility'); 
					myXMP.setProperty(XMPConst.NS_IPTC_CORE, 'ExtDescrAccessibility', value); 

					// keywords - disabled until i figure out why it's completely fucked
					/* value = selection[i].metadata.read(XMPConst.NS_DC, 'subject').toString();
					value = tsDoSubstitutions(selection[i], value); 
					value = value.toString().split(',')
					myXMP.deleteProperty(XMPConst.NS_DC, 'subject'); 
					for(var j in value){ // iterate through tags, adding all
						myXMP.appendArrayItem(XMPConst.NS_DC, 'subject', value[j], 0, XMPConst.ARRAY_IS_ORDERED);
					} */
					
					// description
					value = selection[i].metadata.read(XMPConst.NS_DC, 'description');
					value = tsDoSubstitutions(selection[i], value); 
					myXMP.deleteProperty(XMPConst.NS_DC, 'description'); 
					myXMP.setProperty(XMPConst.NS_DC, 'description', value); 
						
					
				} catch(e){
					if(e instanceof SyntaxError) break;
					else throw e;
				}

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
function tsDoSubstitutions(selection, sourceText, recursions){
	recursions = recursions || 0; // if not passed as a param, assume we want 0
	sourceText = sourceText.toString(); // for some reason it's not a string to begin with???
	var progressIndex = 0; // index of sourceText representing the farthest char we've analysed

	while(progressIndex <= sourceText.length){
		var start, end; 
		var targetString; // bracket-less string to be replaced
		var replacementString; 

		// find start and end indicies
		start = sourceText.indexOf(TS_START_CHAR, progressIndex);
		progressIndex = start + TS_EDGE_CHAR_SIZE; 
		end = sourceText.indexOf(TS_END_CHAR, progressIndex);
		progressIndex = end + TS_EDGE_CHAR_SIZE; 
		
		if(start != -1 && end != -1){ // -1 means cant find a bracket
			targetString = sourceText.substring(start+TS_EDGE_CHAR_SIZE, end); // get the substr between the brackets
			replacementString = tsFindReplacement(selection, targetString); // find replacement

			sourceText =  // update sourcetext with replacementString
				sourceText.substring(0, start) + 
				replacementString + 
				sourceText.substring(end+TS_EDGE_CHAR_SIZE, sourceText.length); 
		}
		else if(start != -1 && end == -1){ // case: mismatched brackets (cant find end)
			alert("TextSubstitutions Error:\nUnmatched " + TS_START_CHAR + " found in file " + selection.name + " at index " + start + ".\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
			throw SyntaxError("bracketMatching");
		}
		else if(start == -1 && end != -1){ // cant find start
			alert("TextSubstitutions Error:\nUnmatched " + TS_END_CHAR + " found in file " + selection.name + " at index " + end + ".\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
			throw SyntaxError("bracketMatching");
		}
		else { // if both are -1 there's nothing more to process
			break;
		}  
		
		// update progressIndex - length of the string is now different
		progressIndex -= TS_EDGE_CHAR_SIZE*2;
		progressIndex += replacementString.length - targetString.length;
	}

	if(recursions > 0){ // certain substitutions may contain more substitutions. if they do, we want to recursively evaluate them
		sourceText = tsDoSubstitutions(selection, sourceText, recursions-1);
	}

	return sourceText;
	
}


// given a target string, returns the replacement for it
function tsFindReplacement(selection, targetString){
	// alert("tsFindReplacement(): " + targetString);
	targetString = targetString.toLowerCase();

	if(targetString.length == 0){ // case: empty replacement
		return;
	}

	var commandMap = { // map of all program-defined substitutions
		// time-based substitutions
		"tdate"				: tsTDateTaken,
		"tdatep"			: tsTDateTakenPretty,
		"tdatepretty"		: tsTDateTakenPretty,
		"tdateps"			: tsTDateTakenPrettyShort,
		"tdateprettyshort"	: tsTDateTakenPrettyShort,
		"tday"				: tsTDateTakenDay,
		"tdayp"				: tsTDateTakenDayPretty,
		"tdaypretty"		: tsTDateTakenDayPretty,
		"tmonth"			: tsTDateTakenMonth,
		"tmonthp"			: tsTDateTakenMonthPretty,
		"tmonthpretty"		: tsTDateTakenMonthPretty,
		"tmonthps"			: tsTDateTakenMonthPrettyShort,
		"tmonthprettyshort"	: tsTDateTakenMonthPrettyShort,
		"tyear"				: tsTDateTakenYear,
		"tyr"				: tsTDateTakenYear,
		"tyearshort"		: tsTDateTakenYearShort,
		"tyrs"				: tsTDateTakenYearShort,
		"ttime12"			: tsTTimeTaken12,
		"ttime24"			: tsTTimeTaken24,
		"ttime"				: tsTTimeTaken24,
		"ttod"				: tsTTimeOfDay,
		"ttimeofday"		: tsTTimeOfDay,
		"thr"				: tsTHour,
		"thour"				: tsTHour,
		"tmin"				: tsTMinute,
		"tminute"			: tsTMinute,
		"tsec"				: tsTSecond,
		"tsecond"			: tsTSecond,
		"tdt"				: tsTDateTime,
		"tdatetime"			: tsTDateTime,
		"texiftime"			: tsTEXIFTime,
		"tiptctime"			: tsTIPTCTime,

		// metadata-based substitutions
		"mname"				: tsMFileName,
		"mfilename"			: tsMFileName,
		"mfoldername"		: tsMFolderName,
		"mfolder"			: tsMFolderName,
		"mtitle"			: tsMTitle,
		"mheadline"			: tsMHeadline,
		"mcredit"			: tsMCreditLine,
		"mcreditline"		: tsMCreditLine,
		"msublocation"		: tsMSublocation,
		"mlocation"			: tsMLocation,
		"mcity"				: tsMCity,
		"mstate"			: tsMState,
		"mprovince"			: tsMState,
		"mcountry"			: tsMCountry, 
	}
	
	// check if the string has a matching function, run and return the result if it does
	if(commandMap.hasOwnProperty(targetString)){ 
		return commandMap[targetString](selection).toString(); // for some reason not casting this to string causes the program to silently crash when it returns an int???
	}
	
	if(typeof tsCustomSubstitutions !== 'undefined'){ // have we loaded a custom substitutions file?
		// check if this is one of the custom substitutions
		for(var i = 0; i < tsCustomSubstitutions.length; i++){
			if(tsCustomSubstitutions[i].target == targetString){
				if(tsCustomSubstitutions[i].recursions > 0){ // does this need recursion?
					return tsDoSubstitutions(selection, tsCustomSubstitutions[i].replacement, tsCustomSubstitutions[i].recursions-1);
				}
				else{
					return tsCustomSubstitutions[i].replacement;
				}
			}

		}
	}

	// no matching function
	alert("TextSubstitutions Error:\nUnknown substitution " + targetString + " in " + selection.name + ".\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
	throw SyntaxError("unknownSubstitution");

}




// called when text substitutions is selected in menu
tsMenuRun.onSelect = function(){
	tsRun();
}
tsMenuRunCont.onSelect = function(){
	tsRun();
}


// returns either the IPTC or EXIF creation date, depending on what the user has set in prefs
function tsSelectionToCreationDate(sel){
	if(app.preferences.tsDateField == 0) return new XMPDateTime(sel.metadata.read(XMPConst.NS_EXIF, 'DateTimeOriginal'));
	else if(app.preferences.tsDateField == 1) return new XMPDateTime(sel.metadata.read(XMPConst.NS_XMP, 'CreateDate'));
	else alert("ERROR: invalid value for app.preferences.tsDateField!");
}

// returns the file's creation date as an XMPDateTime object
function tsSelectionToXMPDate(sel){
	return tsSelectionToCreationDate(sel);
}

// returns the file's creation date as a JS date object
function tsSelectionToDate(sel){
	date = tsSelectionToCreationDate(sel);
	return date.getDate();
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const monthsAbbr = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeOfDay = [ "night", "night", "night", "night", "night", "night", "morning", "morning", "morning", "morning", "day", "day", "day", "day", "afternoon", "afternoon", "afternoon", "evening", "evening", "evening", "night", "night", "night", "night"]


//////////////
// TIME FUNCTIONS

// returns the date in yyyy-mm-dd format
function tsTDateTaken(sel){
	var date = tsSelectionToXMPDate(sel);
	return date.year + "-" + date.month + "-" + date.day;
}

// returns the formatted as Monthname date, year. Ex. January 1, 2024
function tsTDateTakenPretty(sel){
	var date = tsSelectionToXMPDate(sel);
	return months[date.month-1] + " " + date.day + ", " + date.year;
}

// returns the formatted as Mmth. date, year. Ex. Jan. 1, 2024
function tsTDateTakenPrettyShort(sel){
	var date = tsSelectionToXMPDate(sel);
	return monthsAbbr[date.month-1] + " " + date.day + ", " + date.year;
}

// returns the numerical date
function tsTDateTakenDay(sel){
	return tsSelectionToXMPDate(sel).day;
}

// returns the day of the week IN UTC at this time.
function tsTDateTakenDayPretty(sel){
	return days[tsSelectionToDate(sel).getDay()];
}

// returns the numerical month
function tsTDateTakenMonth(sel){
	return tsSelectionToXMPDate(sel).month;
}

// returns the name of the month
function tsTDateTakenMonthPretty(sel){
	return months[tsSelectionToXMPDate(sel).month-1];
}

// returns the short name of the month
function tsTDateTakenMonthPrettyShort(sel){
	return monthsAbbr[tsSelectionToXMPDate(sel).month-1];
}

// returns the numerical year
function tsTDateTakenYear(sel){
	return tsSelectionToXMPDate(sel).year;
}

// returns the last 2 digits of the year
function tsTDateTakenYearShort(sel){
	year = tsSelectionToXMPDate(sel).year;
	return year.substring(year.length-2, year.length);
}

// returns the time taken in 12-hour format (ex. 2:43 pm)
function tsTTimeTaken12(sel){
	var date = tsSelectionToXMPDate(sel);
	var hour = date.hour > 12 ? date.hour-12 : date.hour;
	hour = hour == 0 ? 12 : hour;
	var period = date.hour > 11 ? " pm" : " am";
	return hour.toString() + ":" + padTwoDigitNumber(date.minute) +  period;
}

// time taken, 24-hr format
function tsTTimeTaken24(sel){
	var date = tsSelectionToXMPDate(sel);
	return date.hour + ":" + padTwoDigitNumber(date.minute);
}

// time of day. ex. morning, night, afternoon
function tsTTimeOfDay(sel){
	return timeOfDay[tsSelectionToXMPDate(sel).hour];
}

// returns the hour
function tsTHour(sel){
	return tsSelectionToXMPDate(sel).hour;
}

// returns the minute
function tsTMinute(sel){
	return padTwoDigitNumber(tsSelectionToXMPDate(sel).minute);
}

// returns the second
function tsTSecond(sel){ 
	return padTwoDigitNumber(tsSelectionToXMPDate(sel).second);
}

// returns the date and time. ex 2024-01-31 17:02
function tsTDateTime(sel){
	var date = tsSelectionToXMPDate(sel);
	return date.year + "-" + date.month + "-" + date.day + " " + date.hour + ":" + padTwoDigitNumber(date.minute);
}

// returns the datetime in full 8601 format with timezone from the EXIF creation date field
function tsTEXIFTime(sel){
	return sel.metadata.read(XMPConst.NS_EXIF, 'DateTimeOriginal');
}
// same but from IPTC field
function tsTIPTCTime(sel){
	return sel.metadata.read(XMPConst.NS_XMP, 'CreateDate');
}


///////////////////
// METADATA FUNCTIONS

// returns the filename
function tsMFileName(sel){
	return sel.name;
}

// returns the name of the parent folder
function tsMFolderName(sel){
	return sel.parent.name;
}

// returns the DC title param
function tsMTitle(sel){
	return sel.metadata.read(XMPConst.NS_DC, 'title');
}

// returns the PS headline param
function tsMHeadline(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, 'Headline');
}

// returns the PS credit line param
function tsMCreditLine(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, 'Credit');
}

// returns the iptc location field
function tsMSublocation(sel){
	return sel.metadata.read(XMPConst.NS_IPTC_CORE, 'Location');
}

// returns the PS country field
function tsMCountry(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, 'Country');
}

// returns the PS state field
function tsMState(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, 'State');
}

// returns the PS City field
function tsMCity(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, 'City');
}

// returns the PS Country, State, and City fields. Ex. United States, California, San Francisco
function tsMLocation(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, 'Country') + ", " + sel.metadata.read(XMPConst.NS_PHOTOSHOP, 'State') + ", " + sel.metadata.read(XMPConst.NS_PHOTOSHOP, 'City');
}




function padTwoDigitNumber(num){
	return num < 10 ? "0" + num.toString() : num;
}


/* Array.prototype.indexOf = function(item){
	var index = 0, length = this.length;
	for(; index < length; index++){
		if(this[index] === item) return index;
	}
} */