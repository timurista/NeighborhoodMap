# Neighborhood Map Project
Version 1.1
A map of the surrounding area of a specific location and this map loads a searchable list of interesting places as well as contact information for those places and ratings (when available) through yelp.

# How to Run
- Run the index.html file from the dist/ folder which included minified css and js. You should run the index.html through a local server to make sure that you can test the offline functionality.

- As it loads, you will see an input to filter search results, a location to search for, and a category or item to search for as well. This script uses foursqaure api to search for a list of results and return those to the user

- By typing words into the search bar and pressing enter, you can filter for certain names of places that contain a certain phrase. Note: this search bar uses "fuzzy searching" to give users more results including names of places with part of the search term inside it.

- To change the location of the map, type in the Location input box and then click the "change location" button.

- If you have a hard time seeing the map, the search bar and display information row are collapsable. The results are also collapsable by clicking on the Results header.

# Other Features
The user can turn on auto-complete which utilizes jquery autocomplete from a list of names of loaded venues.
By default this is turned off because it requires the user to click outside the input box to update the list of filtered results, but it can be turned on by clicking the "Auto-Complete Disabled" button.

# Loaded Markers
Each venue is loaded into google maps with an associated marker and infowindow. The infowindow includes streetview image if available, wikipedia articles, name of the location, contact information (phone, facebook, website), rating (through yelp), short snippet of a longer review and list of current users. Clicking on the website will take you to an alternate website.

# Areas to Improve
Use bower to load the resources used and integrate it with gulp to serve the user files.
Create default object with prototype functions to store venue information.

# List of resources used:
- udacity frontend developer courses
- jquery documentation
- knockoutjs documentation
- google maps api v 2.0
- foursqaure api
- google maps streetview api
- gulp website online
- stackoverflow
- wikipedia articles api (also shown in frontend course)
- yelp api 2.0 using oauth 1.0

MIT License