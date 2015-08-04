// Util functions for dealing with paths and images.

var path = require('path');

var util = {};

// TODO: migrate to llab.
/* Retun the path to a topic file.

 */
util.topicPath = function (baseURL, topicURL) {
    return baseURL + 'topic/' + topicURL;
}

/*
 *
 */
util.edXPath = function (url) {
    url = url[0] == '/' ? url.slice(1) : url;
    return '/static/' + url.replace(/\//g, '_');
}

/* This does the bulk of the work to tranform a path into an edX URL
 * @param {string}
 * FIXME -- this breaks if passed in a full URL! http:// gahhhhhh
 */
util.transformURL = function (baseURL, filePath, url) {
    var fileDir = path.dirname(filePath);
    url = path.normalize(url);

    if (url.indexOf(baseURL) != -1) {
        url = url.replace(baseURL, '');
    } else { // Hopefully a ../ thing
        url = path.resolve(fileDir, url);
        // Node's resolve returns an absolute URL, so fix that.
        // if for some reason we have '/cur/...' then the relative path will be
        // "absolute" by default.
        if (fileDir[0] !== '/') {
            url = path.relative('./', url);
        }
    }

    return util.edXPath(url);
}

/** Normalize spaces and other special chars in filenames.
 *  Warning: Don't pass this a full path as it removes /
 *  @param {string} the filename to be normalized
 *  @return {string} a normalized filename. 
 */
util.edXFileName =  function fileName (name) {
    return name.replace(/[\s+/:]/g, '_');
}

module.exports = util;