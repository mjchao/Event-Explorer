"use strict"

class LoginManager {

  constructor() {
    // The login html element
    this.loginInterface_ = document.querySelector(".login");

    // Page to redirect to upon successful login.
    this.loginRedirect_ = undefined;
  }

  /**
   * @return {bool} If the user is logged in.
   */
  isLoggedIn() {
    return false;
  }

  /**
   * Shows the login panel.
   */
  showLoginInterface() {
    this.loginInterface_.classList.remove("hidden");
  }

  /**
   * Hides the login panel.
   */
  hideLoginInterface() {
    this.loginInterface_.classList.add("hidden");
  }

  /**
   * Requests the user to login if they are not already. If they are already
   * logged in, the user will be directed to the redirect page.
   *
   * @param {string} redirect Page to redirect to upon successful login. Leave
   *    as undefined if no redirect needed.
   */
  requestLogin(redirect) {
    if (!this.isLoggedIn()) {
      this.showLoginInterface();
    }
    else {
      this.loginRedirect_ = redirect;
      this.redirectOnLogin();
    }
  }

  /**
   * Redirects to the intended URL after login is successful.
   */
  redirectOnLogin() {
    if (this.loginRedirect_ !== undefined) {
      window.location.redirect(this.loginRedirect_);
    }
    this.loginRedirect_ = undefined;
  }
}

var LOGIN = new LoginManager();
console.log("Login imported");

