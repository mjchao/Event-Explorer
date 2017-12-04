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
   * @param {object} The event data, e.g. title and time, that was received
   *    from Facebook.
   */
  addEvent(eventData) {
    console.log(eventData);
    var eventUrl = FB_MGR.buildUrl("/events/" + eventData.id);
    var newEventDiv = $("<div>",
      {
        "class": "event",
        "onclick": "window.open('" + eventUrl + "', '_blank')",
      }
    )[0];

    // Load the title of the event.
    var eventTitleElement = $("<h3>",
      {
        "class": "event-title",
        "text": eventData.name
      }
    )[0];
    newEventDiv.appendChild(eventTitleElement);

    // Load the picture of the event.
    var eventPictureElement = $("<img>",
      {
        "class": "event-cover",
        "src": ""
      }
    )[0];

    FB_MGR.getEventPicture(eventData.id,
      (function(imgToUpdate) {
        return function(pictureData) {
          imgToUpdate.src = pictureData.data.url;
          console.log(imgToUpdate.src);
        }
      })(eventPictureElement)
    );
    newEventDiv.appendChild(eventPictureElement);

    // Add all the event data to the event list.
    this.eventList_.appendChild(newEventDiv);
  }

  /**
   * Load all of this user's events.
   */
  loadEvents() {
    while (this.eventList_.hasChildNodes()) {
      this.eventList_.removeChild(this.eventList_.lastChild);
    }
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
