"use strict";

function onExploreClicked() {
  LOGIN_MGR.requestLogin("explore.html");
  return false;
}

function onCreateClicked() {
  LOGIN_MGR.requestLogin("create.html");
  return false;
}

function onShareClicked() {
  LOGIN_MGR.requestLogin("share.html");
  return false;
}

