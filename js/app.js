// global map variable using google maps api
var mapOptions = {
    center: { lat: -34.397, lng: 150.644},
    zoom: 14
};
var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

// view model to apply bindings
var viewModel = function () {
    var self = this;
    self.filterText = ko.observable("");
    self.listNames = ko.observableArray([]);
    self.autocompleteAllowed = ko.observable(false);
    //set text depending on value of allowed autocomplete
    self.acToggleDisplay = ko.computed(function() {
        return (self.autocompleteAllowed()) ? ko.observable("AutoComplete Enabled") : ko.observable("AutoComplete Disabled");
    });

    self.location = ko.observable("4940 W Rosebay Dr, Tucson, AZ");
    self.itemSearch = ko.observable("drinks");
    self.searchTerm = ko.observable("Burger");
    self.listView = ko.observableArray([]);

    //assigns class based on css
    self.acButton = ko.pureComputed(function() {
        return self.autocompleteAllowed() ? "btn-default" : "btn-disabled";
    });

    //flag for autocomplete
    self.toggleAutoComplete = function() {
        if (!self.autocompleteAllowed()) {
            self.autocompleteAllowed(true);
            $("#filter").autocomplete({ source: self.listNames() });
            // because of a bug with chrome, 2 input fields must be created simulating autoComplete enable and disable
            $("#filter").show();
            // filter without autoCompletes
            $("#acDisabledFilter").hide();
        } else {
            self.autocompleteAllowed(false);
            $("#filter").attr('autocomplete', 'off');
            $("#filter").hide();

            // filter without autoComplete
            $("#acDisabledFilter").show();
        }
        // hides annoying message
        $('.ui-helper-hidden-accessible').hide();
    };
    self.filteredResults = ko.computed(function () {
        // string filter to filter our results by
        var filter = self.filterText().toLowerCase();
        if (!filter) {
            // set markers for everything in listview
            self.listView().forEach(function(item) {
                item.marker.setMap(map);
            });
            // return all results if filter doesn't exist
            return self.listView();
        }
        else {
            var filteredList = ko.utils.arrayFilter(self.listView(), function (item) {
                // we could use string starts with to only show items which start with the items the user enters,
                // but the below example is a lazy search approach to return more results
                if (stringContains(item.name.toLowerCase(), filter)) {
                    // if item shows up check marker then set map to marker
                    if (item.marker) {
                        item.marker.setMap(map);
                    }
                    // return so it can be displayed
                    return true;
                }
                // else this will remove markers from the map if not in filter
                else { item.marker.setMap(null); return false };
            });
            return filteredList;
        };
    }, self);
    self.update = function() {
        //FourSqaure API call
        var fsURL = 'https://api.foursquare.com/v2/venues/search?near=' + self.location()+'&section=' + self.itemSearch() + '&oauth_token=NOFWGL5PTP4HRY3W1IODQGUKIAG1GA5BV2AOBVGGLJGV0HF4&v=20150318';

        //ajax call for the venues
        $.ajax({
            url: fsURL,
            dataType: "json",
            success: function(response) {
                console.log(response.response);
                var venues = response.response.venues.slice(1, -1);

                // here we associate a map marker with each venue and append it to google maps                
                venues.forEach(function (obj) {
                    // content for info window
                    var phone = (typeof obj.contact.formattedPhone === 'undefined') ? 'No Contact Information' : obj.contact.formattedPhone;
                    var fbook = (typeof obj.contact.facebookName === 'undefined') ? 'None' : obj.contact.facebookName;
                    var users = (typeof obj.stats.usersCount === 'undefined') ? 'No User Information' : obj.stats.usersCount;
                    var webLink = (typeof obj.url === 'undefined') ? 'No Website' : '<a href="'+obj.url+'">Website</a>';
                    var here = obj.hereNow.summary;

                    //sets wikipedia info
                    var wikiList = wikiAjaxCall(obj);
                    obj.img = getStreetViewImage(obj);

                    var contentString =
                      '<h2 id="firstHeading" class="firstHeading">' + obj.name + '</h2>' +
                      '<div id="bodyContent">' +
                      obj.img +
                      '<p>' + here + '</p>' +
                      '<p><em>' + phone + '</em></p>' +
                      '<p>Facebook name: ' + fbook + '</p>' +
                      '<p>' + webLink + '</p>' +
                      '<p>Number of Users: <strong>' + users + '</strong></p>' +
                      wikiList +
                      '</div>';

                    var latLang = new google.maps.LatLng(obj.location.lat,obj.location.lng);
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString, //add content later, including wikipedia entries and streetview
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
                        // set all other animations to null so only one is bouncing and showing info
                        venues.forEach(function (obj) {
                            obj.marker.setAnimation(null);
                            obj.infowindow.close();
                        });
                        // uses the stored info window to associate marker with info
                        obj.infowindow.open(map, obj.marker);
                        obj.marker.setAnimation(google.maps.Animation.BOUNCE);
                      }
                      // OPTIONAL: make sure it doesn't bounce forever
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
// TODO: second ajax call for Yelp info
    };
};

vm = new viewModel()
ko.applyBindings(vm);
vm.update();

