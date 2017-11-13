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
    this.fbToken = window.localStorage.getItem("fbToken");
  }

  /**
   * Uses the given OAuth token for communicating with facebook.
   *
   * @param {object} tokenData The OAuth token data.
   */
  useAuthToken(tokenData) {
    window.localStorage.setItem("fbToken", tokenData);
    this.fbToken = tokenData;
  }

  /**
   * @return {bool} If the user is logged into facebook already.
   */
  isLoggedIn() {
    return this.fbToken !== null;
  }
}

var FB_MGR = new FbManager();
