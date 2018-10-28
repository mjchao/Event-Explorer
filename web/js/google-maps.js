$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAIxqt0YVEceSbkM1IXP6xJQlC8VXABPas&callback=onGoogleMapsLoaded");


/**
 * Keeps track of instances of google maps that have yet to be drawn because
 * the API wasn't loaded yet.
 */
var uninitialized_map_manager_instances_ = [];
var map_api_initialized_ = false;

/**
 * Manages all communications with google maps API for one specific map.
 */
class MapManager {

  constructor(map_elem) {
    this.map_elem_ = map_elem;
    if (!map_api_initialized_) {
      uninitialized_map_manager_instances_.push(this);
    }
  }

  /**
   * Draws the google map. Call this once the google maps API is loaded.
   */
  displayMap() {
    this.map_ = new google.maps.Map(this.map_elem_, {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    });
  }
}

function onGoogleMapsLoaded() {
  map_api_initialized_ = true;
  for (var i = 0; i < uninitialized_map_manager_instances_.length; ++i) {
    uninitialized_map_manager_instances_[i].displayMap();
  }
}

