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

/* Transform a path into an edX-friendly URL that can be used in edX Studio!
 *  NOTE: Due to whacky-ness these URLs ONLY WORK IN STUDIO!
 * @param {string}
 * FIXME -- this breaks if passed in a full URL! http:// gahhhhhh
 */
util.transformURL = function (baseURL, filePath, url) {
    if (url.indexOf('/static') == 0 || url.indexOf('http') == 0 ||
        url.indexOf('//') == 0) {
        return url;
    }

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


/* Transforms a URL into a "direct" edX URL to be used in static files.
 * @param {string}
 * FIXME -- this breaks if passed in a full URL! http:// gahhhhhh
 */
util.staticTransformURL = function (baseURL, filePath, url, edXOrg, courseID) {
    // Generate a proper /static URL and then direct it to edx "contentstore"
    var tempURL = util.transformURL(baseURL, filePath, url);
    // See: http://bjc.link/1hnrR9Q (edX Source Code)
    // FIXME == this is super hacky!!
    tempURL = tempURL.replace('/static', '/c4x/BerkeleyX/BJC.2x/asset');
    return tempURL;
}



/** Normalize spaces and other special chars in filenames.
 *  Warning: Don't pass this a full path as it removes /
 *  @param {string} the filename to be normalized
 *  @return {string} a normalized filename.
 */
util.edXFileName =  function fileName (name) {
    // Windows rules / ? < > \ : * | "
    return name.replace(/[\s+/:|*\\<>?"!,';&^]/g, '_');
}

function BasicLogger (level) {
    this.level = level;
}

BasicLogger.prototype.log = function (level, args) {
    if (level >= this.level) {
        console.log(Function.arguments.slice(1));
    }
}

BasicLogger.prototype.setLevel = function (level) {
    this.level = level;
    return level;
}

BasicLogger.prototype.getLevel = function () {
    return this.level;
}

util.BasicLogger = BasicLogger;

module.exports = util;