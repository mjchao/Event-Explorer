"use strict";

$.getScript("js/fb.js");

class ShareManager {

  constructor() {
    // The event selector list
    this.eventList_ = document.querySelector(".event-list");
  }

  /**
   * Adds an event to the list of events that the user can choose from.
   *
   * @param {object} The event data, e.g. title and time.
   */
  addEvent(eventData) {
    //TODO Add events to list.
    console.log("Adding event");
    console.log(eventData);
    var newEventPanel = $("div", {"class": "event"});
  }

  /**
   * Load all of this user's events.
   */
  loadEvents() {
    FB_MGR.getUserEvents(
      function(events) {
        for (var i = 0; i < events.data.length; ++i) {
          SHARE_MGR.addEvent(events.data[i]);
        }
      }
    );
  }
}

var SHARE_MGR = new ShareManager();
$(document).ready(function() {
  FB_MGR.deferUntilConnected(
    function() {
      SHARE_MGR.loadEvents();
    }
  );
});
