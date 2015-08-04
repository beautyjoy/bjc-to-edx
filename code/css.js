
var fs = require('fs');

var css = require('css');

var util = require('./util.js');

function proccessCSSFiles (paths, options) {
    if (paths.constructor != Array) {
        paths = [ paths];
    }
    
    return 'edx-css.css';
}

module.exports = proccessCSSFiles;

var RULES = [
    { name: 'transform-urls', function: transformURLs },
    { name: 'prefix-selectors', function: prefixSelectors },
    { name: 'remove-comments', function: removeComments }
];

// FUNCTIONS TO WRITE / PONDER
// rules() returns the rules of an AST
// filterType(ast, type) return the rules which match that type
// excludeType(ast, type) return the ast with rules of a certain type missing.

function transformURLs (ast) {
    // TODO: Search for rules with a url() in `value`
    // TODO: need to figure out a reliable way to parse CSS URL rules
    // TODO: need to figure out path to CSS images. :(
    return ast;
}

function prefixSelectors(prefix, ast) {
    // search for rule type of "rule"
    return ast;
}

function removeComments(ast) {
    // search for all rules of type "comment"
    // search all `declarations` in all rules for type "comment"
    return ast;
}