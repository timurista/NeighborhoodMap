// custom utils functions
var stringStartsWith = function (oldString, startsWith) {          
    var string = oldString || "";
    if (startsWith.length > string.length) {return false;}
    return string.substring(0, startsWith.length) === startsWith;
};

var stringContains = function (oldString, phrase) {
    var string = oldString || "";
    //returns true if phrase is contained in string
    return (string.indexOf(phrase)>-1);
};