var llab = {};

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

    return finalurl;
};

$(document).ready(function() {
    // fix snap links so they run snap
    $("a.run").each(function() {
        $(this).attr("target", "_blank");
        $(this).attr('href', llab.getSnapRunURL(this.getAttribute('href')));
    });
});
