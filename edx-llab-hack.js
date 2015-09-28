var llab = {};
// CORS, joy.


// these are used in llab.getSnapRunURL(), inside library.js

llab.CORSproxy = "https://bjcredir.herokuapp.com/";

llab.CORSCompliantServers = [];
llab.CORSCompliantServers.push("bjc.berkeley.edu");
llab.CORSCompliantServers.push("bjc.eecs.berkeley.edu");
llab.CORSCompliantServers.push("snap.berkeley.edu");
llab.CORSCompliantServers.push("inst.eecs.berkeley.edu");
llab.CORSCompliantServers.push("cs10.berkeley.edu");
llab.CORSCompliantServers.push("beautyjoy.github.io");
llab.CORSCompliantServers.push("cs10.github.io");
llab.CORSCompliantServers.push("localhost");
llab.CORSCompliantServers.push("0.0.0.0");
// Testing so that dev is like the server.
llab.CORSCompliantServers.push("localhost:8000");


llab.snapRunURLBase = "http://snap.berkeley.edu/snapsource/snap.html#open:";

// returns the current domain with a cors proxy if needed

llab.getSnapRunURL = function(targeturl) {
    if (!targeturl) { return ''; }

    if (targeturl.indexOf('http') == 0 || targeturl.indexOf('//') == 0) {
        // pointing to some non-local resource...  do nothing!!
        return targeturl;
    }

    // internal resource!
    var finalurl = llab.snapRunURLBase;
    var currdom = document.domain;
    if (llab.CORSCompliantServers.indexOf(currdom) == -1) {
        finalurl += llab.CORSproxy;
    }
    // Make sure protocol exists incase https:// connections
    currdom = window.location.protocol + '//' + currdom;
    // || targeturl.indexOf(llab.rootURL) == -1
    if (targeturl.indexOf("..") != -1) {
        var path = window.location.pathname;
        path = path.split("?")[0];
        path = path.substring(0, path.lastIndexOf("/") + 1);
        currdom += path;
    }
    finalurl = finalurl + currdom + targeturl;

    console.log('TARGET URL: ', targeturl);
    console.log('FINAL URL: ', finalurl);
    return finalurl;
};

$(document).ready(function() {
    // fix snap links so they run snap
    $("a.run").each(function() {
        $(this).attr("target", "_blank");
        $(this).attr('href', llab.getSnapRunURL(this.getAttribute('href')));
    });
});