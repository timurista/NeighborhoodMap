// TODO: figure out how to do custom bindings for map and ko, but I may use angular in future
// http://knockoutjs.com/documentation/custom-bindings.html
// http://knockoutjs.com/documentation/custom-bindings-controlling-descendant-bindings.html
// https://github.com/hoonzis/KoExtensions
// https://github.com/manuel-guilbault/knockout.google.maps

// global map variable using google maps api
var $map = $('#map-canvas');
var mapOptions = {
    center: { lat: -34.397, lng: 150.644},
};
var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

// view model to apply bindings
var viewModel = function () {
    var self = this;

    self.selectedVenue = ko.observable({
        name:'none',
        contact:{},
        url:'#',
        stats:{usersCount:0},
        wikiList:['none'],
        img:'#',
    });

    self.iconBase = 'https://maps.google.com/mapfiles/kml/pushpin/';
    self.resetIcons = function() {
        self.listView().forEach(function(item) {          
            item.marker.icon = self.iconBase + 'red-pushpin.png';
        });
    };

    self.clearMarkers = function() {
        self.listView().forEach(function(item) {
            item.marker.setMap(null);            
        });
    };
    // fix bounds of goolge map
    self.fitAllMarkers = function(listV) {
        Offline.check();
        var bounds = new google.maps.LatLngBounds();
        if (listV.length>0) {
            for(i=0;i<listV.length;i++) {
                bounds.extend(listV[i].marker.getPosition());
            }
            map.fitBounds(bounds);
        }            
    };

    self.filterText = ko.observable("");
    self.listNames = ko.observableArray();
    self.autocompleteAllowed = ko.observable(false);
    //set text depending on value of allowed autocomplete
    self.acToggleDisplay = ko.computed(function() {
        return (self.autocompleteAllowed()) ? ko.observable("AutoComplete Enabled") : ko.observable("AutoComplete Disabled");
    });

    self.location = ko.observable("4940 W Rosebay Dr, Tucson, AZ");
    //apply map bindings

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
        // set allMarkers to null
        self.clearMarkers();

        // string filter to filter our results by
        var filter = self.filterText().toLowerCase();
        if (!filter) {
            // set markers for everything in listview
            self.listView().forEach(function(item) {
                item.marker.setMap(map);
            });
            // return all results if filter doesn't exist
            self.fitAllMarkers(self.listView());
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
                else { return false; }
            });
            self.fitAllMarkers(filteredList);
            return filteredList;
        }
    }, self);
    self.update = function() {
        //FourSqaure API call
        self.clearMarkers();
        var fsURL = 'https://api.foursquare.com/v2/venues/search?near=' + self.location()+'&section=' + self.itemSearch() + '&oauth_token=NOFWGL5PTP4HRY3W1IODQGUKIAG1GA5BV2AOBVGGLJGV0HF4&v=20150318';
        //ajax call for the venues
        $.ajax({
            url: fsURL,
            dataType: "json",
            error: function (argument) {
                Offline.check();
                
            },
            success: function(response) {
                self.listView([]);
                updateLocation(self.location());
                map.setOptions({zoom: 14});
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

                    //sets wikipedia info to be injected in callback
                    obj.wikiList = ko.observableArray();
                    wikiAjaxCall(obj);
                    // var wikiList = wikiAjaxCall(obj);
                    obj.img = getStreetViewImage(obj);

                    var contentString ='<p>' + obj.name + '</p>';

                    var latLang = new google.maps.LatLng(obj.location.lat,obj.location.lng);
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString, //add content later, including wikipedia entries and streetview
                        size: new google.maps.Size(100, 50),
                        maxWidth: 200,
                        maxHeight: 100
                    });

                    var iconBase = 'https://maps.google.com/mapfiles/kml/pushpin/';
                    var newMarker = new google.maps.Marker({
                      position: obj.location,
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
                        console.log(obj.marker.icon);
                    }

                    // add animation options
                    obj.toggleBounce = function() {
                      if (obj.marker.getAnimation() !== null) {
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
                    };

                    //add dom listener
                    google.maps.event.addListener(obj.marker, 'click', function() {
                        //reset icons
                        self.resetIcons()
                        // change icon
                        obj.toggleColor();
                        // do some animation
                        obj.toggleBounce();
                        self.selectedVenue(obj);
                        map.setCenter(map.setCenter(obj.marker.getPosition()));
                    });

                    // push names into autcomplete list
                    self.listNames.push(obj.name);

                });
                self.listView(venues);
            }
        // check that if bad request, then user is shown information
        }).fail(function($faildata) {
            toastr.error("The place you entered cannot be found");
        });
        // I do this here to act as zoom for the retrieved information
        self.fitAllMarkers(self.listView());
    };    
};
vm = new viewModel();
ko.applyBindings(vm);
vm.update();

