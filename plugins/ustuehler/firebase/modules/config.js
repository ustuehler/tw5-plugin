/*\
title: $:/plugins/ustuehler/firebase/config.js
type: application/javascript
module-type: library
caption: app

Registers Firebase plugin functions under $tw.utils.firebase, mainly to make
them easily accessible for debugging in the browser console

\*/
(function () {
  /*
   * The configuration for this app can be found on the Authentication screen in
   * the Firebase Console at https://console.firebase.google.com. Use the "Web
   * Setup" button to reveal it, then copy & paste the values below.
   */
  // FIXME: Firebase app configuration goes into plugin settings
  exports.config = {
    apiKey: 'AIzaSyBi0evv3BXi4d34P85PcDxlBLnvmjZuEZI',
    authDomain: 'tw5-github.firebaseapp.com',
    databaseURL: 'https://tw5-github.firebaseio.com',
    projectId: 'tw5-github',
    storageBucket: 'tw5-github.appspot.com',
    messagingSenderId: '898278138051'
  }
})()
