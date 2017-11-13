"use strict"

window.fbAsyncInit = function() {
  FB.init({
    appId      : '507641596259132',
    xfbml      : true,
    version    : 'v2.11'
  });
  FB.AppEvents.logPageView();
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));

/**
 * Manages all communicatoins with Facebook.
 */
class FbManager {

  constructor() {
    // The user's login token. It's okay if it's null. null just means the user
    // is not yet logged in.
    this.fbToken = JSON.parse(window.localStorage.getItem("fbToken"));
    if (this.fbToken !== null) {
      this.useAuthToken(this.fbToken);
    }
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
    return this.fbToken !== null;
  }

  /**
   * Gets the user's created events for sharing.
   *
   * @param {function} Callback that will receive the events when they are
   *    received from Facebook.
   */
  getUserEvents(callback) {
    FB.api(
      this.apiPrefix + "/events?access_token=" + this.fbToken.accessToken,
      "get",
      {
        "access_token": this.fbToken.accessToken,
        "type:": "created"
      },
      function (response) {
        console.log(response);
      }
    );
  }
}

var FB_MGR = new FbManager();
