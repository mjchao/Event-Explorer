"use strict";

$.getScript("js/fb.js");
$.getScript("js/login.js");

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
   * @param parentContainer {HTML elem} The container to which to add this
   *    EventList
   */
  addToContainer(parentContainer) {
    parentContainer.appendChild(this.listDiv_);
  }

  /**
   * Adds the given EventDisplay to this EventList
   *
   * @param eventDisplay {object} The event's data returned by Facebook.
   */
  addEventDisplay(eventData) {
    var newEvent = new EventDisplay(eventData);
    this.eventDisplays_.push(newEvent);
    this.listDiv_.appendChild(newEvent.eventDiv_);
    newEvent.parentEventList_ = this;
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
   * @param eventData {JSON object} Response returned by FB with data about
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
   * @param selected {bool} If this event has been selected by the user.
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
 * Represents the list of "Who can see your event?" list of restrictions
 * that the user has defined.
 */
class RestrictionList {

  /**
   * Creates a RestrictionList.
   */
  constructor() {
    this.listDiv_ = $("<div>",
      {
        "class": "restrictions-list"
      }
    )[0];
    this.restrictions_ = [];
  }

  /**
   * Adds the graphical representation of this list to a parent container.
   *
   * @param parentContainer {HTML elem} The parent container.
   */
  addToContainer(parentContainer) {
    parentContainer.appendChild(this.listDiv_);
  }

  /**
   * Adds a restriction selector to this lsit
   */
  addRestrictionSelector() {
    if (this.restrictions_.length == 0) {
      var newRestriction = new RestrictionSelector(true);
    } else {
      var newRestriction = new RestrictionSelector(false);
    }
    this.restrictions_.push(newRestriction);
    this.listDiv_.appendChild(newRestriction.selectorContainer_);
  }
}

/**
 * Manages interactions with one dropdown box for selecting a restriction
 * on who can see the event.
 */
class RestrictionSelector {

  constructor(isFirst) {

    // Outer div containing everything.
    this.selectorContainer_ = $("<div>",
      {
        "class": "select-restriction"
      }
    )[0];

    if (!isFirst) {
      // "OR" text that is displayed between restrictions to indicate that
      // restrictions are "OR" - not "AND"
      this.orText_ = $("<h3>",
        {
          "text": "OR"
        }
      )[0];
      this.selectorContainer_.appendChild(this.orText_);
    }

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

    if (!isFirst) {
      // Button for removing the restriction
      this.removeButton_ = $("<a>",
        {
          "class": "btn remove-restriction",
          "text": "-",
          "href": "#",
          "click":
            // Javascript gets pretty messed up when trying to add an onClick
            // callback. "this" becomes the button itself, so we need to
            // pass in a reference to the actual RestrictionSelector object.
            (function(_this) {
              return function(e) {
                e.preventDefault();
                var parentElement = _this.selectorContainer_.parentElement;
                if (parentElement !== null) {
                  parentElement.removeChild(_this.selectorContainer_);
                }
              }
            })(_this)
        }
      )[0];
      this.selectorContainer_.appendChild(this.removeButton_);
    }
  }
}

RestrictionSelector.RESTRICTION_ANYONE = "Anyone";
RestrictionSelector.RESTRICTION_FRIEND = "Anyone who is my friend";
RestrictionSelector.RESTRICTIONS = [
  RestrictionSelector.RESTRICTION_ANYONE,
  RestrictionSelector.RESTRICTION_FRIEND,
];

/**
 * Manages the page for setting up an event to share.
 */
class ShareManager {

  constructor() {

    // Banner on which any errors will be displayed
    this.errorBanner_ = new ErrorBanner();
    this.errorBanner_.addToContainer(document.querySelector("body"));

    // The event selector list
    this.selectEventDiv_ = document.querySelector(".select-event");
    this.eventList_ = new EventList();
    this.eventList_.addToContainer(this.selectEventDiv_);

    // Button that you can click to add more restrictions to the
    // "Who can see your event?" list.
    this.addRestrictionBtn_ = document.querySelector(".add-restriction");
    this.addRestrictionBtn_.addEventListener("click",
      function (e) {
        e.preventDefault();
        SHARE_MGR.addRestrictionSelector();
      }
    );

    // The "who can see your event?" list of restrictions
    this.setRestrictionsDiv_ = document.querySelector(".set-restrictions");
    this.restrictionList_ = new RestrictionList();
    this.restrictionList_.addToContainer(this.setRestrictionsDiv_);

    // The "Share" button
    this.shareBtn_ = document.querySelector(".share.btn");
    this.shareBtn_.addEventListener("click",
      (function(_this) {
        return function(e) {
          _this.share();
        }
      }(this))
    );
  }

  /**
   * Adds an event to the list of events that the user can choose from.
   *
   * @param eventData {object} The event data, e.g. title and time, that was
   *    received from Facebook.
   */
  addEvent(eventData) {
    this.eventList_.addEventDisplay(eventData);
  }

  /**
   * Load all of this user's events.
   */
  loadEvents() {
    FB_MGR.getUserEvents(
      function(events) {

        // load events in alphabetical order so it's easier for the user
        // to find the one s/he is looking for.
        events.data.sort(function(x, y) {
          var xName = x.name.toUpperCase();
          var yName = y.name.toUpperCase();
          if (x.name < y.name) {
            return -1;
          }
          if (y.name < x.name) {
            return 1;
          }
          return 0;
        });

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
    this.addRestrictionSelector();
  }

  /**
   * Adds a dropdown from which the user can select a restriction.
   */
  addRestrictionSelector() {
    this.restrictionList_.addRestrictionSelector();
  }

  /**
   * Notifies the backend server of the event the user wishes to share
   */
  share() {
    // TODO transact with backend server
    this.errorBanner_.showError("Not Implemented Yet");
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
