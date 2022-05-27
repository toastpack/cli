#!env node

try {
  if (!process) {
    throw 'lacking process';
  } else if (!process.versions) {
    throw 'lacking process.versions, probably Node.js before v0.2.0';
  } else if (!process.versions.node) {
    throw 'lacking process.versions.node';
  } else {
    try {
      var nodejsVersionArray = process.versions.node.split('.');
      var nodejsVersionString = `${nodejsVersionArray[0]}.${nodejsVersionArray[1]}`;
      var nodejsVersionNumber = Number(nodejsVersionString);
    } catch (e) {
      throw `getting the Node.js version failed with error: ${e.message}`;
    }
    if (!nodejsVersionNumber >= 17.5) {
      throw 'not running on at least Node.js 17.5';
    } else if (!fetch) {
      throw "fetch isn't enabled, use the --experimental-fetch flag to enable fetch on Node.js";
    }
  }
} catch (e) {
  console.log(
    'Warning: toastpack cli shim: toastpack might not work as expected'
  );
  console.log('Warning: toatpack cli shim: ' + e.message);
}

import './toastpack.js';
