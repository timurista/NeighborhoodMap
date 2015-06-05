/**
 * Generates a random number and returns it as a string for OAuthentication
 * @return {string}
 */

// yelp search query
var YELP_BASE_URL='http://api.yelp.com/v2/search/?';
//'term='+otac+'&location='+San Francisco, CA;

// API v2.0
var YELP_KEY = 'UvpeGpN8NJ3Rge_0z6GwgA';
var YELP_KEY_SECRET = 'AfRebu5_WYYCeLuj-0_eFifi5Tc';
var YELP_TOKEN = 'il-Ouc6rd25qOjX76jyVTupGn_5J3P14';
var YELP_TOKEN_SECRET = 'uy2PwjdgQTZxeXM3kgOMlvkFKS0';


// API v1.0 (deprecated)
// YWSID
// Key ZjW_gCX-boUBP8tNZtWr3w


function nonce_generate() {
  return (Math.floor(Math.random() * 1e12).toString());
}

var yelp_url = YELP_BASE_URL + 'business/' + self.selected_place().Yelp.business_id;

    var parameters = {
      oauth_consumer_key: YELP_KEY,
      oauth_token: YELP_TOKEN,
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version : '1.0',
      callback: 'cb'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    };

    var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
    parameters.oauth_signature = encodedSignature;

    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
      dataType: 'jsonp',
      success: function(results) {
        // Do stuff with results
      },
      fail: function() {
        // Do stuff on fail
      }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);