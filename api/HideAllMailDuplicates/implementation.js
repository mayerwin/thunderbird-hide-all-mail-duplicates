/* eslint-disable object-shorthand */

"use strict";

// Using a closure to not leak anything but the API to the outside world.
(function (exports) {
	// Get various parts of the WebExtension framework that we need.
	var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");

	// You probably already know what this does.
	var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

	// A helpful class for listening to windows opening and closing.
	var { ExtensionSupport } = ChromeUtils.import("resource:///modules/ExtensionSupport.jsm");

	// This is the important part. It implements the functions and events defined
	// in the schema.json. The name must match what you've been using so far,
	// "HideAllMailDuplicates" in this case.
	// For manifest v3, the used class must be ExtensionAPIPersistent(), otherwise
	// its events are not registered as being persistent and will fail to wake up
	// the background. 
	class HideAllMailDuplicates extends ExtensionCommon.ExtensionAPIPersistent {
		// An alternative to defining a constructor here, is to use the onStartup
		// event. However, this causes the API to be instantiated directly after the
		// add-on has been loaded, not when the API is first used. Depends on what is
		// desired.
		constructor(extension) {
			super(extension);
		}

		getAPI(context) {
			return {
				// This key must match the class name.
				HideAllMailDuplicates: {
					hide: async function (name) {
						var {GlodaSyntheticView} = ChromeUtils.import("resource:///modules/gloda/GlodaSyntheticView.jsm");

						// Store the original method.
						if (typeof GlodaSyntheticView.prototype.originalReportResultsGlobal88319 === 'undefined') {
							console.log("Saving original method"); 
							GlodaSyntheticView.prototype.originalReportResultsGlobal88319 = GlodaSyntheticView.prototype.reportResults;
						}
						
						// Define a new reportResults function
						GlodaSyntheticView.prototype.reportResults = function(aItems) {
							try {									
								let messageMap = new Map();

								// First pass: Store messages in a map with messageId as the key.
								for (let item of aItems) {
								  let hdr = item.folderMessage;
								  if (hdr) {
									if (!messageMap.has(hdr.messageId)) {
									  messageMap.set(hdr.messageId, []);
									}
									if (hdr.folder.name === "All Mail") { //hdr.folder.flags & Ci.nsMsgFolderFlags.AllMail) {
									  // Push the header to the end of the array.
									  messageMap.get(hdr.messageId).push(hdr);
									} else {
									  // Add the header to the front of the array.
									  messageMap.get(hdr.messageId).unshift(hdr);
									}
								  }
								}

								// Second pass: Traverse the map, report everything except duplicates
								// from "All Mail".
								// The map values are arrays of headers, with the ones not in "All Mail"
								// at the front.
								for (let value of messageMap.values()) {
								  if (value.length == 1) {
									let hdr = value[0];
									this.searchListener.onSearchHit(hdr, hdr.folder);
								  } else if (value[0].folder.name === "All Mail") { //value[0].folder.flags & Ci.nsMsgFolderFlags.AllMail) {
									// First hit is in "All Mail" already, so report all hits.
									for (let hdr of value) {
									  this.searchListener.onSearchHit(hdr, hdr.folder);
									}
								  } else {
									// First hit isn't in "All Mail", so report all hits not in "All Mail".
									for (let hdr of value) {
									  if (hdr.folder.name === "All Mail") { //hdr.folder.flags & Ci.nsMsgFolderFlags.AllMail) {
										// Make sure `this.selectedMessage` references a message we're reporting.
										if (this.selectedMessage.messageId == hdr.messageId) {
										  this.selectedMessage = value[0];
										}
										break;
									  }
									  this.searchListener.onSearchHit(hdr, hdr.folder);
									}
								  }
								}
							} catch (e) {
								console.error('An error occurred while filtering items:', e);
								return true;
							}
							//console.log(name);
							//Services.wm.getMostRecentWindow("mail:3pane").alert(name);
						}
					}
				}
			};
		}

		onShutdown(isAppShutdown) {
			// Restore the original method.
			if (typeof GlodaSyntheticView.prototype.originalReportResultsGlobal88319 !== 'undefined') {
				console.log("Restoring original method"); 
				GlodaSyntheticView.prototype.reportResults = GlodaSyntheticView.prototype.originalReportResultsGlobal88319;
			}
			// This function is called if the extension is disabled or removed, or Thunderbird closes.
			// We usually do not have to do any cleanup, if Thunderbird is shutting down entirely
			if (isAppShutdown) {
				return;
			}
			//console.log("Goodbye world!");
		}
	}
		
	// Export the api by assigning in to the exports parameter of the anonymous closure
	// function, which is the global this.
	exports.HideAllMailDuplicates = HideAllMailDuplicates;
})(this)