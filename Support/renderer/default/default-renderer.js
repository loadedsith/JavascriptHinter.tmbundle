/* eslint-env browser */
/* global bundleVersion */

/**
 * Helps in handles auto updating.
 * @return {Object} Auto updating helper handler plublic interface class.
 */
const Updater = function() {
  const updateUrl = 'https://raw.githubusercontent.com/loadedsith/' +
      'JavascriptHinter.tmbundle/master/Support/version.json';
    // check for udpdates daily (1000 * 60 * 60 * 24)

  /**
   * Compares two semver version numbers.
   * Stolen from: http://stackoverflow.com/a/10763755
   * @param {string} strV1 semver verion 1.
   * @param {string} strV2 semver verion 2.
   * @return {string} Difference between semver versions.
   */
  const compareVersions = function(strV1, strV2) {
    let nRes = 0;
    const parts1 = strV1.split('.');
    const parts2 = strV2.split('.');
    const nLen = Math.max(parts1.length, parts2.length);
    let nP1;
    let nP2;
    let i;

    for (i = 0; i < nLen; i++) {
      nP1 = (i < parts1.length) ? parseInt(parts1[i], 10) : 0;
      nP2 = (i < parts2.length) ? parseInt(parts2[i], 10) : 0;

      if (isNaN(nP1)) {
        nP1 = 0;
      }
      if (isNaN(nP2)) {
        nP2 = 0;
      }

      if (nP1 !== nP2) {
        nRes = (nP1 > nP2) ? 1 : -1;
        break;
      }
    }

    return nRes;
  };


  /**
   * Removes update message, and set the last update date in localstorage to
   * a future value.
   */
  const clearUpdateMessage = function() {
    document.getElementById('update-message').style.display = 'none';
    // Adds 3 days.
    localStorage.lastUpdateCheck = Date.now() + (3 * 86400000);
  };

  /**
   * Displays update message, and set up click handlers on the message.
   */
  const showUpdateMessage = function() {
    document.getElementById('update-message').
        style.display = 'block';
    document.getElementById('update-link').
        addEventListener('click', clearUpdateMessage);
    document.getElementById('close-update-reminder').
        addEventListener('click', clearUpdateMessage);
  };


  /**
   * Checks for update on the server by retrieving the version file.
   */
  const checkUpdate = function() {
    // set last check time in localstorage
    localStorage.lastUpdateCheck = Date.now();

    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        let data = JSON.parse(httpRequest.responseText);

        if (compareVersions(data.version, bundleVersion) > 0) {
          showUpdateMessage();
        }
      }
    };

    httpRequest.open('GET', updateUrl);
    httpRequest.send();
  };

  /**
   * Checks if the last update date in localStorage is older than
   * updateFrequency.
   * @param {number} updateFrequency Uptate frequency in miliseconds.
   * @return {boolean} Returns true if check should run
   */
  const shouldRunCheck = function(updateFrequency) {
    let luc = localStorage.lastUpdateCheck;

    // return true if there was no `lastUpdateCheck` timestamp set, or the
    // timestamp is older than `updateFrequency`

    return (!luc ||
        (luc && (Date.now() - parseInt(luc, 10)) > updateFrequency));
  };

  // public methods
  return {
    checkUpdate: checkUpdate,
    shouldRunCheck: shouldRunCheck,
  };
};

(function() {
  // check for updates on github after content was loaded
  let updater = new Updater();

  if (updater.shouldRunCheck()) {
    updater.checkUpdate();
  }
}());
