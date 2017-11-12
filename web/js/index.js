"use strict";

$.getScript("js/login.js");
$.getScript("js/nav.js");

function statusChangeCallback(response) {
	console.log(response);
}

function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}
