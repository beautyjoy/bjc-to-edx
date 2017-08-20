// Util functions for dealing with paths and images.

var crypto = require('crypto');
var path = require('path');
var url = require('url');

var util = {};

// TODO: migrate to llab.
/* Retun the path to a topic file. */
util.topicPath = function (baseURL, topicURL) {
    return baseURL + 'topic/' + topicURL;
}

/*
    Remove the query string or hash from a URL (or path)
*/
util.removeQuerystring = (string) => {
    return string
}

/*
 *
 */
util.edXPath = function (url) {
    url = url[0] == '/' ? url.slice(1) : url;
    return '/static/' + url.replace(/\//g, '_'); //
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
 * (i.e.) CSS files that aren't processed by edX.
 * @param {string}
 * FIXME -- this breaks if passed in a full URL! http:// gahhhhhh
 */
util.staticTransformURL = function (baseURL, filePath, url, hash) {
    // Generate a proper /static URL and then direct it to edx "contentstore"
    var tempURL = util.transformURL(baseURL, filePath, url);
    // See: http://bjc.link/1hnrR9Q (edX Source Code)
    // FIXME == this is super hacky!!
    let oldedx = '/c4x/BerkeleyX/BJC.34x/asset';
    let bjc12x = `/assets/courseware/v1/${hash}/asset-v1:BerkeleyX+BJC.12x+3T2017+type@asset+block`;
    tempURL = tempURL.replace('/static', bjc12x);
    return tempURL;
}


util.md5Hash = (data) => crypto.createHash('md5').update(data).digest('hex');

// TODO: Migrate to v7.5 URL API
util.trimQuerystring = (str) => {
    let urlObject = url.parse(str);
    urlObject.query = null;
    urlObject.search = null;
    urlObject.hash = null;
    return urlObject.format();
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


/*
    TODO: Replace with a real library...
*/
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