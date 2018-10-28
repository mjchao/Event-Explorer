"use strict";
$.getScript("/js/google-maps.js");

var EXPLORE_MAP_MGR = undefined;

$(document).ready(function() {
  console.log(document.getElementsByClassName("google-map")[0]);
  EXPLORE_MAP_MGR = new MapManager(document.getElementsByClassName("google-map")[0]);
});


