"use strict";

/**
 * Displays an error in a conspicuous banner that eventually fades out.
 */
class ErrorBanner {

  /**
   * Creates an undisplayed error banner.
   */
  constructor() {
    this.errorDiv_ = $("<div>",
      {
        "class": "error-banner",
      }
    )[0];
    this.errorMsg_ = $("<p>",
      {
        "class": "error-msg"
      }
    )[0];
    this.errorDiv_.appendChild(this.errorMsg_);
  }

  /**
   * Adds this ErrorBanner to a parent container
   *
   * @param parentContainer {HTML elem} The container to which to add this
   *    ErrorBanner
   */
  addToContainer(parentContainer) {
    parentContainer.appendChild(this.errorDiv_);
    $(".error-banner").hide();
  }

  /**
   * Displays an ErrorMessage in this banner
   *
   * @param msg {string} The error message to display.
   */
  showError(msg) {
    $(".error-banner").stop().fadeIn().stop(true, true).fadeOut(10000);
    this.errorMsg_.innerHTML = msg;
  }
}

