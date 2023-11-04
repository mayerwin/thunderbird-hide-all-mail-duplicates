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
								// Filter out duplicate messages from aItems before calling the original function
								const filteredItems = aItems.filter(item => {
									const hdr = item.folderMessage;
									if (hdr) {
										// Determine if an item is a duplicate
										//console.log("Email13: " + hdr.messageId + " in " + hdr.folder.name);
										if (hdr.folder.name === "All Mail") {
											// Check the rest of aItems for a message with the same messageId but a different folder
											const duplicateItem  = aItems.find(otherItem => {
												const otherHdr = otherItem.folderMessage;
												return otherHdr &&
													   otherHdr.messageId === hdr.messageId &&
													   otherHdr.folder.name !== "All Mail";
											});
											// If it's a duplicate, filter it out by returning false, but make sure to update selectedMessage if necessary.
											if (duplicateItem && hdr.messageId === this.selectedMessage.messageId) {
												this.selectedMessage = duplicateItem.folderMessage;
											}
											return !duplicateItem ;
										}
									}
									return true;
								});

								// Call the original reportResults function with the filtered list of items
								GlodaSyntheticView.prototype.originalReportResultsGlobal88319.call(this, filteredItems);
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