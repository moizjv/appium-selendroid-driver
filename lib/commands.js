import _ from 'lodash';
import log from './logger';
import utf7 from 'utf7';
import { webviewHelpers, CHROMIUM_WIN } from 'appium-android-driver';

const {imap} = utf7;

let extensions = {},
    commands = {},
    helpers = {};

commands.performMultiAction = async function (elId, actions) {
  if (elId) {
    throw new Error("Selendroid actions do not support element id");
  }
  return this.selendroid.jwproxy.command('/action', 'POST', {payload: actions});
};

function encodeString (value, unicode) {
  for (let i = 0; i < value.length; i++) {
    let c = value.charCodeAt(i);
    // if we're using the unicode keyboard, and this is unicode, maybe encode
    if (unicode && (c > 127 || c === 38)) {
      // this is not simple ascii, or it is an ampersand (`&`)
      if (c >= parseInt("E000", 16) && c <= parseInt("E040", 16)) {
        // Selenium uses a Unicode PUA to cover certain special characters
        // see https://code.google.com/p/selenium/source/browse/java/client/src/org/openqa/selenium/Keys.java
      } else {
        // encode the text
        value = imap.encode(value);
        break;
      }
    }
  }
  return value;
}

// Need to override this for correct unicode support
commands.setValue = async function (value, elementId) {
  if (value instanceof Array) {
    value = value.join("");
  }
  log.debug(`Setting text on element ${elementId}: '${value}'`);
  value = encodeString(value, this.opts.unicodeKeyboard);
  await this.selendroid.jwproxy.command(`/element/${elementId}/value`, 'POST', {value: [value]});
};

// Need to override this for correct unicode support
commands.keys = async function (value) {
  if (value instanceof Array) {
    value = value.join("");
  }
  log.debug(`Setting text: '${value}'`);
  value = encodeString(value, this.opts.unicodeKeyboard);
  await this.selendroid.jwproxy.command('/keys', 'POST', {value: [value]});
};

// Selendroid doesn't support metastate for keyevents
commands.keyevent = async function (keycode, metastate) {
  log.debug(`Ignoring metastate ${metastate}`);
  await this.adb.keyevent(keycode);
};

// Use ADB since we don't have UiAutomator
commands.back = async function () {
  await this.adb.keyevent(4);
};

commands.getContexts = async function () {
  let chromiumViews = [];
  let webviews = await webviewHelpers.getWebviews(this.adb,
      this.opts.androidDeviceSocket);
  if (_.contains(webviews, CHROMIUM_WIN)) {
    chromiumViews = [CHROMIUM_WIN];
  } else {
    chromiumViews = [];
  }

  log.info('Getting window handles from Selendroid');
  let selendroidViews = await this.selendroid.jwproxy.command('/window_handles', 'GET', {});
  this.contexts = _.union(selendroidViews, chromiumViews);
  log.info(`Available contexts: ${JSON.stringify(this.contexts)}`);
  return this.contexts;
};

Object.assign(extensions, commands, helpers);

export default extensions;
