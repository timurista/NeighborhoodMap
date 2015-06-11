// updates/loads the map based on address by utilizing geocoding
var updateLocation = function(loc) {
	//get geocoder for converting address to lat/lang
	var geocoder = new google.maps.Geocoder();
	//update using jquery not knockout databinding
	var address = loc;
  // console.log(address)
  
  //geocoder converts address to geocode
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

          google.maps.event.addListener(marker, 'click', function() {
              infowindow.open(map, marker);
          });

          // deal with the bounds setting
          // var bounds = new google.maps.LatLngBounds();
          // map.fitBounds(bounds);
          // map.setZoom(16); 

        } else {
          alert("No results found");
        }
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }
};
