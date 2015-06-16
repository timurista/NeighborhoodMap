// apis used in app.js
// load streetview
var getStreetViewImage = function (obj) {
    var params = 'size=200x100&location=' + obj.location.lat + ', ' + obj.location.lng;
    var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?' + params;
    return streetViewUrl;
}

var setMarkerOptions = function(self,obj,latLang) {
    // var obj = obj;
    var contentString ='<p>' + obj.name + '</p>';

    // var latLang = new google.maps.LatLng(obj.location.lat,obj.location.lng);
    var infowindow = new google.maps.InfoWindow({
        content: contentString, //add content later, including wikipedia entries and streetview
        size: new google.maps.Size(100, 50),
        maxWidth: 200,
        maxHeight: 100
    });

    var iconBase = 'https://maps.google.com/mapfiles/kml/pushpin/';
    var newMarker = new google.maps.Marker({
      position: latLang,
      map: map,
      title: obj.name, //name of place 
      icon: iconBase + 'red-pushpin.png'
    });
    obj.marker = newMarker;
    obj.infowindow = infowindow;

    //shows the marker
    obj.show = function () {
        google.maps.event.trigger(obj.marker, 'click');
    };

    // changes color
    obj.toggleColor = function () {
        var red = 'red-pushpin.png';
        var ylw = 'ylw-pushpin.png';
        obj.marker.icon = (obj.marker.icon !== self.iconBase+ylw) 
            ? self.iconBase + ylw : self.iconBase + red;
    }

    // add animation options
    obj.toggleBounce = function() {
      if (obj.marker.getAnimation() !== null) {
        obj.marker.setAnimation(null);
      } else {
        self.listView().forEach(function(item) {
            item.marker.setAnimation(null);
            item.infowindow.close();
        });
        obj.infowindow.open(map, obj.marker);
        obj.marker.setAnimation(google.maps.Animation.BOUNCE);
      }
      // OPTIONAL: make sure it doesn't bounce forever
      // setTimeout(function(){ obj.marker.setAnimation(null); }, 1500);
    };

    //add dom listener
    google.maps.event.addListener(obj.marker, 'click', function() {
        self.resetIcons()
        // change icon
        obj.toggleColor();
        // do some animation
        obj.toggleBounce();
        self.selectedVenue(obj);
        map.setCenter(map.setCenter(obj.marker.getPosition()));
    });
    return obj;
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