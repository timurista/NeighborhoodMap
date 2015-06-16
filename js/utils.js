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

// checks if obj with name is in array and returns the index
function containsObjectWithName(name, array) {
	for (var i = array.length - 1; i > -1; i--) {
	    if (array[i].name === name) { return i; }
	}
	return -1;
}

//TODO add default class to hold retrieved api objects

//jquery collapsible management
$('.collapsible').collapsible({
    defaultOpen: 'section1',
    cookieName: 'nav',
    speed: 'fast',
    animateOpen: function (elem, opts) { //replace the standard slideUp with custom function
        elem.next().slideFadeToggle(opts.speed);
        console.log(elem);
    },
    animateClose: function (elem, opts) { //replace the standard slideDown with custom function
        elem.next().slideFadeToggle(opts.speed);
    },
    loadOpen: function (elem) { //replace the standard open state with custom function
        elem.next().show();
    },
    loadClose: function (elem, opts) { //replace the close state with custom function
        elem.next().hide();
    }
});

// hide missing images
$("img").error(function(){
        $(this).hide();
});
