"use strict";

function onExploreClicked() {
  LOGIN.requestLogin("explore.html");
  return false;
}

function onShareClicked() {
  LOGIN.requestLogin("share.html");
  return false;
}
