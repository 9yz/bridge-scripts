/* 

	textSubstitutions.jsx
	11/24/24

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
		alert("recursing " + recursions);
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
		"tiso"				: tsTISO,

		// metadata-based substitutions
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
	return months[date.month] + " " + date.day + ", " + date.year;
}

// returns the formatted as Mmth. date, year. Ex. Jan. 1, 2024
function tsTDateTakenPrettyShort(sel){
	var date = tsSelectionToXMPDate(sel);
	return monthsAbbr[date.month] + " " + date.day + ", " + date.year;
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

// returns the short name of the month
function tsTDateTakenMonthPrettyShort(sel){
	return monthsAbbr[tsSelectionToXMPDate(sel).month];
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

// returns the datetime in full 8601 format with timezone
function tsTISO(sel){
	return sel.metadata.read(XMPConst.NS_XMP, 'CreateDate');
}


///////////////////
// METADATA FUNCTIONS

// returns the filename
function tsMFileName(sel){
	return sel.name;
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


Array.prototype.indexOf = function(item){
	var index = 0, length = this.length;
	for(; index < length; index++){
		if(this[index] === item) return index;
	}
}