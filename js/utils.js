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