"use strict"

/**
 * Manages all communications with Facebook.
 */
class FbManager {

  constructor() {

    // Functions that are deferred until Facebook API is initialized.
    this.deferredFunctions_ = [];

    // The user's login token. It's okay if it's null. null just means the user
    // is not yet logged in.
    this.fbToken = JSON.parse(window.localStorage.getItem("fbToken"));
    if (this.fbToken !== null) {
      this.useAuthToken(this.fbToken);
    }
  }

  /**
   * Defers the given function until the Facebook API is initialized.
   *
   * @param {function} f A function to defer.
   */
  deferUntilConnected(f) {
    if (typeof FB === "undefined") {
      this.deferredFunctions_.push(f);
    }
    else {

      // Facebook API already initialized.
      f();
    }
  }

  /**
   * Runs all functions that have been deferred until after the Facebook API
   * is set up.
   */
  runDeferredFunctions() {
    for (var i = 0; i < this.deferredFunctions_.length; ++i) {
      this.deferredFunctions_[i]();
    }
    this.deferredFunctions_ = [];
  }

  /**
   * Uses the given OAuth token for communicating with facebook.
   *
   * @param {object} tokenData The OAuth token data.
   */
  useAuthToken(tokenData) {
    window.localStorage.setItem("fbToken", JSON.stringify(tokenData));
    this.fbToken = tokenData;
    this.apiPrefix = "/" + this.fbToken.userID;
  }

  /**
   * @return {bool} If the user is logged into facebook already.
   */
  isLoggedIn() {
    return this.fbToken !== undefined &&
      this.fbToken !== null &&
      this.fbToken.expiresIn > 0;
  }

  /**
   * Builds the URL to a given facebook page.
   *
   * @param {string} route A route on the Facebook website to hit, e.g.
   *    /events/123456
   */
  buildUrl(route) {
    return "https://www.facebook.com" + route;
  }

  /**
   * Gets the user's created events for sharing.
   *
   * @param {function} callback Callback that will receive the events when they
   *    are received from Facebook.
   */
  getUserEvents(callback) {
    FB.api(
      "/me/events",
      "get",
      {
        "access_token": this.fbToken.accessToken,
        "type:": "created"
      },
      function(response) {
        callback(response);
      }
    );
  }

  /**
   * Gets the data for a specific event.
   *
   * @param {string} eventId The facebook event ID.
   * @param {function} callback The callback to execute with the event data.
   */
  getEvent(eventId, callback) {
    FB.api(
      "/" + eventId,
      "get",
      {
        "access_token": this.fbToken.accessToken
      },
      function(response) {
        callback(response);
      }
    );
  }

  /**
   * Gets the cover picture for a specific event.
   *
   * @param {string} eventId The facebook event ID.
   * @param {function} callback The callback to execute with the event data.
   */
  getEventPicture(eventId, callback) {
    FB.api(
      "/" + eventId + "/picture",
      "get",
      {
        "access_token": this.fbToken.accessToken
      },
      function(response) {
        callback(response);
      }
    );
  }
}

var FB_MGR = new FbManager();

/**
 * Verifies the FB Manager's saved access token if it exists. If access token
 * is not valid (i.e. expired session or tampered by with user), it is cleared.
 */
function verifyFbMgrSavedToken() {
  if (FB_MGR.fbToken === null ||
      FB_MGR.fbToken.accessToken === null) {
    FB_MGR.runDeferredFunctions();
    return;
  }

  // check if token is expired
  FB.api(
    "/me",
    "get",
    {
      "access_token": FB_MGR.fbToken.accessToken
    },
    function(response) {
      console.log(response);
      if (response.error !== undefined) {
        FB_MGR.fbToken = undefined;
        window.localStorage.removeItem("fbToken");
      }

      // Deferred functions may depend on the appropriate login state of
      // FB_MGR. We need to check the token to determine the appropriate
      // logged-in state before running any deferred functions.
      FB_MGR.runDeferredFunctions();
    }
  );
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '507641596259132',
    xfbml      : true,
    version    : 'v2.11'
  });
  FB.AppEvents.logPageView();
  verifyFbMgrSavedToken();
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
