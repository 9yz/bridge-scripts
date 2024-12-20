/* 

	textSubstitutions.jsx

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
const TS_VERSION = 1.0;

var TS_SUB_TABLE_BUILTIN;
var TS_SUB_TABLE_USER;


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

		#include "ts_customSubstitutions.jsx"

		tsInitalizePrefs();
		tsPrefsPanel();

		tsBuildSubstitutionTables();

	}
	catch(e){
		alert("Text Substitutions Error:\n" + e + ' ' + e.line);
	}
}

// called when text substitutions is selected in menu
tsMenuRun.onSelect = function(){
	tsRun();
}
tsMenuRunCont.onSelect = function(){
	tsRun();
}



function tsPrefsPanel(){
	// Event handler; called when prefs panel is opened  
	var tsPrefHandler = function(event){
		// Can only add a panel when the Preferences dialog opens
		if(event.type == "create" && event.location == "prefs"){

			/*
			Code for Import https://scriptui.joonas.me — (Triple click to select): 
			{"activeId":22,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"tsPrefsPanelObject","windowType":"Window","creationProps":{"su1PanelCoordinates":true,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Dialog","preferredSize":[400,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Panel","parentId":7,"style":{"enabled":true,"varName":"panelDelimiter","creationProps":{"borderStyle":"black","su1PanelCoordinates":false},"text":"Code Delimiter","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-2":{"id":2,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleBrackets","text":"[Single Brackets]","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-3":{"id":3,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleBrackets","text":"[[Double Brackets]] ","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-4":{"id":4,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleCurly","text":"{Curly Brackets}","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-5":{"id":5,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleCurly","text":"{{Double Curlies}}","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-6":{"id":6,"type":"Panel","parentId":7,"style":{"enabled":true,"varName":"panelDateField","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Get Creation Date From","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-7":{"id":7,"type":"Group","parentId":17,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-8":{"id":8,"type":"RadioButton","parentId":6,"style":{"enabled":true,"varName":"rbUseEXIFDate","text":"EXIF (reccomended)","preferredSize":[0,0],"alignment":null,"helpTip":"Get date from EXIF. This field is updated by Bridge's \"Edit Capture Time\" feature."}},"item-9":{"id":9,"type":"RadioButton","parentId":6,"style":{"enabled":true,"varName":"rbUseIPTCDate","text":"IPTC","preferredSize":[0,0],"alignment":null,"helpTip":"Get date from IPTC. This field is NOT updated by Bridge's \"Edit Capture Time\" feature."}},"item-10":{"id":10,"type":"StaticText","parentId":6,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"Select which field time-based substitutions like tDate and tTime should get the Creation Date from. ","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleEquals","text":"=Single Equals=","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleEquals","text":"==Double Equals==","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"StaticText","parentId":6,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"tEXIFTime and tIPTCTime will always get the ISO 8601 timestamp from their respective fields.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-14":{"id":14,"type":"Divider","parentId":0,"style":{"enabled":true,"varName":null}},"item-15":{"id":15,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"View documentation and contribute to Text Substitutions at https://github.com/9yz/bridge-scripts","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-16":{"id":16,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"Set the delimiter used to identify substitutions. Don't forget to update  any custom recursive substitutions when changing this setting!","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-17":{"id":17,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-18":{"id":18,"type":"Panel","parentId":19,"style":{"enabled":true,"varName":"panelSepTags","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Separate Substitutions in Keywords","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-19":{"id":19,"type":"Group","parentId":17,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-20":{"id":20,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"When set, substitutions used in the Keywords field containing commas will be split into multiple keywords.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-21":{"id":21,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"For example, if the substitution [[foods]] is set  to be substituted with \"apples,  crackers\" and this setting is enabled, 2 tags will be created - one  each for \"apples\" and \"crackers\". Otherwise, only one tag will be created","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-22":{"id":22,"type":"Checkbox","parentId":18,"style":{"enabled":true,"varName":"rbSepTags","text":"Separate Substitutions in Keywords","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,17,7,1,16,2,3,4,5,11,12,6,10,13,8,9,19,18,20,21,22,14,15],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
			*/ 

			

			// TSPREFSPANELOBJECT
			// ==================
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
				group1.orientation = "row"; 
				group1.alignChildren = ["left","top"]; 
				group1.spacing = 10; 
				group1.margins = 0; 

			// GROUP2
			// ======
			var group2 = group1.add("group", undefined, {name: "group2"}); 
				group2.preferredSize.width = 400; 
				group2.orientation = "column"; 
				group2.alignChildren = ["fill","top"]; 
				group2.spacing = 10; 
				group2.margins = 0; 

			// PANELDELIMITER
			// ==============
			var panelDelimiter = group2.add("panel", undefined, undefined, {name: "panelDelimiter", borderStyle: "black"}); 
				panelDelimiter.text = "Code Delimiter"; 
				panelDelimiter.orientation = "column"; 
				panelDelimiter.alignChildren = ["fill","top"]; 
				panelDelimiter.spacing = 10; 
				panelDelimiter.margins = 10; 

			var statictext1 = panelDelimiter.add("statictext", undefined, undefined, {name: "statictext1", multiline: true}); 
				statictext1.text = "Set the delimiter used to identify substitutions. Don't forget to update any custom recursive substitutions when changing this setting!"; 
			 

			var rbSingleBrackets = panelDelimiter.add("radiobutton", undefined, undefined, {name: "rbSingleBrackets"}); 
				rbSingleBrackets.text = "[Single Brackets]"; 
				rbSingleBrackets.value = true; 

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
			var panelDateField = group2.add("panel", undefined, undefined, {name: "panelDateField"}); 
				panelDateField.text = "Get Creation Date From"; 
				panelDateField.orientation = "column"; 
				panelDateField.alignChildren = ["fill","top"]; 
				panelDateField.spacing = 10; 
				panelDateField.margins = 10; 

			var statictext2 = panelDateField.add("statictext", undefined, undefined, {name: "statictext2", multiline: true}); 
				statictext2.text = "Select which field time-based substitutions like tDate and tTime should get the Creation Date from. "; 
				statictext2.alignment = ["fill","top"]; 
			
			var statictext3 = panelDateField.add("statictext", undefined, undefined, {name: "statictext3", multiline: true}); 
				statictext3.text = "tEXIFTime and tIPTCTime will always get the ISO 8601 timestamp from their respective fields."; 
				statictext3.alignment = ["fill","top"]; 			

			var rbUseEXIFDate = panelDateField.add("radiobutton", undefined, undefined, {name: "rbUseEXIFDate"}); 
				rbUseEXIFDate.helpTip = "Get date from EXIF. This field is updated by Bridge's \u0022Edit Capture Time\u0022 feature."; 
				rbUseEXIFDate.text = "EXIF (reccomended)"; 

			var rbUseIPTCDate = panelDateField.add("radiobutton", undefined, undefined, {name: "rbUseIPTCDate"}); 
				rbUseIPTCDate.helpTip = "Get date from IPTC. This field is NOT updated by Bridge's \u0022Edit Capture Time\u0022 feature."; 
				rbUseIPTCDate.text = "IPTC"; 

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



			// GROUP3
			// ======
			var group3 = group1.add("group", undefined, {name: "group3"}); 
				group3.preferredSize.width = 400; 
				group3.orientation = "row"; 
				group3.alignChildren = ["left","top"]; 
				group3.spacing = 10; 
				group3.margins = 0; 

			// PANELSEPTAGS
			// ============
			var panelSepTags = group3.add("panel", undefined, undefined, {name: "panelSepTags"}); 
				panelSepTags.text = "Separate Substitutions in Keywords"; 
				panelSepTags.orientation = "column"; 
				panelSepTags.alignChildren = ["left","top"]; 
				panelSepTags.spacing = 10; 
				panelSepTags.margins = 10; 

			var statictext4 = panelSepTags.add("statictext", undefined, undefined, {name: "statictext4", multiline: true}); 
				statictext4.text = "When set, substitutions used in the Keywords field containing commas will be split into multiple keywords."; 
				statictext4.alignment = ["fill","top"]; 

			var statictext5 = panelSepTags.add("statictext", undefined, undefined, {name: "statictext5", multiline: true}); 
				statictext5.text = "For example, if the substitution [[foods]] is set  to be substituted with \u0022apples,crackers\u0022 and this setting is enabled, 2 tags will be created - one each for \u0022apples\u0022 and \u0022crackers\u0022. Otherwise, only one tag will be created"; 
				statictext5.alignment = ["fill","top"]; 

			var cbSepTags = panelSepTags.add("checkbox", undefined, undefined, {name: "rbSepTags"}); 
				cbSepTags.text = "Separate Substitutions in Keywords (recommended)"; 

			if(app.preferences.tsSeparateTags){ // initalize value
				cbSepTags.value = true;
			}

			cbSepTags.onClick = function(){ // update values on click
				app.preferences.tsSeparateTags = cbSepTags.value;
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
			
				statictext3.add("statictext", undefined, "Version " + TS_VERSION); 
				statictext3.add("statictext", undefined, "View documentation and contribute to Text Substitutions at https://github.com/9yz/bridge-scripts"); 
		
			

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
	alert("Text Substitutions:\nNo preferences found, setting defaults!")
	app.preferences.tsDelimiter = 1; // int representing the `delimiters` array index of the delimiter to use
	app.preferences.tsDateField = 0; // 0 = EXIF, 1 = IPTC
	app.preferences.tsSeparateTags = 1; // 1 = seperate tags
	app.preferences.tsPrefsSet = true;
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


// Build builtin and custom substitution tables
function tsBuildSubstitutionTables(){
	const builtinTableSize = 211; // size we want for the hashtable - should be a prime at least 2x the size of builtinCommands.
	const builtinCommands = [ // map of all program-defined substitutions
		// time-based substitutions
		{ target: "tdate",				replacement: tsTDateTaken					},
		{ target: "tdatep",				replacement: tsTDateTakenPretty				},
		{ target: "tdatepretty",		replacement: tsTDateTakenPretty				},
		{ target: "tdateps",			replacement: tsTDateTakenPrettyShort		},
		{ target: "tdateprettyshort",	replacement: tsTDateTakenPrettyShort		},
		{ target: "tday",				replacement: tsTDateTakenDay				},
		{ target: "tdayp",				replacement: tsTDateTakenDayPretty			},
		{ target: "tdaypretty",			replacement: tsTDateTakenDayPretty			},
		{ target: "tmonth",				replacement: tsTDateTakenMonth				},
		{ target: "tmonthp",			replacement: tsTDateTakenMonthPretty		},
		{ target: "tmonthpretty",		replacement: tsTDateTakenMonthPretty		},
		{ target: "tmonthps",			replacement: tsTDateTakenMonthPrettyShort	},
		{ target: "tmonthprettyshort",	replacement: tsTDateTakenMonthPrettyShort	},
		{ target: "tyear",				replacement: tsTDateTakenYear				},
		{ target: "tyr",				replacement: tsTDateTakenYear				},
		{ target: "tyearshort",			replacement: tsTDateTakenYearShort			},
		{ target: "tyrs",				replacement: tsTDateTakenYearShort			},
		{ target: "ttime12",			replacement: tsTTimeTaken12					},
		{ target: "ttime24",			replacement: tsTTimeTaken24					},
		{ target: "ttime",				replacement: tsTTimeTaken24					},
		{ target: "ttod",				replacement: tsTTimeOfDay					},
		{ target: "ttimeofday",			replacement: tsTTimeOfDay					},
		{ target: "thr",				replacement: tsTHour						},
		{ target: "thour",				replacement: tsTHour						},
		{ target: "tmin",				replacement: tsTMinute						},
		{ target: "tminute",			replacement: tsTMinute						},
		{ target: "tsec",				replacement: tsTSecond						},
		{ target: "tsecond",			replacement: tsTSecond						},
		{ target: "tdt",				replacement: tsTDateTime					},
		{ target: "tdatetime",			replacement: tsTDateTime					},
		{ target: "texiftime",			replacement: tsTEXIFTime					},
		{ target: "tiptctime",			replacement: tsTIPTCTime					},

		// metadata-based substitutions
		{ target: "mname",				replacement: tsMFileName					},
		{ target: "mfile",				replacement: tsMFileName					},
		{ target: "mfilename",			replacement: tsMFileName					},
		{ target: "mfilenameshort",		replacement: tsMFileNameShort				},
		{ target: "mnameshort",			replacement: tsMFileNameShort				},
		{ target: "mfileshort",			replacement: tsMFileNameShort				},
		{ target: "mfiles",				replacement: tsMFileNameShort				},
		{ target: "mnames",				replacement: tsMFileNameShort				},
		{ target: "mfoldername",		replacement: tsMFolderName					},
		{ target: "mfolder",			replacement: tsMFolderName					},
		{ target: "mtitle",				replacement: tsMTitle						},
		{ target: "mheadline",			replacement: tsMHeadline					},
		{ target: "mcredit",			replacement: tsMCreditLine					},
		{ target: "mcreditline",		replacement: tsMCreditLine					},
		{ target: "msublocation",		replacement: tsMSublocation					},
		{ target: "mlocation",			replacement: tsMLocation					},
		{ target: "mcity",				replacement: tsMCity						},
		{ target: "mstate",				replacement: tsMState						},
		{ target: "mprovince",			replacement: tsMState						},
		{ target: "mcountry",			replacement: tsMCountry						}, 
		{ target: "mrating",			replacement: tsMRating						}, 
		{ target: "mratingpretty",		replacement: tsMRatingPretty				}, 
		{ target: "mratingp",			replacement: tsMRatingPretty				},
		{ target: "mlabel",				replacement: tsMLabel						},

		// camera-based substitutions
		{ target: "cwidth",				replacement: tsCWidth						}, 
		{ target: "cw",					replacement: tsCWidth						}, 
		{ target: "cheight",			replacement: tsCHeight						}, 
		{ target: "ch",					replacement: tsCHeight						}, 
		{ target: "ccamera",			replacement: tsCCamera						}, 
		{ target: "ccam",				replacement: tsCCamera						}, 
		{ target: "cserial",			replacement: tsCSerial						}, 
		{ target: "clens",				replacement: tsCLens						}, 
		{ target: "cshutterspeed",		replacement: tsCShutterSpeed				}, 
		{ target: "cshutter",			replacement: tsCShutterSpeed				}, 
		{ target: "css",				replacement: tsCShutterSpeed				}, 
		{ target: "caperture",			replacement: tsCAperture					}, 
		{ target: "cf",					replacement: tsCAperture					}, 
		{ target: "ciso",				replacement: tsCISO							}, 
		{ target: "cfocallength",		replacement: tsCFocalLength					}, 
		{ target: "czoom",				replacement: tsCFocalLength					}, 
		{ target: "cfocallength35",		replacement: tsCFocalLength35				}, 
		{ target: "czoom35",			replacement: tsCFocalLength35				}, 
		{ target: "cexposurecomp",		replacement: tsCExposureComp				}, 
		{ target: "cexpcomp",			replacement: tsCExposureComp				}, 
		{ target: "ccomp",				replacement: tsCExposureComp				}

	]


	// build builtin table
	TS_SUB_TABLE_BUILTIN = new SubstitutionTable(builtinTableSize);
	for(var i in builtinCommands){
		TS_SUB_TABLE_BUILTIN.insert(builtinCommands[i]);
	}

	tsBuildCustomSubTables();
	
}

// Finds custom substitution files and builds them into TS_SUB_TABLE_USER
function tsBuildCustomSubTables(){
	if(typeof tsCustomSubstitutions == 'undefined') return;

	// prime nums, somewhat evenly spaced for use as user table size for better modulo
	const primes = [53, 101, 211, 307, 401, 601, 809, 1009, 1201, 1399, 1601, 1901, 2399, 2801, 3203, 6397, 12007, 2400, 48017, 96001]; 
	
	var size;
	var i = 0;
	
	// in the ungodly case someone has > 50,000 substitutions, just pick something that's maybe a prime number
	if(tsCustomSubstitutions.length*2 > primes[primes.length-1]){
		alert("Text Substitutions is impressed!\nIf you're seeing this, you have more than 48,000 substitutions which is way more than I ever expected anyone would use. Don't worry, I added a fallback to ensure the program still works, it will just be slightly less efficent.\n\nAlso, please leave a github issue or email me (9yz [at] 9yz.dev) so I can learn what the fuck you're doing that requires 48,000 substitutions.");
		size = (tsCustomSubstitutions.length*2)+1; 
	}
	else{
		for(i in primes){
			if(tsCustomSubstitutions.length*2 < primes[i]){
				size = primes[i];
				break; // find the first prime larger than the number of custom subs *2
			} 
		}
	}

	TS_SUB_TABLE_USER = new SubstitutionTable(size);

	for(var j in tsCustomSubstitutions){ // move items from tsCustomSubstitutions to the table
		TS_SUB_TABLE_USER.insert(tsCustomSubstitutions[j]);
	}


}



// Run when the script is selected. Gets user input, selects properties to edit, and passes them to tsDoSubstitutions()
function tsRun(){
	try{
		app.synchronousMode = true;

		var errorFiles = 0;
		var selection = app.document.selections; // get selected files
		if(!selection.length){ // nothing selected
			alert('Text Substitutions Error:\nNothing selected!');
			return;
		} 

		if (ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API
		
		for(var i = 0; i < selection.length; i++){ 
			if(!selection[i].container){ // exclude folders and check if this item uses XMP
				// get existing metadata for this item
				var existingMetadata = selection[i].synchronousMetadata; 
				if(!existingMetadata){ // does this file support metadata?
					errorFiles++;
					continue;
				} 
				var myXMP = new XMPMeta(existingMetadata.serialize());
				var value;
				try{

					// city
					value = selection[i].metadata.read(XMPConst.NS_PHOTOSHOP, 'City'); // get existing value
					value = tsDoSubstitutions(selection[i], value); // do substitutions on it
					myXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, 'City'); // delete the existing value
					myXMP.setProperty(XMPConst.NS_PHOTOSHOP, 'City', value); // replace with new value

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


					// keywords - stored as an array so we split them apart and run tsDoSubstitutions on each individually
					value = selection[i].metadata.read(XMPConst.NS_DC, 'subject').toString();
					myXMP.deleteProperty(XMPConst.NS_DC, 'subject'); 
					value = value.toString().split(',')

					for(var j in value){ 
						value[j] = tsDoSubstitutions(selection[i], value[j]); 
						if(app.preferences.tsSeparateTags){ // if this pref is enabled, check for commas after processing and split at each one into a seperate tag
							var tags = value[j].toString().split(',');
							for(var k in tags){
								myXMP.appendArrayItem(XMPConst.NS_DC, 'subject', tags[k], 0, XMPConst.ARRAY_IS_ORDERED);
							}
						}
						else myXMP.appendArrayItem(XMPConst.NS_DC, 'subject', value[j], 0, XMPConst.ARRAY_IS_ORDERED);
					}

					
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
		
		if(errorFiles > 0){
			alert("Text Substitutions Error:\n" + errorFiles + " files were not processed because they do not support metadata.")
		}
		
		app.synchronousMode = false;
	}
	catch(e){
		alert("Text Substitutions Error:\n" + e + ' ' + e.line);
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
	if(targetString.length == 0){ // case: empty replacement
		return;
	}

	// lookup target in builtin table
	var replObject = TS_SUB_TABLE_BUILTIN.lookup(targetString.toLowerCase()); 
	if(replObject != undefined){ // if this is undefined, nothing was found
		return replObject.replacement(selection).toString();
	}

	
	// lookup target in custom table - more complicated bc of enumerated replacements
	var splitString = targetString.split("#"); // for enumerated substitutions - [0] will be the tag, [1] will be the index. if length=1, enumeration is not being used. 
	if(splitString.length > 1) splitString[1] = parseInt(splitString[1]); // convert to int

	var replText; // text we're replacing with
	replObject = TS_SUB_TABLE_USER.lookup(splitString[0].toString()); // object holding the replacement. undefined if not in this table
	if(replObject != undefined){

		if(splitString.length == 1){ 				// CASE 1: enumeration not used
			if(!isArray(replObject.replacement)){ 	// CASE 1a: target repl is not an array
				replText = replObject.replacement;

			} else{ 								// CASE 1b: if it IS an array, grab the first element
				replText = replObject.replacement[0];
			}
		}
		else if(splitString.length == 2) { 			// CASE 2: enumeration is used
			if(isArray(replObject.replacement)){ 	// CASE 2a: target repl is an array

				if(splitString[1] < 1 || splitString[1] > replObject.replacement.length){ // ERROR: enum index out of bounds
					alert("TextSubstitutions Error:\nIndex out of bounds: " + targetString + " in " + selection.name + ".\nIndex must be in 1, " + replObject.replacement.length + " (inclusive).\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
					throw SyntaxError("unknownSubstitution");
				}
				replText = replObject.replacement[splitString[1]-1]; // sub 1 to switch to 1-indexing

			}
			else if(splitString[1] == 1){ 			// CASE 2b: not an array but we're grabbing the first one so it's fine
				replText = replObject.replacement;
			}
			else { 									// CASE 2c ERROR: target repl is NOT an array and we're grabbing not the first index 
				alert("TextSubstitutions Error:\nEnumeration defined on non-enumerable replacement: " + targetString + " in " + selection.name + ".\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
				throw SyntaxError("unknownSubstitution");
			}

		}
		else{ 										// CASE 3 ERROR: too many #s in targetstring
			alert("TextSubstitutions Error:\nInvalid syntax " + targetString + " in " + selection.name + ". Only one # allowed.\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
				throw SyntaxError("unknownSubstitution");
		}


		replText = replText.toString();

		if(replObject.recursions > 0){ // does this need recursion?
			return tsDoSubstitutions(selection, replText, replObject.recursions-1);
		}
		else{
			return replText;
		}

	}
	

	// no matching function
	alert("TextSubstitutions Error:\nUnknown substitution " + splitString + " in " + selection.name + ".\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
	throw SyntaxError("unknownSubstitution");
}



// returns either the IPTC or EXIF creation date, depending on what the user has set in prefs
function tsSelectionToCreationDate(sel){
	if(app.preferences.tsDateField == 0) return new XMPDateTime(sel.metadata.read(XMPConst.NS_EXIF, 'DateTimeOriginal'));
	else if(app.preferences.tsDateField == 1) return new XMPDateTime(sel.metadata.read(XMPConst.NS_XMP, 'CreateDate'));
	else alert("Text Substitutions Error:\ninvalid value for app.preferences.tsDateField!");
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

const TS_MONTH_MAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const TS_MONTH_ABBR_NAMES = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
const TS_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TS_TIME_OF_DAY_NAMES = [ "night", "night", "night", "night", "night", "night", "morning", "morning", "morning", "morning", "day", "day", "day", "day", "afternoon", "afternoon", "afternoon", "evening", "evening", "evening", "night", "night", "night", "night"]


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
	return TS_MONTH_MAMES[date.month-1] + " " + date.day + ", " + date.year;
}

// returns the formatted as Mmth. date, year. Ex. Jan. 1, 2024
function tsTDateTakenPrettyShort(sel){
	var date = tsSelectionToXMPDate(sel);
	return TS_MONTH_ABBR_NAMES[date.month-1] + " " + date.day + ", " + date.year;
}

// returns the numerical date
function tsTDateTakenDay(sel){
	return tsSelectionToXMPDate(sel).day;
}

// returns the day of the week IN UTC at this time.
function tsTDateTakenDayPretty(sel){
	return TS_DAY_NAMES[tsSelectionToDate(sel).getDay()];
}

// returns the numerical month
function tsTDateTakenMonth(sel){
	return tsSelectionToXMPDate(sel).month;
}

// returns the name of the month
function tsTDateTakenMonthPretty(sel){
	return TS_MONTH_MAMES[tsSelectionToXMPDate(sel).month-1];
}

// returns the short name of the month
function tsTDateTakenMonthPrettyShort(sel){
	return TS_MONTH_ABBR_NAMES[tsSelectionToXMPDate(sel).month-1];
}

// returns the numerical year
function tsTDateTakenYear(sel){
	return tsSelectionToXMPDate(sel).year;
}

// returns the last 2 digits of the year
function tsTDateTakenYearShort(sel){
	year = tsSelectionToXMPDate(sel).year;
	return year.toString().substring(year.length-2, year.length);
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
	return TS_TIME_OF_DAY_NAMES[tsSelectionToXMPDate(sel).hour];
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

// returns the filename without the file extension
function tsMFileNameShort(sel){
	var n = sel.name;
	return n.substring(0, n.lastIndexOf('.'));
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

// returns the image's rating as a number
function tsMRating(sel){
	return sel.core.quickMetadata.rating;
}

// returns the image's rating as a string of stars. Ex. if the rating is 3, *** will be returned.
function tsMRatingPretty(sel){
	var r = "";
	for(var i = 0; i < sel.core.quickMetadata.rating; i++){
		r += "*";
	}
	return r;
}

// returns the image's leabel
function tsMLabel(sel){
	return sel.core.quickMetadata.label;
}




//////////////////////////
// CAMERA FUNCTIONS

// returns the image's width
function tsCWidth(sel){
	return sel.core.quickMetadata.width;
}

// returns the image's height
function tsCHeight(sel){
	return sel.core.quickMetadata.height;
}

// returns the name of the camera used to take the photo
function tsCCamera(sel){
	return sel.metadata.read(XMPConst.NS_TIFF, 'Model');
}

// returns the serial no of the camera used to take the photo
function tsCSerial(sel){
	return sel.metadata.read(XMPConst.NS_EXIF_AUX, 'SerialNumber');
}

// returns the name of the lens used to take the photo
function tsCLens(sel){
	return sel.metadata.read(XMPConst.NS_EXIF_AUX, 'Lens');
}

// returns the shutter speed
function tsCShutterSpeed(sel){
	var x = sel.metadata.read(XMPConst.NS_EXIF, 'ExposureTime');
	// shutter speed is expressed as a fraction - could be 1/100 for one onehundreth or 3/1 for 3 seconds
	// so we split at the slash, check if there's a 1 after it. if there is, just use the first component.
	var y = x.split("/"); 
	return y[1] == 1 ? y[0] : x;
}

// returns the aperture value
function tsCAperture(sel){
	var x = sel.metadata.read(XMPConst.NS_EXIF, 'FNumber');
	if(x == "") return x;
	// f-num is expressed as a fraction in EXIF, so we need to turn that into a proper decimal
	x = x.split("/"); 
	return x[0]/x[1];
	// return Math.round(x[0]/x[1] * 10) / 10;
}

// returns the ISO
function tsCISO(sel){
	return sel.metadata.read(XMPConst.NS_EXIF, 'ISOSpeedRatings');
}

// returns the focal length 
function tsCFocalLength(sel){
	return sel.metadata.read(XMPConst.NS_EXIF, 'FocalLength');
}

// returns the 35mm equiv. focal length
function tsCFocalLength35(sel){
	return sel.metadata.read(XMPConst.NS_EXIF, 'FocalLengthIn35mmFilm');
}

// returns the expo. comp
function tsCExposureComp(sel){
	x = sel.metadata.read(XMPConst.NS_EXIF, 'ExposureBiasValue');
	if(x == "") return x;
	x = x.split("/"); 
	x = x[0]/x[1]
	x = x.toFixed(2) // round to 2 decimals
	if(x > 0){
		return "+" + x;
	}
	return x
}








// pads with leading zeroes
function padTwoDigitNumber(num){
	return num < 10 ? "0" + num.toString() : num;
}

// not perfect but good enough because we don't have Array.isArray()
function isArray(a){
	return (a instanceof Array);
}








// substitutionTable - a hashtable class (except not really because ES3 doesn't have CLASSES??)
// stores and looks up substitutions

// substitution objects passed in must have 2 children:
/// target - the string to replace
/// replacement - a string, array of strings, or function

// size should be a prime at least 2x the number of expected elements
function SubstitutionTable(size){
	const b = 37; // "choose b as the first prime number greater or equal to the number of characters in the input alphabet." assuming 26+10 chars in alphabet here
	var tableSize = 0;
	var tableLoad = 0; // number of objects in table
	var table;

	this.table = Array(size);
	this.tableSize = size;
	while(size--) this.table[size] = null; // fill array


	// returns true if the table is empty
	this.empty = function(){
		return (this.tableLoad == 0)
	}


	// calculates a simple rolling hash based on the substitution's target, modulos with tableSize
	this.calculateHash = function(t){
		const n = t.length;
		var h = 1;

		for(var i = 1; i < n+1; i++){
			h += t.charCodeAt(n-i) + b*h*i;
			h %= this.tableSize;
		}
		return h;
	}


	// takes a substitution object; calculates a hash from the target's name inserts it into the table
	this.insert = function(o){
		// if(this.tableLoad/this.tableSize > 0.75) alert("table getting full! load = " + (this.tableLoad/this.tableSize));

		var h = this.calculateHash(o.target);
		var numCollisions = 1;

		while(this.table[h] != null){
			h += numCollisions++;
			if(h > this.tableSize) h = 0; // wrap around
		}

		this.table[h] = o;
		this.tableLoad++;
		return;

	}


	// given an substitution target, looks it up in the table and returns a substitution object. returnes undefined if no result
	this.lookup = function(t){
		if(this.empty()){
			return undefined;
		}

		
		var h = this.calculateHash(t);
		// alert("looking up " + t + ", h = " + h);
		var numCollisions = 1;
		
		while(this.table[h] && this.table[h].target != t){ // linear probing
			h += numCollisions++;
			if(h > this.tableSize) h = 0; // wrap around
		}

		
		if(!this.table[h]){ return undefined;}

		// alert("found " + t+ " at " + h);
		return this.table[h];

	}


}

		