"use strict";

$.getScript("js/fb.js");
$.getScript("js/login.js");

/**
 * Manages interactions with one dropdown box for selecting a restriction
 * on who can see the event.
 */
class RestrictionSelector {

  constructor() {

    // "OR" text that is displayed between restrictions to indicate that
    // restrictions are "OR" - not "AND"
    this.orText_ = $("<h3>",
      {
        "text": "OR"
      }
    )[0];

    // Outer div containing everything.
    this.selectorContainer_ = $("<div>",
      {
        "class": "select-restriction"
      }
    )[0];

    // Groups the individual options that the user can pick from.
    this.selectorGroup_ = $("<select>")[0];
    this.selectorContainer_.appendChild(this.selectorGroup_);

    // List containing all the individual options the user can pick from.
    this.restrictOptions_ = []
    for (var i = 0; i < RestrictionSelector.RESTRICTIONS.length; ++i) {
      var newOption = $("<option>",
        {
          "text": RestrictionSelector.RESTRICTIONS[i]
        }
      )[0];
      this.restrictOptions_.push(newOption);
      this.selectorGroup_.appendChild(newOption);
    }

    var _this = this;

    // Button for removing the restriction
    this.removeButton_ = $("<button>",
      {
        "class": "remove-restriction",
        "text": "-",
        "href": "#",
        "click":
          // Javascript gets pretty messed up when trying to add an onClick
          // callback. "this" becomes the button itself, so we need to
          // pass in a reference to the actual RestrictionSelector object.
          (function(_this) {
            return function() {
              var parentElement = _this.selectorContainer_.parentElement;
              if (parentElement !== null) {
                parentElement.removeChild(_this.selectorContainer_);
                parentElement.removeChild(_this.orText_);
              }
            }
          })(_this)
      }
    )[0];
    this.selectorContainer_.appendChild(this.removeButton_);
  }

  /**
   * Adds this RestrictionSelector to a parent container
   *
   * @param parentContainer [HTML elem] The container to which to add this
   *    RestrictionSelector
   */
  addToContainer(parentContainer) {

    if (parentContainer.hasChildNodes()) {

      // Separate different RestrictionSelectors with "OR" to clarify that
      // the people who can see the event only need to satisfy at least one
      // of the restrictions.
      parentContainer.appendChild(this.orText_);
    } else {

      // The first RestrictionSelector to be added cannot be removed. There
      // needs to be at least one restriction.
      this.selectorContainer_.removeChild(this.removeButton_);
    }
    parentContainer.appendChild(this.selectorContainer_);
  }
}

RestrictionSelector.RESTRICTION_ANYONE = "Anyone";
RestrictionSelector.RESTRICTION_GROUP = "Anyone belonging to this group";
RestrictionSelector.RESTRICTION_FRIEND = "Anyone who is my friend";
RestrictionSelector.RESTRICTION_FRIEND_GROUP =
  "Anyone who is a friend in this group";
RestrictionSelector.RESTRICTIONS = [
  RestrictionSelector.RESTRICTION_ANYONE,
  RestrictionSelector.RESTRICTION_GROUP,
  RestrictionSelector.RESTRICTION_FRIEND,
  RestrictionSelector.RESTRICTION_FRIEND_GROUP
];

/**
 * Represents the list of Events that the user can choose to share.
 */
class EventList {

  /**
   * Creates an empty EventList component.
   */
  constructor() {
    this.listDiv_ = $("<div>",
      {
        "class": "event-list"
      }
    )[0];
    this.eventDisplays_ = [];
  }

  /**
   * Adds this EventList to a parent container
   *
   * @param parentContainer [HTML elem] The container to which to add this
   *    EventList
   */
  addToContainer(parentContainer) {
    parentContainer.appendChild(this.listDiv_);
  }

  /**
   * Adds the given EventDisplay to this EventList
   *
   * @param eventDisplay [EventDisplay] The EventDisplay to add
   */
  addEventDisplay(eventDisplay) {
    this.eventDisplays_.push(eventDisplay);
    this.listDiv_.appendChild(eventDisplay.eventDiv_);
    eventDisplay.parentEventList_ = this;
  }

  /**
   * Unselects all the EventDisplays that are contained in this EventList
   */
  unselectAll() {
    for(var i = 0; i < this.eventDisplays_.length; ++i) {
      this.eventDisplays_[i].setSelected(false);
    }
  }
}

/**
 * Manages interactions with one event in the list of events.
 */
class EventDisplay {

  /**
   * @param eventData [JSON object] Response returned by FB with data about
   *    an event.
   */
  constructor(eventData) {
    var _this = this;
    var eventUrl = FB_MGR.buildUrl("/events/" + eventData.id);
    this.eventDiv_ = $("<div>",
      {
        "class": "event",
        "click":
          (function(_this) {
            return function() {
              _this.setSelected(true);
            }
          })(_this),
        //"onclick": "window.open('" + eventUrl + "', '_blank')",
      }
    )[0];

    this.eventTitle_ = $("<h3>",
      {
        "class": "event-title",
        "text": eventData.name,
      }
    )[0];
    this.eventDiv_.appendChild(this.eventTitle_);

    this.eventPicture_ = $("<img>",
      {
        "class": "event-picture",
        "src": "",
      }
    )[0];
    this.eventDiv_.appendChild(this.eventPicture_);

    FB_MGR.getEventPicture(eventData.id,
      (function(eventPicture) {
        return function(pictureData) {
          if (pictureData.cover !== undefined ) {
            eventPicture.src = pictureData.cover.source;
          } else {
            eventPicture.classList.add("missing-cover-img");
          }
        }
      })(this.eventPicture_)
    );

    this.eventLink_ = $("<a>",
      {
        "class": "btn event-link",
        "text": "View on Facebook",
        "click": function(e) {
            // Don't trigger the parent div's click that will cause this
            // event to be selected. If the user wants to view the event on
            // Facebook, they probably aren't sure they want to select the
            // event yet.
            e.stopPropagation();
          },
        "onclick": "window.open('" + eventUrl + "', '_blank')"
      }
    )[0];
    this.eventDiv_.appendChild(this.eventLink_);
  }

  /**
   * Indicate whether or not this event has been selected by the user.
   *
   * @param selected [bool] If this event has been selected by the user.
   */
  setSelected(selected) {
    if (selected == true ) {
      this.parentEventList_.unselectAll();
      this.eventDiv_.classList.add("selected");
    } else {
      this.eventDiv_.classList.remove("selected");
    }
  }
}

/**
 * Manages the page for setting up an event to share.
 */
class ShareManager {

  constructor() {
    this.shareForm_ = document.querySelector(".select-event");

    // The event selector list
    this.eventList_ = new EventList();
    this.eventList_.addToContainer(this.shareForm_);

    // The "who can see your event?" list of restrictions
    this.restrictionsList_ = document.querySelector(".restrictions-list");
  }

  /**
   * Adds an event to the list of events that the user can choose from.
   *
   * @param {object} The event data, e.g. title and time, that was received
   *    from Facebook.
   */
  addEvent(eventData) {
    var newEvent = new EventDisplay(eventData);
    this.eventList_.addEventDisplay(newEvent);
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

  /**
   * Loads the panel in which the user can specify who can see their event.
   */
  loadRestrictions() {
    while (this.restrictionsList_.hasChildNodes()) {
      this.restrictionsList_.removeChild(this.restrictionsList_.lastChild);
    }
    this.addRestrictionSelector();
  }

  /**
   * Adds another restriction to the list of restrictions.
   */
  addRestrictionSelector() {
    var selector = new RestrictionSelector();
    selector.addToContainer(this.restrictionsList_);
  }
}

// Need to wait until FB is initialized because we need to query FB to load
// all the events the user can choose to share.
var SHARE_MGR = new ShareManager();
$(document).ready(function() {
  FB_MGR.deferUntilConnected(
    function() {
      if (FB_MGR.isLoggedIn()) {
        SHARE_MGR.loadEvents();
        SHARE_MGR.loadRestrictions();
      }
      else {
        LOGIN_MGR.requestLogin("share.html");
      }
    }
  );
});
