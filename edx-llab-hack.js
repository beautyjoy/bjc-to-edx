var llab = {};

llab.snapRunURLBase = "http://snap.berkeley.edu/snapsource/snap.html#open:";

// returns the current domain with a cors proxy if needed

llab.getSnapRunURL = function(targeturl) {
    if (!targeturl) { return ''; }

    var finalurl =  llab.snapRunURLBase,
        edc_gh = 'https://bjc-edc-2017-18.github.io/bjc-r/',
        url_parts = targeturl.split('/'),
        xmlPath = url_parts[url_parts.length - 1].replace(/_/g, '/');

    return finalurl + edc_gh + xmlPath;
};

$(document).ready(function() {
    if (typeof Giffer !== 'undefined') {
        Gifffer();
    } else {
        var gif = $('<script>').attr(
            'src',
        'https://cdnjs.cloudflare.com/ajax/libs/gifffer/1.5.0/gifffer.min.js'
        ).on('load', 'function() {Giffer(); }');
        $('head').append(gif);
    }

    // fix snap links so they run snap
    $("a.run").each(function() {
        $(this).attr("target", "_blank");
        $(this).attr('href', llab.getSnapRunURL(this.getAttribute('href')));
    });
});
