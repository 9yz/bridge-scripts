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
const TS_EDGE_CHAR_SIZE = 2;


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
				try{
					value = tsDoSubstitutions(selection[i], value); // find and replace substutions
				} catch(e){
					if(e instanceof SyntaxError) break;
					else throw e;
				}
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
function tsDoSubstitutions(selection, sourceText){
	sourceText = sourceText.toString(); // for some reason it's not a string to begin with???
	// alert("tsDoSubstitutions(): " + sourceText);
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
			break;
		}
		else if(start == -1 && end != -1){ // cant find start
			alert("TextSubstitutions Error:\nUnmatched " + TS_END_CHAR + " found in file " + selection.name + " at index " + end + ".\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
			throw SyntaxError("bracketMatching");
			break;
		}
		else break; // if both are -1 there's nothing more to process
		
		// update progressIndex - length of the string is now different
		progressIndex -= TS_EDGE_CHAR_SIZE*2;
		progressIndex += replacementString.length - targetString.length;
	}

	return sourceText;
}


// given a target string, returns the replacement for it
function tsFindReplacement(selection, targetString){
	try{
		alert("tsFindReplacement(): " + targetString);
		targetString = targetString.toLowerCase();

		if(targetString.length == 0){
			return;
		}

		var commandMap = { // map of all program-defined substitutions
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
			"ttime"				: tsTTimeTaken,
			"ttod"				: tsTTimeOfDay,
			"ttimeofday"		: tsTTimeOfDay,
			"thr"				: tsTHour,
			"thour"				: tsTHour,
			"tmin"				: tsTMinute,
			"tminute"			: tsTMinute,
			"tsec"				: tsTSecond,
			"tsecond"			: tsTSecond,
			"tms"				: tsTMilliecond,
			"tmillisecond"		: tsTMilliecond,
			"tdt"				: tsTDateTime,
			"tdatetime"			: tsTDateTime,
			"tiso"				: tsTISO,

			"mname"				: tsMFileName,
			"mfilename"			: tsMFileName,
			"mtitle"			: tsMTitle,
			"mheadline"			: tsMHeadline,
			"mcredit"			: tsMCreditLine,
			"mcreditline"		: tsMCreditLine,
			"msublocation"		: tsMSublocation,
			"mlocation"			: tsMLocation,
			"mcity"				: tsMCity,
			"mstate"			: tsMState,
			"mcountry"			: tsMCountry, 
		}

		if(commandMap.hasOwnProperty(targetString)){
			return commandMap[targetString](selection);
		}

		alert("TextSubstitutions Error:\nUnknown substitution " + targetString + " in " + selection.name + ".\n\nSome text in this file may have been partially replaced. No further files will be proccessed.");
		throw SyntaxError("unknownSubstitution");
	
	}
	catch(e){
		alert(e + ' ' + e.line);
	}
}




// called when text substitutions is selected in menu
tsMenuRun.onSelect = function(){
	tsRun();
}
tsMenuRunCont.onSelect = function(){
	tsRun();
}


function tsSelectionToXMPDate(sel){
	return new XMPDateTime(sel.metadata.read(XMPConst.NS_XMP, 'CreateDate'));
}

function tsSelectionToDate(sel){
	date = new XMPDateTime(sel.metadata.read(XMPConst.NS_XMP, 'CreateDate'));
	return date.getDate();
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const monthsAbbr = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


// returns the creation date in ISO 8601 format
function tsTDateTaken(sel){
	var date = tsSelectionToXMPDate(sel);
	return date.year + "-" + date.month + "-" + date.day;
}

// returns the formatted as Monthname date, year. Ex. January 1, 2024
function tsTDateTakenPretty(sel){
	var date = tsSelectionToXMPDate(sel);
	return months[date.month] + date.day + ", " + date.year;
}

// returns the formatted as Mmth. date, year. Ex. Jan. 1, 2024
function tsTDateTakenPrettyShort(sel){
	var date = tsSelectionToXMPDate(sel);
	return monthsAbbr[date.month] + date.day + ", " + date.year;
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
	return months[tsSelectionToXMPDate(sel).month];
}

// returns the name of the month
function tsTDateTakenMonthPrettyShort(sel){
	return monthsAbbr[tsSelectionToXMPDate(sel).month];
}












Array.prototype.indexOf = function(item){
	var index = 0, length = this.length;
	for(; index < length; index++){
		if(this[index] === item) return index;
	}
}