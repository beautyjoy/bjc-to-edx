
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
    { name: 'prefix-selectors', function: prefixAllSelectors },
    { name: 'remove-comments', function: removeComments }
];

// FUNCTIONS TO WRITE / PONDER
// rules() returns the rules of an AST

function rules(ast) {
    return ast.stylesheet.rules;
}

function transformURLs (ast) {
    // TODO: Search for rules with a url() in `value`
    // TODO: need to figure out a reliable way to parse CSS URL rules
    // TODO: need to figure out path to CSS images. :(
    return ast;
}

function prefixAllSelectors(ast, prefix) {
    // search for rule type of "rule"
    rules(ast).forEach(function (rule) {
        if (rule.selectors) {
            rule.selectors = prefixRuleSelectors(rule.selectors, prefix);
        }
    })
    return ast;
}

function prefixRuleSelectors (list, prefix) {
    return list.map(prefixItem(prefix));    
}

function prefixItem (prefix) {
    return function (item) {
        return (item.indexOf(prefix) == -1 ? prefix + ' ' : '') + item;
    };
}

function removeComments(ast) {
    // search for all rules of type "comment"
    // search all `declarations` in all rules for type "comment"
    return ast;
}

function matchesType(type) {
    return function (rule) {
        return rule.type === type;
    }
}

