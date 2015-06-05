// custom utils functions

var stringStartsWith = function (string, startsWith) {          
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

var stringContains = function (string, phrase) {
    var string = string || "";
    //returns true if phrase is contained in string
    return (string.indexOf(phrase)>-1)
}