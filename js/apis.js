// apis used in app.js
// load streetview
var getStreetViewImage = function (obj) {
    var params = 'size=200x100&location=' + obj.location.lat + ', ' + obj.location.lng;
    var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?' + params;
    return '<img class="bgimg" src="' + streetViewUrl + '">';
};

//get wikipedia articles related to name of object
var wikiAjaxCall = function (obj) {    
    Offline.check();
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+obj.name+'&format=json&callback=wikiCallback';
    var wikiEntries = "";
    var wikiRequestTimeout= setTimeout(function() {
        wikiList='<p>Failed to get wikipedia links</p>';
    }, 8000);
    $.ajax( {
        url: wikiURL,
        dataType:'jsonp',
        success: function( response ) {
            var articles = response[1];
            wikiEntries+="<ul>";

            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                var url = 'http://en.wikipedia.org/wiki/'+article;
                wikiEntries+='<li><a href="'+url+'">'+ article+'</a></li>';
                // have to do this because of callback
                obj.infowindow.content+=wikiEntries+'</u>';
            };
            clearTimeout(wikiRequestTimeout);
            },
    } );
    return wikiEntries;
};