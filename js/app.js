var viewModel = {
	location:ko.observable("4940 W Rosebay Dr, Tucson, AZ"),
	listView:ko.observable([]),
};
console.log(viewModel.location());
// Foursquare API
//places in the area
//FourSqaure API call
var loc = viewModel.location();
var sec = "drinks";
var fsURL = 'https://api.foursquare.com/v2/venues/search?near='+loc+'&section='+sec+'&oauth_token=NOFWGL5PTP4HRY3W1IODQGUKIAG1GA5BV2AOBVGGLJGV0HF4&v=20150318';

//ajax call
$.ajax({
    url: fsURL,
    dataType: "json",
    success: function(response){
    	console.log(response);
        //var venue = response[1];
        console.log(response["response"]);
        venues = response["response"]["venues"].slice(1,-1);
        viewModel.listView(venues);
    }
});


// MediaWikiAPI for Wikipedia
//articles on area via wikipedia or interesting facts?

// Google Maps Street View Service
// Google Maps

ko.applyBindings(viewModel);

//X Review our course JavaScript Design Patterns.
//X Download the Knockout framework.
//X Write code required to add a full-screen map to your page using the Google Maps API.
//Write code required to add map markers identifying a number of locations your are interested in within this neighborhood.
//Implement the search bar functionality to search and filter your map markers. There should be a filtering function on markers that already show up. Simply providing a search function through a third-party API is not enough.
//Implement a list view of the identified locations.
//Add additional functionality using third-party APIs when a map marker, search result, or list view entry is clicked (ex. Yelp reviews, Wikipedia, StreetView/Flickr images, etc). If you need a refresher on making AJAX requests to third-party servers, check out our Intro to AJAX course.