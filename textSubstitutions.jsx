/* 

	textSubstitutions.jsx

	See repo for doccumentation:
	https://github.com/9yz/bridge-scripts

*/


// start and end strings must be the same size
var TS_START_DELIM;
var TS_END_DELIM;
var TS_DELIM_SIZE;
var TS_DELIM_ENUM = "#";
var TS_DELIM_FUNC = ";";
const TS_DELIMITERS = [
	// starting delim, ending delim, delim length.
	["[",  "]",  1],
	["[[", "]]", 2],
	["{",  "}",  1],
	["{{", "}}", 2],
	["=",  "=",  1],
	["==", "==", 2],
]
const TS_VERSION = "1.2.0";
const TS_VERSION_PREFS = 100200; // equal to 1.002.00, or 1.2.0

var TS_SUB_TABLE_BUILTIN = [];
var TS_SUB_TABLE_BUILTIN_FUNCTIONS = [];
var TS_SUB_TABLE_USER = [];

var TS_LOADED_CUSTOM_FILES = [];
var TS_NUM_CUSTOM_RULES_LOADED = 0;
var TS_SCRIPTS_DIR;

var TS_RECURSIONS;
var TS_LAST_OP_TIMER = 0; // time it took to complete last operation
var TS_LAST_OP_FILES = 0; // number of files processed in the last operation

// basically just an enum
// the categories of metadata fields
const TS_PROPERTY_CATEGORIES = {
	core:		1,
	credit: 	2,
	misc: 		4,
	filename:	8,
};

var TS_USER_PROP_CATS_SELECTON

#target bridge
// STARTUP FUNCTION: run when bridge starts, used for setup
if(BridgeTalk.appName == 'bridge'){ 
	try{
		
		if(Folder.fs == "Windows"){
			if( xmpLib == undefined ) var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.dll"; // Load the XMP Script library

			TS_SCRIPTS_DIR = Folder.userData; // %APPDATA%
			TS_SCRIPTS_DIR.changePath("./Adobe/Bridge 2025/Startup Scripts/");
		} 
		else {
			if( xmpLib == undefined ) var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.framework"; // Load the XMP Script library

			TS_SCRIPTS_DIR = Folder.userData; // ~/Library/Application Support
			TS_SCRIPTS_DIR.changePath("./Adobe/Bridge 2025/Startup Scripts/");
		}
	
		var libfile = new File( pathToLib );
		var xmpLib = new ExternalObject("lib:" + pathToLib );

		app.addLegalNotice("TextSubstitutions", "View contributors at https://github.com/9yz/bridge-scripts");

		var tsMenuRun 			= MenuElement.create('command', 'Text Substitutions...', 'at the end of Tools');
		var tsMenuRunCont 		= MenuElement.create('command', 'Text Substitutions...', 'after Thumbnail/Open'); 

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
			{"activeId":38,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"tsPrefsPanelObject","windowType":"Window","creationProps":{"su1PanelCoordinates":true,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Dialog","preferredSize":[400,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Panel","parentId":7,"style":{"enabled":true,"varName":"panelDelimiter","creationProps":{"borderStyle":"black","su1PanelCoordinates":false},"text":"Code Delimiter","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-2":{"id":2,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleBrackets","text":"[Single Brackets]","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-3":{"id":3,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleBrackets","text":"[[Double Brackets]] ","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-4":{"id":4,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleCurly","text":"{Curly Brackets}","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-5":{"id":5,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleCurly","text":"{{Double Curlies}}","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-6":{"id":6,"type":"Panel","parentId":7,"style":{"enabled":true,"varName":"panelDateField","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Get Creation Date From","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-7":{"id":7,"type":"Group","parentId":17,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-8":{"id":8,"type":"RadioButton","parentId":6,"style":{"enabled":true,"varName":"rbUseEXIFDate","text":"EXIF (reccomended)","preferredSize":[0,0],"alignment":null,"helpTip":"Get date from EXIF. This field is updated by Bridge's \"Edit Capture Time\" feature."}},"item-9":{"id":9,"type":"RadioButton","parentId":6,"style":{"enabled":true,"varName":"rbUseIPTCDate","text":"IPTC","preferredSize":[0,0],"alignment":null,"helpTip":"Get date from IPTC. This field is NOT updated by Bridge's \"Edit Capture Time\" feature."}},"item-10":{"id":10,"type":"StaticText","parentId":6,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"Select which field time-based substitutions like tDate and tTime should get the Creation Date from. ","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbSingleEquals","text":"=Single Equals=","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"RadioButton","parentId":1,"style":{"enabled":true,"varName":"rbDoubleEquals","text":"==Double Equals==","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"StaticText","parentId":6,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"tEXIFTime and tIPTCTime will always get the ISO 8601 timestamp from their respective fields.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-14":{"id":14,"type":"Divider","parentId":0,"style":{"enabled":true,"varName":null}},"item-15":{"id":15,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"View documentation and contribute to Text Substitutions at https://github.com/9yz/bridge-scripts","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-16":{"id":16,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"Set the delimiter used to identify substitutions. Don't forget to update  any custom recursive substitutions when changing this setting!","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-17":{"id":17,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-18":{"id":18,"type":"Panel","parentId":19,"style":{"enabled":true,"varName":"panelSepTags","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Separate Substitutions in Keywords","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-19":{"id":19,"type":"Group","parentId":17,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-20":{"id":20,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"When set, substitutions used in the Keywords field containing commas will be split into multiple keywords.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-21":{"id":21,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":null,"creationProps":{},"softWrap":true,"text":"For example, if the substitution [[foods]] is set  to be substituted with \"apples,  crackers\" and this setting is enabled, 2 tags will be created - one  each for \"apples\" and \"crackers\". Otherwise, only one tag will be created","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-22":{"id":22,"type":"Checkbox","parentId":18,"style":{"enabled":true,"varName":"rbSepTags","text":"Separate Substitutions in Keywords","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-23":{"id":23,"type":"Panel","parentId":19,"style":{"enabled":true,"varName":"panelCustomSubs","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Custom Substitutions","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":"fill"}},"item-24":{"id":24,"type":"StaticText","parentId":23,"style":{"enabled":true,"varName":"txtFilesLoaded","creationProps":{},"softWrap":false,"text":"x custom substitution files loaded.\nx custom substitution rules loaded.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-25":{"id":25,"type":"Button","parentId":23,"style":{"enabled":true,"varName":"butReloadCustSubs","text":"Reload Custom Substitutions","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":"This will purge all custom substitutions from memory and reload them from disk."}},"item-26":{"id":26,"type":"StaticText","parentId":23,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"All .txt files beginning with \"ts_\" in the Startup Scripts directory or  /substitutions/ subdirectory will be loaded.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-27":{"id":27,"type":"Panel","parentId":19,"style":{"enabled":true,"varName":"panelMaxRecursions","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Max Substitutions","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":"fill"}},"item-28":{"id":28,"type":"StaticText","parentId":27,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Maximum number of substitutions in a single metadata field before an error occurs. Lower numbers could cause problems when many recursive substitutions are used. ","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-29":{"id":29,"type":"EditText","parentId":27,"style":{"enabled":true,"varName":"edMaxRecursions","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":true,"enterKeySignalsOnChange":false},"softWrap":false,"text":"100","justify":"left","preferredSize":[40,0],"alignment":null,"helpTip":null}},"item-30":{"id":30,"type":"Panel","parentId":31,"style":{"enabled":true,"varName":"panelPropertyCategories","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Fields to Analyze","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-31":{"id":31,"type":"Group","parentId":17,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-32":{"id":32,"type":"StaticText","parentId":30,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Only these fields will be checked for custom substitutions when the program is run. Reducing the number of fields analyzed will improve performance. Only fields in IPTC Core (not IPTC Extension) are analyzed.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-34":{"id":34,"type":"Checkbox","parentId":30,"style":{"enabled":true,"varName":"cbPropCatCore","text":"Core","preferredSize":[0,0],"alignment":null,"helpTip":"Description, keywords, alt-text, extended description,\\nheadline, title, sublocation, city, state, country."}},"item-35":{"id":35,"type":"Checkbox","parentId":30,"style":{"enabled":true,"varName":"cbPropCatCredit","text":"Credit","preferredSize":[0,0],"alignment":null,"helpTip":"Creator contact info, credit, source,\\ndescription writer, rights, and usage terms."}},"item-36":{"id":36,"type":"Checkbox","parentId":30,"style":{"enabled":true,"varName":"cbPropCatMisc","text":"Misc","preferredSize":[0,0],"alignment":null,"helpTip":"IPTC Subject & Scene codes, intellectual genre, \\njob identifier, instructions."}},"item-37":{"id":37,"type":"StaticText","parentId":30,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"(hover for details)","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-38":{"id":38,"type":"Checkbox","parentId":30,"style":{"enabled":true,"varName":"cbPropCatFilename","text":"Filename","preferredSize":[0,0],"alignment":null,"helpTip":"The file's filename. Use caution\\nwhen changing file extensions."}}},"order":[0,17,7,1,16,2,3,4,5,11,12,6,10,13,8,9,19,18,20,21,22,23,26,25,24,27,28,29,31,30,32,38,34,35,36,37,14,15],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}

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
				statictext1.text = "Set the delimiter used to identify substitutions. Don't forget to update any recursive custom substitutions when changing this setting!"; 
			 

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
					tsInitalizePrefsDelimiter();
					butReloadCustSubs.onClick(); // reload cust subs
				}
				rbDoubleBrackets.onClick = function(){
					app.preferences.tsDelimiter = 1;
					tsInitalizePrefsDelimiter();
					butReloadCustSubs.onClick(); 
				}
				rbSingleCurly.onClick = function(){
					app.preferences.tsDelimiter = 2;
					tsInitalizePrefsDelimiter();
					butReloadCustSubs.onClick(); 
				}
				rbDoubleCurly.onClick = function(){
					app.preferences.tsDelimiter = 3;
					tsInitalizePrefsDelimiter();
					butReloadCustSubs.onClick(); 
				}
				rbSingleEquals.onClick = function(){
					app.preferences.tsDelimiter = 4;
					tsInitalizePrefsDelimiter();
					butReloadCustSubs.onClick(); 
				}
				rbDoubleEquals.onClick = function(){
					app.preferences.tsDelimiter = 5;
					tsInitalizePrefsDelimiter();
					butReloadCustSubs.onClick(); 
				}

			var statictext2 = panelDelimiter.add("statictext", undefined, undefined, {name: "statictext1", multiline: true}); 
				statictext2.text = "Updating this setting will also reload custom substitutions."; 


			
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
				group3.orientation = "column"; 
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
				statictext5.text = "For example, if the substitution [[foods]] is set to be substituted with \u0022apples,crackers\u0022 and this setting is enabled, 2 tags will be created - one each for \u0022apples\u0022 and \u0022crackers\u0022. Otherwise, only one tag will be created."; 
				statictext5.alignment = ["fill","top"]; 

			var cbSepTags = panelSepTags.add("checkbox", undefined, undefined, {name: "rbSepTags"}); 
				cbSepTags.text = "Separate Substitutions in Keywords"; 

			if(app.preferences.tsSeparateTags){ // initalize value
				cbSepTags.value = true;
			}

			cbSepTags.onClick = function(){ // update values on click
				app.preferences.tsSeparateTags = cbSepTags.value;
			}

			// PANELCUSTOMSUBS
			// ===============
			var panelCustomSubs = group3.add("panel", undefined, undefined, {name: "panelCustomSubs"}); 
				panelCustomSubs.text = "Custom Substitutions"; 
				panelCustomSubs.orientation = "column"; 
				panelCustomSubs.alignChildren = ["left","top"]; 
				panelCustomSubs.spacing = 10; 
				panelCustomSubs.margins = 10; 
				panelCustomSubs.alignment = ["fill","top"]; 

			var statictext6 = panelCustomSubs.add("statictext", undefined, undefined, {name: "statictext6", multiline: true}); 
				statictext6.text = "All .txt files beginning with \u0022ts_\u0022 in the Startup Scripts directory or /substitutions/ subdirectory will be loaded. On script run, substitutions are reloaded if changes were made to previously loaded files."; 
				statictext6.alignment = ["fill","top"]; 

			var butReloadCustSubs = panelCustomSubs.add("button", undefined, undefined, {name: "butReloadCustSubs"}); 
				butReloadCustSubs.helpTip = "This will purge all custom substitutions from memory and reload them from disk."; 
				butReloadCustSubs.text = "Reload Custom Substitutions"; 

			var txtFilesLoaded = panelCustomSubs.add("statictext", undefined, undefined, {name: "txtFilesLoaded", multiline: true}); 
				txtFilesLoaded.text = TS_LOADED_CUSTOM_FILES.length + " custom substitution files loaded.\n" + TS_NUM_CUSTOM_RULES_LOADED + " custom substitution rules loaded."
				txtFilesLoaded.alignment = ["fill","top"]; 


			butReloadCustSubs.onClick = function(){
				txtFilesLoaded.text = "Loading...";
				tsBuildCustomSubTables();
				txtFilesLoaded.text = TS_LOADED_CUSTOM_FILES.length + " custom substitution files loaded.\n" + TS_NUM_CUSTOM_RULES_LOADED + " custom substitution rules loaded.";
			}


			// GROUP4
			// ======
			var group4 = group1.add("group", undefined, {name: "group4"}); 
			group4.orientation = "column"; 
			group4.alignChildren = ["left","top"]; 
			group4.spacing = 10; 
			group4.margins = 0; 

			// PANELMAXRECURSIONS
			// ==================
			var panelMaxRecursions = group4.add("panel", undefined, undefined, {name: "panelMaxRecursions"}); 
				panelMaxRecursions.text = "Max Substitutions"; 
				panelMaxRecursions.orientation = "column"; 
				panelMaxRecursions.alignChildren = ["left","top"]; 
				panelMaxRecursions.spacing = 10; 
				panelMaxRecursions.margins = 10; 
				panelMaxRecursions.alignment = ["fill","top"]; 

			var statictext7 = panelMaxRecursions.add("statictext", undefined, undefined, {name: "statictext7", multiline: true}); 
				statictext7.text = "Maximum number of substitutions in a single metadata field before an error occurs. Prevents runaway recursion."; 

			var edMaxRecursions = panelMaxRecursions.add('edittext {properties: {name: "edMaxRecursions"}}'); 
				edMaxRecursions.text = app.preferences.tsRecursionLimit; 
				edMaxRecursions.preferredSize.width = 40; 

			edMaxRecursions.onChange = function(){
				if(!isNaN(parseInt(edMaxRecursions.text)))
					app.preferences.tsRecursionLimit = parseInt(edMaxRecursions.text);
				else{
					app.preferences.tsRecursionLimit = 500
					edMaxRecursions.text = 500;
				}
			}

			// PANELPROPERTYCATEGORIES
			// =======================
			var panelPropertyCategories = group4.add("panel", undefined, undefined, {name: "panelPropertyCategories"}); 
			panelPropertyCategories.text = "Fields to Analyze"; 
			panelPropertyCategories.orientation = "column"; 
			panelPropertyCategories.alignChildren = ["left","top"]; 
			panelPropertyCategories.spacing = 10; 
			panelPropertyCategories.margins = 10; 

			var statictext8 = panelPropertyCategories.add("statictext", undefined, undefined, {name: "statictext8", multiline: true}); 
    		statictext8.text = "Only these fields will be checked for custom substitutions when the program is run. Reducing the number of fields analyzed will improve performance. Only fields in IPTC Core (not IPTC Extension) are analyzed."; 

			var cbPropCatCore = panelPropertyCategories.add("checkbox", undefined, undefined, {name: "cbPropCatCore"}); 
				cbPropCatCore.helpTip = "Description, keywords, alt-text, extended description,\nheadline, title, sublocation, city, state, country, and country code."; 
				cbPropCatCore.text = "Core"; 
			
			var cbPropCatCredit = panelPropertyCategories.add("checkbox", undefined, undefined, {name: "cbPropCatCredit"}); 
				cbPropCatCredit.helpTip = "Creator contact info, credit, source,\ndescription writer, rights, and usage terms."; 
				cbPropCatCredit.text = "Credit"; 
			
			var cbPropCatMisc = panelPropertyCategories.add("checkbox", undefined, undefined, {name: "cbPropCatMisc"}); 
				cbPropCatMisc.helpTip = "IPTC subject & scene codes, intellectual genre,\njob identifier, and instructions."; 
				cbPropCatMisc.text = "Misc"; 

			var cbPropCatFilename = panelPropertyCategories.add("checkbox", undefined, undefined, {name: "cbPropCatFilename"}); 
				cbPropCatFilename.helpTip = "The file's filename. Use caution\nwhen changing file extensions."; 
				cbPropCatFilename.text = "Filename"; 

				// initalize delimiter values
				if(app.preferences.tsPropertyCategories & TS_PROPERTY_CATEGORIES.filename){
					cbPropCatFilename.value = true;
				}
				if(app.preferences.tsPropertyCategories & TS_PROPERTY_CATEGORIES.core){
					cbPropCatCore.value = true;
				}
				if(app.preferences.tsPropertyCategories & TS_PROPERTY_CATEGORIES.credit){
					cbPropCatCredit.value = true;
				}
				if(app.preferences.tsPropertyCategories & TS_PROPERTY_CATEGORIES.misc){
					cbPropCatMisc.value = true;
				}

				// update values on select
				cbPropCatFilename.onClick = function(){
					if(cbPropCatFilename.value) app.preferences.tsPropertyCategories |= TS_PROPERTY_CATEGORIES.filename;
					else app.preferences.tsPropertyCategories ^= TS_PROPERTY_CATEGORIES.filename;
				}
				cbPropCatCore.onClick = function(){
					if(cbPropCatCore.value) app.preferences.tsPropertyCategories |= TS_PROPERTY_CATEGORIES.core;
					else app.preferences.tsPropertyCategories ^= TS_PROPERTY_CATEGORIES.core;
				}
				cbPropCatCredit.onClick = function(){
					if(cbPropCatCredit.value) app.preferences.tsPropertyCategories |= TS_PROPERTY_CATEGORIES.credit;
					else app.preferences.tsPropertyCategories ^= TS_PROPERTY_CATEGORIES.credit;
				}
				cbPropCatMisc.onClick = function(){
					if(cbPropCatMisc.value) app.preferences.tsPropertyCategories |= TS_PROPERTY_CATEGORIES.misc;
					else app.preferences.tsPropertyCategories ^= TS_PROPERTY_CATEGORIES.misc;
				}


			
			var statictext9 = panelPropertyCategories.add("statictext", undefined, undefined, {name: "statictext9"}); 
				statictext9.text = "(hover for details)"; 
			

			
			// TSPREFSPANELOBJECT
			// ==================
			var divider1 = tsPrefsPanelObject.add("panel", undefined, undefined, {name: "divider1"}); 
				divider1.alignment = "fill"; 
			
			var statictext3 = tsPrefsPanelObject.add("group", undefined , {name: "statictext3"}); 
				statictext3.getText = function() { var t=[]; for ( var n=0; n<statictext3.children.length; n++ ) { var text = statictext3.children[n].text || ''; if ( text === '' ) text = ' '; t.push( text ); } return t.join('\n'); }; 
				statictext3.orientation = "column"; 
				statictext3.alignChildren = ["left","center"]; 
				statictext3.spacing = 0; 
			
				// uses a newline or the descender in the 'g' in github will get cut off 
				statictext3.add("statictext", undefined, "Version " + TS_VERSION + ".            Last operation on " + TS_LAST_OP_FILES + " files completed in " + TS_LAST_OP_TIMER.toFixed(2) + "s.            See docs and contribute at github.com/9yz/bridge-scripts\n"); 
				// statictext3.add("statictext", undefined, "View documentation and contribute to Text Substitutions at https://github.com/9yz/bridge-scripts"); 
		
			

			tsPrefsPanelObject.layout.layout(true); // not really sure what this does but without it nothing works so ¯\_(ツ)_/¯ 
		}
		
		return { handled: false };
	};

	// Register the event handler
	app.eventHandlers.push( { handler: tsPrefHandler } );
	
	
	return true;
}

// reset prefs to defaults
// if allPrefs = true, all prefs are set (optional)
function tsSetDefaultPrefs(allPrefs){
	if(!allPrefs) allPrefs = false; // set to false if not specified
	if(allPrefs || app.preferences.tsPrefsVersion < 100100){
		app.preferences.tsPropertyCategories = TS_PROPERTY_CATEGORIES.core;
	}
	if(allPrefs || app.preferences.tsPrefsVersion < 100001){ 
		app.preferences.tsDelimiter = 1; // int representing the `delimiters` array index of the delimiter to use
		app.preferences.tsDateField = 0; // 0 = EXIF, 1 = IPTC
		app.preferences.tsSeparateTags = 0; // 1 = seperate tags
		app.preferences.tsRecursionLimit = 500; // max number of recursions before error
	}
	app.preferences.tsPrefsVersion = TS_VERSION_PREFS;
	app.preferences.tsPrefsSet = true;
}

// set vars based on prefs
function tsInitalizePrefs(){
	// set default prefs if they havent been set
	if(app.preferences.tsPrefsSet != true) tsSetDefaultPrefs(true); // first run 
	else if(app.preferences.tsPrefsVersion < TS_VERSION_PREFS) tsSetDefaultPrefs(); // upgrading

	tsInitalizePrefsDelimiter();
}

// set delimiter prefs based on prefs
function tsInitalizePrefsDelimiter(){
	switch(app.preferences.tsDelimiter) {
		case 0:
			TS_START_DELIM = 	TS_DELIMITERS[0][0];
			TS_END_DELIM = 		TS_DELIMITERS[0][1];
			TS_DELIM_SIZE =		TS_DELIMITERS[0][2];
			break;
		case 1:
			TS_START_DELIM = 	TS_DELIMITERS[1][0];
			TS_END_DELIM = 		TS_DELIMITERS[1][1];
			TS_DELIM_SIZE =		TS_DELIMITERS[1][2];
			break;
		case 2:
			TS_START_DELIM = 	TS_DELIMITERS[2][0];
			TS_END_DELIM = 		TS_DELIMITERS[2][1];
			TS_DELIM_SIZE =		TS_DELIMITERS[2][2];
			break;
		case 3:
			TS_START_DELIM = 	TS_DELIMITERS[3][0];
			TS_END_DELIM = 		TS_DELIMITERS[3][1];
			TS_DELIM_SIZE =		TS_DELIMITERS[3][2];
			break;
		case 4:
			TS_START_DELIM = 	TS_DELIMITERS[4][0];
			TS_END_DELIM = 		TS_DELIMITERS[4][1];
			TS_DELIM_SIZE =		TS_DELIMITERS[4][2];
			break;
		case 5:
			TS_START_DELIM = 	TS_DELIMITERS[5][0];
			TS_END_DELIM = 		TS_DELIMITERS[5][1];
			TS_DELIM_SIZE =		TS_DELIMITERS[5][2];
			break;
	}
}


// Build builtin and custom substitution tables
function tsBuildSubstitutionTables(){
	const builtinTableSize = 223; // size we want for the hashtable - should be a prime at least 2x the size of builtinCommands.
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
		{ target: "tdayofweek",			replacement: tsTDateTakenDayPretty			},
		{ target: "tdow",				replacement: tsTDateTakenDayPretty			},
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
		{ target: "tdayhalf",			replacement: tsTDayHalf						},
		{ target: "tampm",				replacement: tsTDayHalf						},
		{ target: "ttod",				replacement: tsTTimeOfDay					},
		{ target: "ttimeofday",			replacement: tsTTimeOfDay					},
		{ target: "thr",				replacement: tsTHour						},
		{ target: "thour",				replacement: tsTHour						},
		{ target: "thour12",			replacement: tsTHour12						},
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
		{ target: "mextension",			replacement: tsMExtension					},
		{ target: "mfiletype",			replacement: tsMExtension					},
		{ target: "mtitle",				replacement: tsMTitle						},
		{ target: "mheadline",			replacement: tsMHeadline					},
		{ target: "mcredit",			replacement: tsMCreditLine					},
		{ target: "mcreditline",		replacement: tsMCreditLine					},
		{ target: "msublocation",		replacement: tsMSublocation					},
		{ target: "mlocation",			replacement: tsMLocation					},
		{ target: "mcity",				replacement: tsMCity						},
		{ target: "mstate",				replacement: tsMState						},
		{ target: "mregion",			replacement: tsMState						},
		{ target: "mprovince",			replacement: tsMState						},
		{ target: "mcountry",			replacement: tsMCountry						}, 
		{ target: "mrating",			replacement: tsMRating						}, 
		{ target: "mratingpretty",		replacement: tsMRatingPretty				}, 
		{ target: "mratingp",			replacement: tsMRatingPretty				},
		{ target: "mlabel",				replacement: tsMLabel						},
		{ target: "msource",			replacement: tsMSource						},
		{ target: "mcaptionwriter",		replacement: tsMCaptionWriter				},
		{ target: "mdescwriter",		replacement: tsMCaptionWriter				},
		{ target: "mcopyrightnotice",	replacement: tsMCopyrightNotice				},
		{ target: "mcopyright",			replacement: tsMCopyrightNotice				},
		{ target: "mrightsusageterms",	replacement: tsMUsageTerms					},
		{ target: "musageterms",		replacement: tsMUsageTerms					},
		{ target: "mjobidentifier",		replacement: tsMJobIdentifier				},
		{ target: "mjobident",			replacement: tsMJobIdentifier				},
		{ target: "mjob",				replacement: tsMJobIdentifier				},
		{ target: "minstructions",		replacement: tsMInstructions				},
		{ target: "mcreator",			replacement: tsMCreator						},
		{ target: "mcreatorjob",		replacement: tsMCreatorJob					},
		{ target: "mcreatoraddress",	replacement: tsMCreatorAddress				},
		{ target: "mcreatorcity",		replacement: tsMCreatorCity					},
		{ target: "mcreatorregion",		replacement: tsMCreatorState				},
		{ target: "mcreatorprovince",	replacement: tsMCreatorState				},
		{ target: "mcreatorstate",		replacement: tsMCreatorState				},
		{ target: "mcreatorcountry",	replacement: tsMCreatorCountry				},
		{ target: "mcreatorzip",		replacement: tsMCreatorPostalCode			},
		{ target: "mcreatorpostal",		replacement: tsMCreatorPostalCode			},
		{ target: "mcreatorphone",		replacement: tsMCreatorPhone				},
		{ target: "mcreatoremail",		replacement: tsMCreatorEmail				},
		{ target: "mcreatorwebsite",	replacement: tsMCreatorWebsite				},
		

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
		{ target: "ccomp",				replacement: tsCExposureComp				},

		// special
		{ target: "",					replacement: tsBlank						},

	]

	const builtinFunctionsTableSize = 139; // size we want for the hashtable - should be a prime at least 2x the size of the associated table.
	const builtinFunctions = [	// map of built-in functions
		// math ops
		{ target: "fadd",				replacement: tsFAdd							},
		{ target: "f+",					replacement: tsFAdd							},
		{ target: "fsub",				replacement: tsFSub							},
		{ target: "f-",					replacement: tsFSub							},
		{ target: "fmul",				replacement: tsFMul							},
		{ target: "f*",					replacement: tsFMul							},
		{ target: "fdiv",				replacement: tsFDiv							},
		{ target: "f/",					replacement: tsFDiv							},
		{ target: "fmod",				replacement: tsFMod							},
		{ target: "f%",					replacement: tsFMod							},
		{ target: "ffloor",				replacement: tsFFloor						},
		{ target: "fceil",				replacement: tsFCeil						},
		{ target: "fround",				replacement: tsFRound						},

		// string ops
		{ target: "fprefix",			replacement: tsFPrefix						},
		{ target: "fpfx",				replacement: tsFPrefix						},
		{ target: "fsuffix",			replacement: tsFSuffix						},
		{ target: "fsfx",				replacement: tsFSuffix						},
		{ target: "fsubstring",			replacement: tsFSubstring					},
		{ target: "fsubstr",			replacement: tsFSubstring					},
		{ target: "flength",			replacement: tsFLength						},
		{ target: "flen",				replacement: tsFLength						},
		{ target: "fgetindex",			replacement: tsFGetIndex					},
		{ target: "findex",				replacement: tsFGetIndex					},
		{ target: "findexof",			replacement: tsFGetIndex					},
		{ target: "fgetlastindex",		replacement: tsFGetLastIndex				},
		{ target: "flastindex",			replacement: tsFGetLastIndex				},
		{ target: "flastindexof",		replacement: tsFGetLastIndex				},
		{ target: "ffindreplace",		replacement: tsFFindReplace					},
		{ target: "freplace",			replacement: tsFFindReplace					},
		{ target: "freplace",			replacement: tsFFindReplace					},
		
		// logic
		{ target: "fequals",			replacement: tsFEquals						},
		{ target: "feq",				replacement: tsFEquals						},
		{ target: "f=",					replacement: tsFEquals						},
		{ target: "fanyequals",			replacement: tsFAnyEquals					},
		{ target: "fanyeq",				replacement: tsFAnyEquals					},
		{ target: "fnotequals",			replacement: tsFNotEquals					},
		{ target: "fneq",				replacement: tsFNotEquals					},
		{ target: "f!=",				replacement: tsFNotEquals					},
		{ target: "fgreaterthan",		replacement: tsFGreaterThan					},
		{ target: "fgt",				replacement: tsFGreaterThan					},
		{ target: "f>",					replacement: tsFGreaterThan					},
		{ target: "flessthan",			replacement: tsFLessThan					},
		{ target: "flt",				replacement: tsFLessThan					},
		{ target: "f<",					replacement: tsFLessThan					},
		{ target: "fgreaterequal",		replacement: tsFGreaterEqual				},
		{ target: "fgeq",				replacement: tsFGreaterEqual				},
		{ target: "f>=",				replacement: tsFGreaterEqual				},
		{ target: "f=>",				replacement: tsFGreaterEqual				},
		{ target: "flessequal",			replacement: tsFLessEqual					},
		{ target: "fleq",				replacement: tsFLessEqual					},
		{ target: "f<=",				replacement: tsFLessEqual					},
		{ target: "f=<",				replacement: tsFLessEqual					},
		{ target: "for",				replacement: tsFOr							},
		{ target: "f||",				replacement: tsFOr							},
		{ target: "fand",				replacement: tsFAnd							},
		{ target: "f&&",				replacement: tsFAnd							},
		{ target: "fnot",				replacement: tsFNot							},
		{ target: "f!",					replacement: tsFNot							},
		
		// conditionals
		{ target: "fbranch",			replacement: tsFBranch						},
		{ target: "fbch",				replacement: tsFBranch						},
		{ target: "fsubstexists",		replacement: tsFSubstitutionExists			},
		{ target: "fsubexists",			replacement: tsFSubstitutionExists			},
		{ target: "fexists",			replacement: tsFSubstitutionExists			},
		{ target: "fsex",				replacement: tsFSubstitutionExists			},
		{ target: "fsafeexecute",		replacement: tsFSafeExecute					},
		{ target: "fsafe",				replacement: tsFSafeExecute					},
		
	]

	TS_SUB_TABLE_BUILTIN = tsFillSubTables(builtinCommands, builtinTableSize);
	TS_SUB_TABLE_BUILTIN_FUNCTIONS = tsFillSubTables(builtinFunctions, builtinFunctionsTableSize);

	tsBuildCustomSubTables();
	
}


// Finds custom substitution files and builds them into TS_SUB_TABLE_USER
function tsBuildCustomSubTables(){
	const searchpattern = "ts_*.txt";
	var files;
	var dir = new Folder(TS_SCRIPTS_DIR.fsName);
	var failFiles = [];
	var customSubs = [];
	TS_NUM_CUSTOM_RULES_LOADED = 0;
	TS_LOADED_CUSTOM_FILES = [];

	files = dir.getFiles(searchpattern); // returns an array of files matching the pattern
	for(i in files){
		if(!tsParseTSV(files[i], customSubs)) 
			failFiles.push(files[i].name);
		else{
			var newfile = { path: files[i].absoluteURI, modified: files[i].modified };
			TS_LOADED_CUSTOM_FILES.push(newfile);
		}
	}
	dir.changePath("./substitutions/") // check subs folder
	files = dir.getFiles(searchpattern);
	for(i in files){
		if(!tsParseTSV(files[i], customSubs)) 
			failFiles.push(files[i].name);
		else{
			var newfile = { path: files[i].absoluteURI, modified: files[i].modified };
			TS_LOADED_CUSTOM_FILES.push(newfile);
		}
	}
	if(failFiles.length > 0) alert("Text Substitutions Warning:\nThese files were empty or could not be opened:\n\n" + failFiles);

	TS_SUB_TABLE_USER = tsFillSubTables(customSubs);
}


// opens and reads from a File object, parses the tsv into object as a series of target/replacement pairs
// returns false if the file cant be opened or is empty
function tsParseTSV(inputFile, output){
	const sep = "\t";

	inputFile.open("r"); // r = read mode
	if(inputFile.eof){ // empty file or couldnt open
		inputFile.close();
		return false; 
	}
	
	for (var i = 1; !inputFile.eof; i++) {
		var line = inputFile.readln(); // grab a line
		if( line.length < 2 || (line.length >= 2 && line[0] == "/" && line[1] == "/") ){  // line is blank or commented out - skip it
			continue;
		}
		
		var obj = { target: "", replacement: [], recursions: 0 };
		if(line.indexOf(TS_END_DELIM) != -1) obj.recursions = 1; // might we need to recurse on this?

		while(line[line.length-1] == "\\"){ // check if line ends with backslash, read a new line to append if it does
			while(!inputFile.eof){
				var nl = inputFile.readln();
				if(nl.length < 2){
					continue; // blank, discard
				}

				var start = 0;
				while(nl[start] && nl[start] == "\t"){
					start++; // skip leading tabs
				}
				if(!nl[start]|| (nl.length >= 2 && nl[start] == "/" && nl[start+1] == "/")){
					continue; // only contains tabs or commented out, discard
				}

				line = line.substring(0, line.length-1); // chop off that backslash
				line += nl.substring(start); // trim leading tabs, append to existing string
				break;
			}
			if(inputFile.eof && line[line.length-1] == "\\"){ // case: the last valid line ends with a backslash - gotta make sure we trim it
				line = line.substring(0, line.length-1);
			}
		}

		line = line.split(sep); // split at tabs
		if(line[0] == "" && line[1] == ""){ // blank line, ignore;
			continue;
		}

		obj.target = line[0]; // add the first one as the target 
		for(var j = 1; j < line.length; j++){ // and the rest as replacements
			if(line[j].length > 0) obj.replacement.push(line[j]);
		}
		if(obj.replacement.length == 0) obj.replacement.push(""); // if the user only specified one param they want it to be blank

		TS_NUM_CUSTOM_RULES_LOADED++;
		output.push(obj);
	}

	inputFile.close(); // gotta be polite
	return true;

}

// returns a substitution table with the contents of substArray. Optionally sets substTable size to tableSize, if specified.
function tsFillSubTables(substArray, tableSize){
	if(!tableSize){ // if not specified, choose one.

		// prime nums, somewhat evenly spaced for use as user table size for better modulo
		const primes = [53, 101, 211, 307, 401, 601, 809, 1009, 1201, 1399, 1601, 1901, 2399, 2801, 3203, 6397, 12007, 24001, 48017, 96001]; 	
		var i = 0;
		
		// in the ungodly case someone has > 48,000 substitutions, just pick something that's maybe a prime number
		if(substArray.length*2 > primes[primes.length-1]){
			alert("Text Substitutions is impressed!\nIf you're seeing this, you have more than 48,000 substitutions which is way more than I ever expected anyone would use. Don't worry, I added a fallback to ensure the program still works, it will just be slightly less efficent.\n\nAlso, please leave a github issue or email me (9yz [at] 9yz.dev) so I can learn what the fuck you're doing that requires 48,000+ substitutions.");
			tableSize = (substArray.length*2)-1; 
		}
		else{
			for(i in primes){
				if(substArray.length*2 < primes[i]){
					tableSize = primes[i];
					break; // find the first prime larger than the number of custom subs *2
				} 
			}
		}
	}

	var substTable = new SubstitutionTable(tableSize);
	for(var i in substArray){ // move items to the table
		substTable.insert(substArray[i]);
	}

	return substTable;

}

// Checks if any of the files in TS_LOADED_CUSTOM_FILES have been modified since their stored date; calls tsBuildCustomSubTables(true) if so.
function tsHotloadCustomSubTables(){
	if(!TS_LOADED_CUSTOM_FILES) return;

	for(var i = 0; i < TS_LOADED_CUSTOM_FILES.length; i++){
		var f = new File(TS_LOADED_CUSTOM_FILES[i].path);
		if(f.modified > TS_LOADED_CUSTOM_FILES[i].modified){ // if one of the files was modified after the date we stored, we need to rebuild the sub tables.
			tsBuildCustomSubTables();

			/* var failFiles = [];
			var customSubs = [];
			TS_NUM_CUSTOM_RULES_LOADED = 0;
			var newLoadedFilesList = [];

			for(var j = 0; j < TS_LOADED_CUSTOM_FILES.length; j++){
				var file = new File(TS_LOADED_CUSTOM_FILES[j].path);
				if(!tsParseTSV(file, customSubs)) 
					failFiles.push(file.name);
				else{
					var newfile = { path: file.absoluteURI, modified: file.modified };
					newLoadedFilesList.push(newfile);
				}
			}

			if(failFiles.length > 0) alert("Text Substitutions Warning:\nThese files were empty or could not be opened:\n\n" + failFiles);

			TS_LOADED_CUSTOM_FILES = newLoadedFilesList;
			tsFillSubTables(TS_SUB_TABLE_USER, customSubs); */

		}
	}
}


// Run when the script is selected. Gets user input, selects properties to edit, and passes them to tsDoSubstitutions()
function tsRun(){
	const propertyList = [ 
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_PHOTOSHOP, 	key: "City", 					},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_PHOTOSHOP, 	key: "State", 					},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_PHOTOSHOP, 	key: "Country", 				},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_IPTC_CORE, 	key: 'CountryCode',				},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_IPTC_CORE, 	key: "Location", 				},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_DC,			key: "title", 					},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_PHOTOSHOP, 	key: "Headline", 				},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_IPTC_CORE, 	key: "AltTextAccessibility",	},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_IPTC_CORE, 	key: "ExtDescrAccessibility",	},
		{ type: "array",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_DC,			key: "subject", 				}, // keywords
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.core,		namespace: XMPConst.NS_DC,			key: "description", 			},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.credit,	namespace: XMPConst.NS_PHOTOSHOP,	key: "AuthorsPosition",			},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.credit,	namespace: XMPConst.NS_PHOTOSHOP,	key: "Credit",					},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.credit,	namespace: XMPConst.NS_PHOTOSHOP,	key: "Source",					},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.credit,	namespace: XMPConst.NS_PHOTOSHOP,	key: "CaptionWriter",			},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.credit,	namespace: XMPConst.NS_DC,			key: "creator",					},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.credit,	namespace: XMPConst.NS_DC,			key: "rights",					},
		{ type: "localized",category: TS_PROPERTY_CATEGORIES.credit,	namespace: XMPConst.NS_XMP_RIGHTS,	key: "UsageTerms",				},	// because UsageTerms just wants to be special and refuses to behave like other tags that USE LOCALIZATION but don't FREAK THE FUCK OUT when you dont explicitly insert localized text
		{ type: "complex",	category: TS_PROPERTY_CATEGORIES.credit,	schemaNS: XMPConst.NS_IPTC_CORE,	structName: "CreatorContactInfo", 	fieldNS: XMPConst.NS_IPTC_CORE, fieldName: "CiEmailWork"	},
		{ type: "complex",	category: TS_PROPERTY_CATEGORIES.credit,	schemaNS: XMPConst.NS_IPTC_CORE,	structName: "CreatorContactInfo", 	fieldNS: XMPConst.NS_IPTC_CORE, fieldName: "CiUrlWork"		},
		{ type: "complex",	category: TS_PROPERTY_CATEGORIES.credit,	schemaNS: XMPConst.NS_IPTC_CORE,	structName: "CreatorContactInfo", 	fieldNS: XMPConst.NS_IPTC_CORE, fieldName: "CiAdrExtadr"	},
		{ type: "complex",	category: TS_PROPERTY_CATEGORIES.credit,	schemaNS: XMPConst.NS_IPTC_CORE,	structName: "CreatorContactInfo", 	fieldNS: XMPConst.NS_IPTC_CORE, fieldName: "CiAdrCity"		},
		{ type: "complex",	category: TS_PROPERTY_CATEGORIES.credit,	schemaNS: XMPConst.NS_IPTC_CORE,	structName: "CreatorContactInfo", 	fieldNS: XMPConst.NS_IPTC_CORE, fieldName: "CiAdrRegion"	},
		{ type: "complex",	category: TS_PROPERTY_CATEGORIES.credit,	schemaNS: XMPConst.NS_IPTC_CORE,	structName: "CreatorContactInfo", 	fieldNS: XMPConst.NS_IPTC_CORE, fieldName: "CiAdrPcode"		},
		{ type: "complex",	category: TS_PROPERTY_CATEGORIES.credit,	schemaNS: XMPConst.NS_IPTC_CORE,	structName: "CreatorContactInfo", 	fieldNS: XMPConst.NS_IPTC_CORE, fieldName: "CiAdrCtry"		},
		{ type: "complex",	category: TS_PROPERTY_CATEGORIES.credit,	schemaNS: XMPConst.NS_IPTC_CORE,	structName: "CreatorContactInfo", 	fieldNS: XMPConst.NS_IPTC_CORE, fieldName: "CiTelWork"		},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.misc,		namespace: XMPConst.NS_IPTC_CORE,	key: "SubjectCode",				},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.misc,		namespace: XMPConst.NS_IPTC_CORE,	key: "IntellectualGenre",		},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.misc,		namespace: XMPConst.NS_IPTC_CORE,	key: "Scene",					},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.misc,		namespace: XMPConst.NS_PHOTOSHOP,	key: "TransmissionReference",	},
		{ type: "simple",	category: TS_PROPERTY_CATEGORIES.misc,		namespace: XMPConst.NS_PHOTOSHOP,	key: "Instructions",			},
	]

	try{
		tsHotloadCustomSubTables(); // rebuild sub tables if we need to 

		app.synchronousMode = true;

		var errorFiles = 0;
		var selection = app.document.selections; // get selected files
		if(!selection.length){ // nothing selected
			alert('Text Substitutions Error:\nNothing selected!');
			return;
		} 

		if(ExternalObject.AdobeXMPScript == undefined)  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); // load the xmp scripting API
		
		var useDialog = false;
		if(selection.length > 20) useDialog = true;
		if(useDialog){ // progress bar dialog
			/*
			Code for Import https://scriptui.joonas.me — (Triple click to select): 
			{"activeId":2,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"progessDialog","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Text Substitutions is working...","preferredSize":[300,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Progressbar","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[275,4],"alignment":null,"helpTip":null}},"item-2":{"id":2,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":"progresstext","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"x out of x files processed.","justify":"left","preferredSize":[0,0],"alignment":"left","helpTip":null}}},"order":[0,1,2],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
			*/ 

			// DIALOG
			// ======
			var progessDialog = new Window("palette", undefined, undefined, {closeButton: false, resizable: true}); 
				progessDialog.text = "Text Substitutions is working..."; 
				progessDialog.preferredSize.width = 325; 
				progessDialog.preferredSize.height = 100; 
				progessDialog.orientation = "column"; 
				progessDialog.alignChildren = ["center","center"]; 
				progessDialog.spacing = 10; 
				progessDialog.margins = 32; 

			var progressbar1 = progessDialog.add("progressbar", undefined, undefined, {name: "progressbar1"}); 
				progressbar1.maxvalue = selection.length; 
				progressbar1.preferredSize.width = 300; 
				progressbar1.preferredSize.height = 4; 
				progressbar1.value = 0; 

			var progresstext1 = progessDialog.add("statictext", undefined, undefined, {name: "progresstext1"}); 
				progresstext1.alignment = ["left","top"]; 
				progresstext1.preferredSize.width = 300; 
				progresstext1.text = "0 out of " + selection.length + " files processed."; 

			var progresstext2 = progessDialog.add("statictext", undefined, undefined, {name: "progresstext2"}); 
				progresstext2.alignment = ["left","top"]; 
				progresstext2.preferredSize.width = 300; 
				progresstext2.text = "Proccessing: "; 

			progessDialog.show();

		}

		var meow = $.hiresTimer; // dummy var bc timer resets on access
		
		for(var i = 0; i < selection.length; i++){ 
			if(useDialog){ // update the progress dialog
				progressbar1.value = i;
				progresstext1.text = i +" out of " + selection.length + " files processed."; 
				progresstext2.text = "Proccessing: " + selection[i].name;
				progessDialog.update();
			}
			if(!selection[i].container){ // exclude folders 
				var existingMetadata = selection[i].synchronousMetadata; // get existing metadata for this item
				if(!existingMetadata){ // does this file support metadata?
					errorFiles++;
					continue;
				} 
				var myXMP = new XMPMeta(existingMetadata.serialize());
				var value;
				try{

					for(j in propertyList){
						if(app.preferences.tsPropertyCategories & propertyList[j].category){ // check if users has enabled this cat
							// alert("checking param # " + j + ", " + propertyList[j].type != "complex" ? propertyList[j].key : propertyList[j].fieldName);
							TS_RECURSIONS = 0;

							if(propertyList[j].type == "array"){ // process array fields
								value = selection[i].metadata.read(propertyList[j].namespace, propertyList[j].key).toString(); // grab existing var
								myXMP.deleteProperty(propertyList[j].namespace, propertyList[j].key); // delete it
								value = value.toString().split(',') // separate into an array

								for(var k in value){ // proccess each tag in the array seperatley
									value[k] = tsDoSubstitutions(selection[i], value[k]); 

									if(app.preferences.tsSeparateTags){ // if this pref is enabled, check for commas after processing and split at each one into a seperate tag
										var tags = value[k].toString().split(',');
										for(var l in tags){
											myXMP.appendArrayItem(propertyList[j].namespace, propertyList[j].key, tags[l], 0, XMPConst.ARRAY_IS_ORDERED);
										}
									}
									else myXMP.appendArrayItem(propertyList[j].namespace, propertyList[j].key, value[k], 0, XMPConst.ARRAY_IS_ORDERED);
								}
							}
							else if(propertyList[j].type == "simple"){ // proccess simple fields
								value = selection[i].metadata.read(propertyList[j].namespace, propertyList[j].key); // get existing value
								value = tsDoSubstitutions(selection[i], value); // do substitutions on it
								myXMP.deleteProperty(propertyList[j].namespace, propertyList[j].key); // delete the existing value
								myXMP.setProperty(propertyList[j].namespace, propertyList[j].key, value); // replace with new value
							}
							else if(propertyList[j].type == "complex"){
								value = myXMP.getStructField(propertyList[j].schemaNS, propertyList[j].structName, propertyList[j].fieldNS, propertyList[j].fieldName); // get existing value
								value = tsDoSubstitutions(selection[i], value); // do substitutions on it
								myXMP.deleteStructField(propertyList[j].schemaNS, propertyList[j].structName, propertyList[j].fieldNS, propertyList[j].fieldName); // delete the existing value
								myXMP.setStructField(propertyList[j].schemaNS, propertyList[j].structName, propertyList[j].fieldNS, propertyList[j].fieldName, value); // replace with new value
							}
							else if(propertyList[j].type == "localized"){ // because UsageTerms is the product of the devil himself and reading/writing to it refuses to behave like EVERY OTHER FUCKING PROPERTY???
								if(myXMP.doesPropertyExist(propertyList[j].namespace, propertyList[j].key)){ // fuck you for making me do this
									value = selection[i].metadata.read(propertyList[j].namespace, propertyList[j].key);
									value = tsDoSubstitutions(selection[i], value); 
									myXMP.deleteProperty(propertyList[j].namespace, propertyList[j].key); 
									myXMP.setLocalizedText(propertyList[j].namespace, propertyList[j].key, "x-default", "x-default", value); // localized properties need to have their language explicitly defined or they refuse to work
								}
							}
						}
					}

					if(app.preferences.tsPropertyCategories & TS_PROPERTY_CATEGORIES.filename){ // process filename
						value = selection[i].name;
						value = tsDoSubstitutions(selection[i], value);
						selection[i].name = value;
					}
					
				} catch(e){
					if(e.message == 'bracketMatching' || e.message == "unknownSubstitution" || e.message == "tooManyRecursions" || e.message == "missingArguments") break; // pre-handled errors, we just wanna get out of here
					else throw e;
				}

				// write updated metadata to file
				var updatedMetadata = myXMP.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
				selection[i].metadata = new Metadata(updatedMetadata);
			}
			
		}
		if(useDialog) progessDialog.hide();

		TS_LAST_OP_TIMER = $.hiresTimer/1000000; // timer is in microseconds, div/1m for seconds
		TS_LAST_OP_FILES = selection.length;	
		
		if(errorFiles > 0){
			alert("Text Substitutions Warning:\n" + errorFiles + " files were not processed because they do not support metadata.")
		}
		
		app.synchronousMode = false;
	}
	catch(e){
		if(useDialog) progessDialog.hide();
		alert("Text Substitutions Error:\n" + e + ' ' + e.line);
	}
}



// finds and recursively replaces any substitutions in the input string
/// sel - selected thumbnail the text in target is coming from
/// sourceText - the string we're searching for subs in
function tsDoSubstitutions(sel, text){
	if(text.length == 0) return text;

	try{
		text = text.toString();

		var brackets = { b: 0 }; // stupid hack - objects are pass-by-reference so we use this to keep track of brackets

		text = tsDoSubstitutionsRec(sel, text, 0, brackets);
		if(brackets.b != 0) throw SyntaxError("bracketMatching"); // final check for mismatched brackets
		
		return text;
	}
	catch(e){
		if(e.message == "bracketMatching"){
			alert("TextSubstitutions Error:\nMismatched delimeters found in file " + sel.name + "\n\nThis file has not been affected. No further files will be proccessed.");
			throw e;
		}
		else throw e;
	}
 
}


// recurisve worker for tsDoSubstitutions() - replaces any complete substitutions (with delims)
function tsDoSubstitutionsRec(sel, sourceText, start, brackets){
	var nextEndDelim, nextStartDelim = start; // positions of start and end delims

	while(true){
		// search for start or end delim
		nextEndDelim = sourceText.indexOf(TS_END_DELIM, nextStartDelim);
		nextStartDelim = sourceText.indexOf(TS_START_DELIM, nextStartDelim);

		if(nextEndDelim == -1 && nextStartDelim == -1){ 					// CASE1: no more brackets - we're done here!
			return sourceText;
		}
		else if(nextEndDelim == -1){ 										// CASE2: no ending delim but a starting delim exists - this is bad
			throw SyntaxError("bracketMatching");
		} 
		else if((nextStartDelim == -1 ) || nextEndDelim < nextStartDelim ){ // CASE3: we've found the ending of the subst., swap it with the replacement and return
			if(brackets.b <= 0) throw SyntaxError("bracketMatching"); // we shouldnt encounter an end bracket with no start brkts
			sourceText = // build repl string
				sourceText.substring(0, start) + 
				tsFindReplacement(sel, sourceText.substring(start, nextEndDelim)) + // replacement section
				sourceText.substring(nextEndDelim+TS_DELIM_SIZE); 
			brackets.b--;
			return sourceText;
		} 
		else{ 																// CASE4: we've found the start of another subst
			brackets.b++;
			sourceText = sourceText.substring(0, nextStartDelim) + sourceText.substring(nextStartDelim+TS_DELIM_SIZE); // remove delim
			sourceText = tsDoSubstitutionsRec(sel, sourceText, nextStartDelim, brackets);
		}
		
	}

}


// given a target string, returns the replacement for it
function tsFindReplacement(selection, targetString){
	if(targetString.length == 0){ // case: empty replacement
		return;
	}

	TS_RECURSIONS++;
	checkRecursions(selection); // case: infinite recursion

	// lookup target in builtin function table
	var splitString = targetString.split(TS_DELIM_FUNC); // [0] will be the function name, [1+] will be args
	if(splitString.length > 1){
		replObject = TS_SUB_TABLE_BUILTIN_FUNCTIONS.lookup(splitString[0].toLowerCase());
		if(replObject != undefined){ // if this is undefined, nothing was found
			return replObject.replacement(selection, splitString).toString(); // call function, pass splitstring containing args
		}
	}

	// lookup target in builtin table
	var replObject = TS_SUB_TABLE_BUILTIN.lookup(targetString.toLowerCase()); 
	if(replObject != undefined){ // if this is undefined, nothing was found
		return replObject.replacement(selection).toString();
	}
	

	// lookup target in custom table - more complicated bc of enumerated replacements
	splitString = targetString.split(TS_DELIM_ENUM); // for enumerated substitutions - [0] will be the tag, [1] will be the index. if length=1, enumeration is not being used. 
	if(splitString.length > 1){
		splitString[1] = parseInt(splitString[1]); // convert to int	
	}
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
					alert("TextSubstitutions Error:\nIndex out of bounds: " + targetString + " in " + selection.name + ".\nIndex must be in 1, " + replObject.replacement.length + " (inclusive).\n\nThis file has not been affected. No further files will be proccessed."); 
					throw SyntaxError("unknownSubstitution");
				}
				replText = replObject.replacement[splitString[1]-1]; // sub 1 to switch to 1-indexing

			}
			else if(splitString[1] == 1){ 			// CASE 2b: not an array but we're grabbing the first one so it's fine
				replText = replObject.replacement;
			}
			else { 									// CASE 2c ERROR: target repl is NOT an array and we're grabbing not the first index 
				alert("TextSubstitutions Error:\nEnumeration defined on non-enumerable replacement: " + targetString + " in " + selection.name + ".\n\nThis file has not been affected. No further files will be proccessed.");
				throw SyntaxError("unknownSubstitution");
			}

		}
		else{ 										// CASE 3 ERROR: too many #s in targetstring
			alert("TextSubstitutions Error:\nInvalid syntax " + targetString + " in " + selection.name + ". Only one # allowed.\n\nThis file has not been affected. No further files will be proccessed.");
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
	alert("TextSubstitutions Error:\nUnknown substitution " + splitString + " in " + selection.name + ".\n\nThis file has not been affected. No further files will be proccessed.");
	throw SyntaxError("unknownSubstitution");
}

// checks for possible infinite recursion
function checkRecursions(sel){
	if(TS_RECURSIONS > app.preferences.tsRecursionLimit){
		alert("TextSubstitutions Error:\nPossible cyclical reference detected - too many recursions in " + sel.name + ". You can raise the recursion limit in the preferences.\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("tooManyRecursions");
	}
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
	return hour.toString() + ":" + padTwoDigitNumber(date.minute) + period;
}

// returns the day half (am vs pm)
function tsTDayHalf(sel){
	var date = tsSelectionToXMPDate(sel);
	return date.hour > 11 ? " pm" : " am";
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

// returns the 12-hour formatted hour
function tsTHour12(sel){
	var date = tsSelectionToXMPDate(sel);
	var hour = date.hour > 12 ? date.hour-12 : date.hour;
	hour = hour == 0 ? 12 : hour;
	return hour.toString() 
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

// returns the file extension
function tsMExtension(sel){
	var n = sel.name;
	return n.substring(n.lastIndexOf('.')+1);
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

// returns the Source field
function tsMSource(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, "Source");
}

// returns the Desc Writer
function tsMCaptionWriter(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, "CaptionWriter");
}

// returns the Copyright Notice
function tsMCopyrightNotice(sel){
	return sel.metadata.read(XMPConst.NS_DC, "rights");
}

// returns the Rights Usage Terms
function tsMUsageTerms(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	if(myXMP.doesPropertyExist(XMPConst.NS_XMP_RIGHTS, "UsageTerms")) return sel.metadata.read(XMPConst.NS_XMP_RIGHTS, "UsageTerms"); // likes to error if you dont check first
	return "";
}

// returns the Job Ident
function tsMJobIdentifier(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, "TransmissionReference");
}

// returns the Instructions field
function tsMInstructions(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, "Instructions");
}

// returns the creator's name
function tsMCreator(sel){
	return sel.metadata.read(XMPConst.NS_DC, "creator");
}

// returns the creator's name
function tsMCreatorJob(sel){
	return sel.metadata.read(XMPConst.NS_PHOTOSHOP, "AuthorsPosition");
}

// returns the creator's email
function tsMCreatorEmail(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	return myXMP.getStructField(XMPConst.NS_IPTC_CORE, "CreatorContactInfo", XMPConst.NS_IPTC_CORE, "CiEmailWork");
}

// returns the creator's website
function tsMCreatorWebsite(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	return myXMP.getStructField(XMPConst.NS_IPTC_CORE, "CreatorContactInfo", XMPConst.NS_IPTC_CORE, "CiUrlWork");
}

// returns the creator's address
function tsMCreatorAddress(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	return myXMP.getStructField(XMPConst.NS_IPTC_CORE, "CreatorContactInfo", XMPConst.NS_IPTC_CORE, "CiAdrExtadr");
}

// returns the creator's city
function tsMCreatorCity(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	return myXMP.getStructField(XMPConst.NS_IPTC_CORE, "CreatorContactInfo", XMPConst.NS_IPTC_CORE, "CiAdrCity");
}

// returns the creator's state
function tsMCreatorState(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	return myXMP.getStructField(XMPConst.NS_IPTC_CORE, "CreatorContactInfo", XMPConst.NS_IPTC_CORE, "CiAdrRegion");
}

// returns the creator's zip
function tsMCreatorPostalCode(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	return myXMP.getStructField(XMPConst.NS_IPTC_CORE, "CreatorContactInfo", XMPConst.NS_IPTC_CORE, "CiAdrPcode");
}

// returns the creator's country
function tsMCreatorCountry(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	return myXMP.getStructField(XMPConst.NS_IPTC_CORE, "CreatorContactInfo", XMPConst.NS_IPTC_CORE, "CiAdrCtry");
}

// returns the creator's phone
function tsMCreatorPhone(sel){
	var myXMP = new XMPMeta(sel.synchronousMetadata.serialize());
	return myXMP.getStructField(XMPConst.NS_IPTC_CORE, "CreatorContactInfo", XMPConst.NS_IPTC_CORE, "CiTelWork");
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



///////////////////////
// MATH FUNCTIONS

// sums all passed values
function tsFAdd(sel, argv){
	var result = parseFloat(argv[1]);
	if(isNaN(result)) result = 0; 

	for(var i = 2; i < argv.length; i++){
		argv[i] = parseFloat(argv[i]);
		if(isNaN(argv[i])) argv[i] = 0; // if this was text or something, just treat it as 0.
		result += argv[i];
	}

	return result;
}

// subtracts all passed values
function tsFSub(sel, argv){
	var result = parseFloat(argv[1]);
	if(isNaN(result)) result = 0; 

	for(var i = 2; i < argv.length; i++){
		argv[i] = parseFloat(argv[i]);
		if(isNaN(argv[i])) argv[i] = 0; // if this was text or something, just treat it as 0.
		result -= argv[i];
	}

	return result;
}

// multiplies all passed values
function tsFMul(sel, argv){
	var result = parseFloat(argv[1]);
	if(isNaN(result)) result = 1; 

	for(var i = 2; i < argv.length; i++){
		argv[i] = parseFloat(argv[i]);
		if(isNaN(argv[i])) argv[i] = 1; // if this was text or something, just treat it as 1.
		result *= argv[i];
	}

	return result;
}

// divides all passed values ; if any args = 0, returns 0
function tsFDiv(sel, argv){
	var result = parseFloat(argv[1]);
	if(isNaN(result)) result = 1; 

	for(var i = 2; i < argv.length; i++){
		argv[i] = parseFloat(argv[i]);
		if(isNaN(argv[i])) argv[i] = 1; // if this was text or something, just treat it as 1.
		if(argv[i] == 0) return 0; // check div/0
		result /= argv[i];
	}

	return result;
}

// takes 2 params, returns the modulo of the first by the second
function tsFMod(sel, argv){
	if(argv.length == 2) return argv[1];
	if(argv.length == 1) return "";
	var a = parseFloat(argv[1]);
	if(isNaN(a)) a = 1; 
	var b = parseFloat(argv[2]);
	if(isNaN(b)) b = 1; 

	return a%b;
}


function tsFCeil(sel, argv){
	if(argv.length == 1) return "";
	return Math.ceil(argv[1]);
}

function tsFFloor(sel, argv){
	if(argv.length == 1) return "";
	return Math.floor(argv[1]);
}

function tsFRound(sel, argv){
	if(argv.length == 1) return "";
	return Math.round(argv[1]);
}


//////////////////////
// STRING OPERATIONS


// returns the first argv[2] characters of argv[1]
function tsFPrefix(sel, argv){
	if(argv.length < 3){
		alert("TextSubstitutions Error:\nfPrefix in "+ sel.name +" expected 2 arguments but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}
	argv[2] = parseFloat(argv[2]);
	if(isNaN(argv[2])) return "";
	return argv[1].substring(0, argv[2]);
}

// returns the last argv[2] characters of argv[1]
function tsFSuffix(sel, argv){
	if(argv.length < 3){
		alert("TextSubstitutions Error:\nfSuffix in "+ sel.name +" expected 2 arguments but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}
	argv[2] = parseFloat(argv[2]);
	if(isNaN(argv[2])) return "";
	return argv[1].substring(argv[1].length-argv[2]);
}

// returns characters between argv[2] and argv[3] in argv[1]
function tsFSubstring(sel, argv){
	if(argv.length < 4){
		alert("TextSubstitutions Error:\nfSuffix in "+ sel.name +" expected 3 arguments but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}
	argv[2] = parseFloat(argv[2]);
	if(isNaN(argv[2])) return "";
	argv[3] = parseFloat(argv[3]);
	if(isNaN(argv[3])) return "";
	return argv[1].substring(argv[2], argv[3]);
}

// returns the length of argv[1]
function tsFLength(sel, argv){
	if(argv[1]) return argv[1].length;
	return "0";
}

// string, char, number
// returns the index of the argv[3]-th occurance of argv[2] in argv[1]. Returns -1 if not found
function tsFGetIndex(sel, argv){
	if(argv.length < 3){
		alert("TextSubstitutions Error:\nfGetIndex in "+ sel.name +" expected 2+ arguments but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}
	if(!argv[3]) argv[3] = 1; // if not defined, assume they want the first one

	var pos = 0;
	for(var i = 0; i < argv[3]; i++){
		if(i>0) pos++; // if we aren't on our first go-around, increment the pos so we don't just repeatedly hit the same match
		pos = argv[1].indexOf(argv[2], pos);
	}

	return pos;
}

// returns the index of the argv[3]-th occurance of argv[2] in argv[1], counting from the end. Returns -1 if not found
function tsFGetLastIndex(sel, argv){
	if(argv.length < 3){
		alert("TextSubstitutions Error:\nfGetIndex in "+ sel.name +" expected 2+ arguments but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}
	if(!argv[3]) argv[3] = 1; // if not defined, assume they want the first one

	var pos = argv[1].length;
	for(var i = 0; i < argv[3]; i++){
		if(i>0) pos--; // if we aren't on our first go-around, decrement the pos so we don't just repeatedly hit the same match
		pos = argv[1].lastIndexOf(argv[2], pos);
	}

	return pos;
}

// replaces all instances of argv[2] in argv[1] with argv[3]
function tsFFindReplace(sel, argv){
	if(argv.length < 3){
		alert("TextSubstitutions Error:\nfFindReplace in "+ sel.name +" expected 2+ arguments but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}

	if(!argv[3]) argv[3] = ""; // default to blank if not provided
	var s1 = argv[1].split(argv[2]);
	var s2 = s1[0];

	for(var i = 1; i < s1.length; i++){
		s2 = s2 + argv[3] + s1[i]; // concat with the separator character between
	}

	return s2;
}



//////////////////////
// CONDITIONALS


// returns "1" if all argv[1+] are equal, "0" otherwise
function tsFEquals(sel, argv){
	if(argv.length <= 2) return "1";

	for(var i = 2; i < argv.length; i++){
		if(argv[1] !== argv[i]) return "0";
	}

	return "1";
}

// returns "1" if argv[1] equals any argv[2+], "0" otherwise
function tsFAnyEquals(sel, argv){
	if(argv.length <= 2) return "0";

	for(var i = 2; i < argv.length; i++){
		if(argv[1] == argv[i]) return "1";
	}

	return "0";
}

// returns "1" if any argv[1+] are different, "0" otherwise
function tsFNotEquals(sel, argv){
	return tsFEquals(sel, argv) == "1" ? "0" : "1";
}

// returns "1" if any argv[1+] == "1", "0" otherwise
function tsFOr(sel, argv){
	for(var i = 1; i < argv.length; i++){
		if(anyToBool(argv[i])) return "1";
	}

	return "0";
}

// returns "1" if any argv[1+] == "0" or "", "1" otherwise
function tsFAnd(sel, argv){
	for(var i = 1; i < argv.length; i++){
		if(!anyToBool(argv[i])) return "0";
	}

	return "1";
}

// returns "1" if argv[1] == "0" or "", "0" otherwise
function tsFNot(sel, argv){
	if(argv.length == 1) return "1";
	return anyToBool(argv[1]) ? "0" : "1";
}


// returns argv[2] if argv[1] is true. if argv[3] exists, return that. otherwise, return "".
function tsFBranch(sel, argv){
	if(argv.length < 3){
		alert("TextSubstitutions Error:\nfBranch in "+ sel.name +" expected 2+ arguments but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}

	if(anyToBool(argv[1])) return argv[2]; // true, return 2nd param
	else if(argv.length == 3) return ""; // false, no 3rd param - return blank
	else return argv[3]; // false, return 3rd param
}

// returns "1" if argv[1] is a valid subst, "0" otherwise
function tsFSubstitutionExists(sel, argv){
	if(argv.length < 2){
		alert("TextSubstitutions Error:\nfSubstitutionExists in "+ sel.name +" expected 1 argument but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}

	return tsFSubstitutionExistsHelper(argv[1]);
}

// returns "1" if s is a valid subst, "0" otherwise
function tsFSubstitutionExistsHelper(s){
	s = s.toString();
	var t = s.split(TS_DELIM_ENUM); // case: enumerated replacements
	var r;
	if(t.length > 1) r = TS_SUB_TABLE_USER.lookup(t[0]);
	else r = TS_SUB_TABLE_USER.lookup(s);

	if(r !== undefined){
		if(t.length == 1 || ( 0 < t[1] && t[1] <= r.replacement.length)) return "1"; // either no enum or enum is in range for this subst
		return "0";
	}
	if(TS_SUB_TABLE_BUILTIN.lookup(s) !== undefined) return "1";
	if(TS_SUB_TABLE_BUILTIN_FUNCTIONS.lookup(s) !== undefined) return "1";

	return "0";
}

// returns the first valid substitution
function tsFSafeExecute(sel, argv){
	if(argv.length < 2){
		alert("TextSubstitutions Error:\nfSafeExecute in "+ sel.name +" expected 1+ arguments but got " + parseInt(argv.length-1) + "!\n\nThis file has not been affected. No further files will be proccessed.");
		throw SyntaxError("missingArguments");
	}
	for(var i = 1; i < argv.length; i++){
		if(anyToBool(tsFSubstitutionExistsHelper(argv[i]))) return argv[i];
	}

	return "";

}


// returns "1" if all argv[n>1] > argv[(n>1)+1], "0" otherwise
function tsFGreaterThan(sel, argv){
	if(argv.length <= 2) return "1";

	for(var i = 2; i < argv.length; i++){
		if(argv[i-1] <= argv[i]) return "0";
	}

	return "1";
}

// returns "1" if all argv[n>1] < argv[(n>1)+1], "0" otherwise
function tsFLessThan(sel, argv){
	if(argv.length <= 2) return "1";

	for(var i = 2; i < argv.length; i++){
		if(argv[i-1] >= argv[i]) return "0";
	}

	return "1";
}

// returns "1" if all argv[n>1] >= argv[(n>1)+1], "0" otherwise
function tsFGreaterEqual(sel, argv){
	if(argv.length <= 2) return "1";

	for(var i = 2; i < argv.length; i++){
		if(argv[i-1] < argv[i]) return "0";
	}

	return "1";
}

// returns "1" if all argv[n>1] <= argv[(n>1)+1], "0" otherwise
function tsFLessEqual(sel, argv){
	if(argv.length <= 2) return "1";

	for(var i = 2; i < argv.length; i++){
		if(argv[i-1] > argv[i]) return "0";
	}

	return "1";
}

// returns a blank space
function tsBlank(sel, argv){
	return "";
}




//////////////////////
// UTILITY FUNCTIONS

// pads with leading zeroes
function padTwoDigitNumber(num){
	return num < 10 ? "0" + num.toString() : num;
}

// not perfect but good enough because we don't have Array.isArray()
function isArray(a){
	return (a instanceof Array);
}

// returns false if s = "" or "0", true otherwise
function anyToBool(s){
	if(s.length == 0 || s == "0" || s == 0 || s == false) return false;
	return true;
}
 





// substitutionTable - a hashtable class (except not really because ES3 doesn't have CLASSES??)
// stores and looks up substitutions

// substitution objects passed in must have 2 children:
/// target - the string to replace
/// replacement - a string, array of strings, or function

// size should be a prime at least 2x the number of expected elements
function SubstitutionTable(size){
	const b = 67; // "choose b as the first prime number greater or equal to the number of characters in the input alphabet." assuming 26*2+10 chars in alphabet here
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
		var numCollisions = 1;
		
		while(this.table[h] && this.table[h].target != t){ // linear probing
			h += numCollisions++;
			if(h > this.tableSize) h = 0; // wrap around
		}

		if(!this.table[h]){ return undefined;}

		return this.table[h];

	}


}

