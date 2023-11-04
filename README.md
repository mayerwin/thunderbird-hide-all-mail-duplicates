# Thunderbird Add-on: Hide Duplicates From 'All Mail'
This is a simple Thunderbird add-on that hides duplicate emails from the 'All Mail' folder upon clicking on a result from Global Search, so that if one email is in both the 'All Mail' folder (e.g. of Gmail) and another folder (e.g. 'Sent'), it will only show the email from the other folder.

## Why this add-on is helpful
If you are using the 'Archive' button in Gmail (Personal or Google Workspace), for example to reach Inbox Zero, archived emails from your inbox will then only be present in the 'All Mail' folder. 

This means that for them to still be searcheable in Thunderbird, you will need to subscribe to the 'All Mail' folder. 

Unfortunately, if the exact same email is still present in another folder (this will be the case for all emails in the 'Sent' folder, and all custom labels/folders, as those are also showing up in 'All Mail'), the search results will show both the email in 'All Mail' and the other folder. 

This add-on solves this issue by hiding the email from 'All Mail' if a duplicate is found in another folder, resulting in clean, neat search results.

## How to install
Simply download the [latest release](https://github.com/mayerwin/thunderbird-hide-all-mail-duplicates/releases), and install the xpi file as per the official instructions [here](https://support.mozilla.org/en-US/kb/installing-addon-thunderbird#w_a-slightly-less-ideal-case-install-from-a-downloaded-xpi-file).
