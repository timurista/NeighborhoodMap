// apis used in app.js
// load streetview
var getStreetViewImage = function (obj) {
    var params = 'size=200x100&location=' + obj.location.lat + ', ' + obj.location.lng;
    var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?' + params;
    return streetViewUrl;
}

//get wikipedia articles related to name of object
var wikiAjaxCall = function (obj) {    
    Offline.check();
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+obj.name+'&format=json&callback=wikiCallback';
    var wikiEntries = [];
    var wikiRequestTimeout= setTimeout(function() {
        console.log('Failed to get wikipedia links');
    }, 8000);
    $.ajax( {
        url: wikiURL,
        dataType:'jsonp',
        success: function( response ) {
            var articles = response[1];

            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                var url = 'http://en.wikipedia.org/wiki/'+article;
                wikiEntries.push('<a href="'+url+'">'+ article+'</a>');
                // have to do this because of callback
            }
            obj.wikiList(wikiEntries);
            clearTimeout(wikiRequestTimeout);
            },
    } );
    // return wikiEntries;
};