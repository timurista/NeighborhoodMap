// updates/loads the map based on address by utilizing geocoding
function update() {
	//get geocoder for converting address to lat/lang
	var geocoder = new google.maps.Geocoder();
	//update using jquery not knockout databinding
	var address = $('#location').val();
  
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

        } else {
          alert("No results found");
        }
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  };
}

// on load run the initialization
google.maps.event.addDomListener(window, 'load', update);
google.maps.event.addDomListener(document.getElementById('submit'), 'click', function () {
  update();
});

