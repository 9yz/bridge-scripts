/*


    ###### textSubstitutions.jsx Custom Substitutions ######

    ### Format ###
    {
        target: "<text>",
        replacement: "<text>",
        recursions: <integer>
    },

    -  target: A **LOWERCASE** string. The text to be replaced. This cannot override the default substitutions.
    -  replacement: A string. The text to replace it with.
    -  recursions: A non-negative integer. The number of times the replacement text should be analysed for additional subsitutions. 
       *** Unless you're doing something weird, this will typically only need to be 0 or 1.*** 
       Larger numbers can make the program take longer to finish.
    -  comments can be added to this file by prefixing them with "//"


*/

const tsCustomSubstitutions = [ // Place custom content after this line 


    // Example 1
    // This would cause the text "[[mywebsite]]"" to be replaced with "https://www.example.com/""
    {
        target: "mywebsite",
        replacement: "https://www.example.com/",
        recursions: 0
    },

    // Example 2
    // If your IPTC "City" and "State" fields were set to San Francisco and California, respectively, this would cause "[[shortLocation]]" to be replaced with "San Francisco, California". The level of recursion is necessary because the replacement text contains other substitutions that need to be replaced 
    {
        target: "shortlocation",
        replacement: "[[mCity]], [[mState]]",
        recursions: 1
    },

    // Example 3
    // If the file was created on 2024-11-23, this would cause the text "[[timeplace]]"" to be replaced with "Taken on November 23, 2024 in San Francisco, California.". Even though the replacement text contains [[shortLocation]] which contains more subsitutions, a second level of recursion is not necessary because [[shortLocation]] itself will do a level of recursion.
    {
        target: "timeplace",
        replacement: "Taken on [[tDatePretty]] in [[shortLocation]].",
        recursions: 1
    },

   
] // Place custom content above this line