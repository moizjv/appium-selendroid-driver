appium-selendroid-driver
===================

This package is appium wrapper over selendroid.

##Usage:

### Intallation

`npm install`

### To run test

`npm run test`

### Usage

`node .`

This will start appium server, you can now run your appium tests against it.

example of desired capability that can be used

`"desiredCapabilities":{"appActivity":".view.TextFields","app":"sample-code/apps/ApiDemos/bin/ApiDemos-debug.apk","newCommandTimeout":90,"automationName":"selendroid","platformName":"Android","deviceName":"Android Emulator"}`
