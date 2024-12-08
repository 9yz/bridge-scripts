/* 
	
	scratchPad.jsx
	12/08/24

	Adds a new "Scratch Pad" window for taking notes or whatever. Accessed through Window > Scratch Pad.
	Text is not saved between sessions.

	Derived from TextPreview.jsx by David M. Converse, availible under the Apache 2.0 License.

*/


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

		var spMenuRun 			= MenuElement.create('command', 'Scratch Pad', 'at the beginning of Window-');
		// var spMenuRun 			= MenuElement.create('command', 'Scratch Pad', 'at the beginning of Window');

	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}


spMenuRun.onSelect = function(){
	spCreateWindow();
}


function spCreateWindow(){
	try{

		// why this code works and 
		
		this.paletteRefs = new Array();
		var spWrapper = this;

		var spScriptPalette = new TabbedPalette(app.documents[0], "Scratch Pad", 'scratchpadTab', 'script');
		spWrapper.paletteRefs.push(spScriptPalette);

		spPanel = spScriptPalette.content.add('panel', undefined, '');
		spPanel.alignment = ['fill', 'fill'];
		spPanel.alignChildren = ['fill', 'fill'];

		spPanel.txtField = spPanel.add('edittext', undefined, "Text in this panel will not be saved when the application is closed.", {multiline:true, scrollable: true}); //default text

		spScriptPalette.content.layout.layout(true); //layout twice for correct sizing
		var c = spScriptPalette.content.bounds
		spPanel.bounds = [c[0] - 2, c[1] - 2, c[2] - 2, c[3] - 2];
		var b = spPanel.bounds;
		spPanel.txtField.bounds = [b[0] - 10, b[1] - 10, b[2] - 45, b[3] - 35];
		spScriptPalette.content.layout.layout(true);

		spScriptPalette.content.onResize = function(){ //dynamic resizing
			spPanel.bounds = b;
			spPanel.txtField.bounds = [b[0] - 10, b[1] - 10, b[2] - 45, b[3] - 35];
			this.layout.resize(true);
			spScriptPalette.content.layout.layout(true);
		}


	} catch(e){
        alert(e + ' ' + e.line);
    }
}