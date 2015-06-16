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
        url:'',
        stats:{usersCount:0},
        wikiList:['none'],
        image_url:'#',
        rating:'',
        rating_img_url_small:'',
        snippet_text:'',
    });

    // toggles visiblity
    self.showHide = function(viewModel, event) {
        var offClass = 'glyphicon-minus';
        var onClass = 'glyphicon-plus';
        var icon = $(event.currentTarget).find('.glyphicon');
        if (icon.hasClass(offClass)) {
            $(event.currentTarget).siblings().slideUp();
        } else {
            $(event.currentTarget).siblings().slideDown();
        }
        icon.toggleClass(onClass);
        icon.toggleClass(offClass);
    };

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
    self.itemSearch = ko.observable("drinks");
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
            // make markers fit on google map
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
                var venues = response.response.venues.slice(1, -1);
                console.log('veneus from FourSqaure loaded:',venues);

                // here we associate a map marker with each venue and append it to google maps
                venues.forEach(function (obj) {
                    obj.rating='';
                    obj.rating_img_url='';
                    obj.snippet_text='';
                    // setting url for website to be # if not defined
                    obj.url = (typeof obj.url === 'undefined') ? '' : obj.url;
                    //sets wikipedia info to be injected in callback
                    obj.wikiList = ko.observableArray();
                    wikiAjaxCall(obj);
                    obj.image_url = getStreetViewImage(obj);
                    // set options for marker, load it, etc.
                    obj = setMarkerOptions(self,obj,obj.location);                    
                    // push names into autcomplete list
                    self.listNames.push(obj.name);
                    // add the venue
                    self.listView.push(obj);
                });
            }
        // check that if bad request, then user is shown information
        }).fail(function($faildata) {
            toastr.error("The place you entered cannot be found");
        });

        // Second ajaxCalls, this takes a callback function to handle a success
        yelpAjaxCall(self.itemSearch(),self.location(),
            function(results) {
                console.log('businesses loaded:',results.businesses);
                results.businesses.forEach( function(obj) {
                    var id = containsObjectWithName(self.listView(),obj.name);
                    if (id>-1) {
                        // update information if obj is already in listView
                        self.listView()[id].url = obj.url;
                        self.listView()[id].rating = obj.rating;
                        self.listView()[id].rating_img_url = obj.rating_img_url;
                        self.listView()[id].snippet_text = obj.snippet_text;

                    } else {
                        // add this new obj to the listView
                        // content for info or display div
                        obj.contact = {};
                        obj.contact.formattedPhone = obj.display_phone;
                        obj.contact.facebookName = obj.name;
                        obj.stats = {};
                        obj.stats.usersCount = obj.review_count;
                        obj.url = (typeof obj.url === 'undefined') ? '#' : obj.url;

                        //sets wikipedia info to be injected in callback
                        obj.wikiList = ko.observableArray();
                        wikiAjaxCall(obj);

                        // to handle location google map info
                        var latLang = new google.maps.LatLng(obj.location.coordinate.latitude,
                            obj.location.coordinate.longitude);
                        obj = setMarkerOptions(self,obj,latLang);
                        // push names into autcomplete list
                        self.listNames.push(obj.name);
                    }
                    // add the business
                    self.listView.push(obj);
                });
            });
        // This zooms in on the retrieved information
        self.fitAllMarkers(self.listView());
    };
};
vm = new viewModel();
ko.applyBindings(vm);
vm.update();

