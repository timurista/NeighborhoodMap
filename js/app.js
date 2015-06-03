//wikipedia json-p requests
var wikiAjaxCall = function (obj) {
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+obj.name+'&format=json&callback=wikiCallback';
    var wikiEntries = "";
    var wikiRequestTimeout= setTimeout(function() {
        wikiList='failed to get wikipedia links';
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
}

// custom utils function
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

// global map variable to be moved soon
var mapOptions = {
  center: { lat: -34.397, lng: 150.644},
  zoom: 14
};
var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);



var viewModel = function () {
    var self=this;
    self.filterText = ko.observable("");
    self.listNames = ko.observableArray([]);
    self.autocompleteAllowed=ko.observable(false);
    //set text depending on value of allowed autocomplete
    self.acToggleDisplay = ko.computed(function() {

        return (self.autocompleteAllowed()) ?
        ko.observable("AutoComplete Enabled") : ko.observable("AutoComplete Disabled");
    });

	self.location=ko.observable("4940 W Rosebay Dr, Tucson, AZ");
    self.itemSearch=ko.observable("drinks");
    self.searchTerm=ko.observable("Burger");
    self.listView=ko.observableArray([]);

    //assigns class based on css
    self.acButton=ko.pureComputed(function() {
        return self.autocompleteAllowed() ? "btn-default" : "btn-disabled";
    });

    //flag for autocomplete
    self.toggleAutoComplete= function() {
        

        if (!self.autocompleteAllowed()) {
            self.autocompleteAllowed(true);
            $("#filter").autocomplete({ source: self.listNames() });

            // because of a bug with chrome, 2 input fields must be created 
            $("#filter").show();
            // filter without autoCompletes
            $("#firstFilter").hide();
        } else {
            self.autocompleteAllowed(false);
            $("#filter").attr('autocomplete','off');
            $("#filter").hide();

            // filter without autoComplete
            $("#firstFilter").show();
        }
        // hides annoying message
        $('.ui-helper-hidden-accessible').hide();
    };
    


    self.filteredResults=ko.computed(function () {
        var filter = self.filterText().toLowerCase();
        // remove whitespace
        //filter = filter.trim();
        if (!filter) {
            // set markers for everything in listview
            self.listView().forEach(function(item) {
                item.marker.setMap(map);
            });
            return self.listView();
        } else {
            var filteredList = ko.utils.arrayFilter(self.listView(), function (item) {
                //return stringStartsWith(item.name.toLowerCase(), filter)

                if (stringContains(item.name.toLowerCase(),filter)) {
                    // if item shows up

                    //check marker then add
                    if (item.marker) {
                        item.marker.setMap(map);
                    }
                    // return so it can be displayed
                    return true;
                }
                else {item.marker.setMap(null); return false;}
            });
            console.log(filteredList);
            return filteredList
        }
    }, self);

    self.update=function() {
        //FourSqaure API call
        var sec = self.itemSearch();
        var query = self.itemSearch();

        var loc = self.location();
        console.log(loc,sec);
        // Foursquare API
        var fsURL = 'https://api.foursquare.com/v2/venues/search?near='+loc+'&section='+query+'&oauth_token=NOFWGL5PTP4HRY3W1IODQGUKIAG1GA5BV2AOBVGGLJGV0HF4&v=20150318';



        //ajax call for the venues
        $.ajax({
            url: fsURL,
            dataType: "json",
            success: function(response){
                console.log(response);
                //var venue = response[1];
                console.log(response["response"]);
                venues = response["response"]["venues"].slice(1,-1);

                // here we associate a map marker with each venue and append it                

                venues.forEach(function (obj) {
                    // content for info window
                    // console.log(obj);
                    var phone = (typeof obj.contact.formattedPhone === 'undefined') ? 'No Contact Information' : obj.contact.formattedPhone;
                    var fbook = (typeof obj.contact.facebookName === 'undefined') ? 'None' : obj.contact.facebookName;
                    var users = (typeof obj.stats.usersCount === 'undefined') ? 'No User Information' : obj.stats.usersCount;
                    var webLink = (typeof obj.url === 'undefined') ? 'No Website' : '<a href="'+obj.url+'">Website</a>';
       


                    var here = obj.hereNow.summary;

                    //sets wikipedia info
                    var wikiList = wikiAjaxCall(obj);

                    var contentString =
                      '<h1 id="firstHeading" class="firstHeading">'+obj.name+'</h1>'+
                      '<div id="bodyContent">'+
                      '<p>'+here+'</p>'+
                      '<p><em>'+phone+'</em></p>'+
                      '<p>Facebook name: '+fbook+'</p>'+
                      '<p>'+webLink+'</p>'+
                      '<p>Number of Users: <strong>'+users+'</strong></p>'+
                      wikiList+
                      '</div>';

                    var latLang = new google.maps.LatLng(obj.location.lat,obj.location.lng);
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString, //add something later,
                        size: new google.maps.Size(150, 50)
                    });
                    var newMarker = new google.maps.Marker({
                      position: obj.location,
                      map: map,
                      title: obj.name //name of place 
                    });
                    obj.marker = newMarker;
                    obj.infowindow = infowindow;


                    //shows the marker
                    obj.show = function () {
                        google.maps.event.trigger(obj.marker, 'click');
                    };

                    // add animation options
                    obj.toggleBounce = function() {
                      if (obj.marker.getAnimation() != null) {
                        obj.marker.setAnimation(null);
                      } else {
                        // set all other animations to null
                        venues.forEach(function (obj) {
                            obj.marker.setAnimation(null);
                            obj.infowindow.close();
                        });
                        obj.infowindow.open(map, obj.marker);
                        obj.marker.setAnimation(google.maps.Animation.BOUNCE);
                      }
                      // make sure it doesn't bounce forever
                      // setTimeout(function(){ obj.marker.setAnimation(null); }, 1500);
                    }

                    //add dom listener
                    google.maps.event.addListener(obj.marker, 'click', function() {
                        map.setCenter(map.setCenter(obj.marker.getPosition()));
                        
                        // do some animation
                        obj.toggleBounce();
                    });

                    // push names into autcomplete list
                    self.listNames.push(obj.name);

                });
                self.listView(venues);

            }
        });
// second ajax call for info


    };
};
//places in the area


// MediaWikiAPI for Wikipedia
//articles on area via wikipedia or interesting facts?

// Google Maps Street View Service
// Google Maps
vm = new viewModel()
ko.applyBindings(vm);
vm.update();

// hide this unneeded feedback


//XWrite code required to add map markers identifying a number of locations your are interested in within this neighborhood.
//XImplement the search bar functionality to search and filter your map markers. There should be a filtering function on markers that already show up. Simply providing a search function through a third-party API is not enough.
//XImplement a list view of the identified locations.
//Add additional functionality using third-party APIs when a map marker, search result, or list view entry is clicked (ex. Yelp reviews, Wikipedia, StreetView/Flickr images, etc). If you need a refresher on making AJAX requests to third-party servers, check out our Intro to AJAX course.

// jquery things



