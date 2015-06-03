//TODO: get geocoding data from user
//TODO: render function to update location based on address
//TODO: sync render to dom event (change)
//TODO: integrate foursqaure geocoding data

  function initialize() {
  	//get geocoder for converting address to lat/lang
  	var geocoder = new google.maps.Geocoder();
  	//update using jquery
  	console.log($('#location').val())
  	var address = $('#location').val();
  	//map options origin
    var mapOptions = {
      center: { lat: -34.397, lng: 150.644},
      zoom: 14
    };
    // var map = new google.maps.Map(document.getElementById('map-canvas'),
    //     mapOptions);
    // $map= document.getElementById('map-canvas');
    // $map.style.height="300 px";
    // $map.style.width="66%";
    // $map.style.position="absolute";


    //geocoder dom example
  if (geocoder) {
    geocoder.geocode({
      'address': address
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
          map.setCenter(results[0].geometry.location);

          var infowindow = new google.maps.InfoWindow({
            content: '<b>' + address + '</b>',
            size: new google.maps.Size(150, 50)
          });

          var marker = new google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: address
          });

          //add multiple markers
          // viewModel.listView().forEach(function (obj) {
          // 	//console.log(obj.location.lat);
          // 	//console.log(obj.location.lng);
          //   var latLang = new google.maps.LatLng(obj.location.lat,obj.location.lng);
          //   var infowindow = new google.maps.InfoWindow({
          //       content: '<b>' + obj.name + '</b>', //add something later,
          //       size: new google.maps.Size(150, 50)
          //   });
          //   var newMarker = new google.maps.Marker({
          //     position: obj.location,
          //     map: map,
          //     title: obj.name //name of place 
          //   });
          //   obj.marker = newMarker;

          //   //add dom listener
          //   google.maps.event.addListener(newMarker, 'click', function() { infowindow.open(map, newMarker);});
          // });

        } else {
          alert("No results found");
        }
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }
}
google.maps.event.addDomListener(window, 'load', initialize);
google.maps.event.addDomListener(document.getElementById('submit'), 'click', function () {
    initialize();
    // map.setCenter(new google.maps.LatLng(10.23,123.45));
});
//render function
//need to render change in dom to change in map

