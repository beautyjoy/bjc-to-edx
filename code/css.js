/** A Generic CSS Modification Tool.
 *  This should be extracted into it's own module.
 *
 *  TODO: In place modification or return new ASTs?
 *  TODO: formalize the spec for `options`
 *  TODO: Consistent function parameters
 *  TODO: Better UI for defining an extending rules.
 *  TODO: Make adding rules be something in the exports.
 */

var fs = require('fs');

var css = require('css');

var util = require('./util.js');


/** This function does the bulk of transforming CSS.
 *  options = {
        paths: [ 'file.css' ],
        concatenate: true, // Defaults true. FALSE IS NOT YET IMPLEMENTED
        output: 'name.css',
        rules: [
            { name: 'transform-urls',
              options: [ ],
              only: [ /regex/g ],
              exclude: [ /regex/g ]
            }
        ]
    }
 */
function proccessCSSFiles (options) {
    var paths, result, appliedRules,
        separator = '\n/**********/\n';
    paths = options.paths || [];
    if (paths.constructor != Array) {
        paths = [ paths ];
    }
    result = '';
    paths.forEach(function (path) {
        appliedRules = rulesForFile(path, options.rules);
        result += transfromFile(path, appliedRules);
        result += separator;
    })
    if (options.output) {
        return fs.writeFileSync(options.output, result);
    } else {
        return result;
    }
}

module.exports = proccessCSSFiles;

function transfromFile (path, rules) {
    var contents, ast;

    contents = fs.readFileSync(path).toString();
    ast = css.parse(contents);
    // Successively update the AST with each rule.
    rules.forEach(function (rule) {
        ast = callRule(ast, rule.name, rule.options)
    });
    return css.stringify(ast);
}

/** Return the list of rules which match the given file path.
 *  The `only` option has more precedence or the exclude option.
 *  TODO: verify that this is correct.
 *
 *  @param {string} The path to the file.
 *  @param {array} A rules list to test matchers against.
 */

function rulesForFile (path, rules) {
    // This could happen if the only option were concatentation.
    if (!rules) {
        return [];
    }

    var outputRules, include;
    outputRules = [];
    rules.forEach(function (rule) {
        // Match all files.
        include = !rule.only && !rule.exclude;
        if (include) {
            outputRules.push(rule);
            return;
        }

        // Any exclude rule calls this rule not to be matched.
        include = ! asArray(rule.exclude).some(testPath(path));
        // Any only rule will cause this to be matched.
        include = include || asArray(rule.only).some(testPath(path));

        if (include) {
            outputRules.push(rule);
        }
    });

    return outputRules;
}
var RULES = {
    'transform-urls': {
        function: transformURLs,
        description: '', // TODO: Ideas...
        options: '' // TODO: Figure out if this will be helpful?
    },
    'prefix-selectors': {
         function: prefixAllSelectors
    },
    'rename-selectors': {
             function: renameAllSelectors
    },
    'remove-comments': {
         function: removeComments
    }
};

function callRule(ast, name, options) {
    var rule, parans, fn;
    rule = RULES[name];
    if (!rule) {
        throw new Error('The rule ' + name + ' does not exist.\n' +
            'The known rule names are: ' + Object.keys(RULES).toString());
    }

    if (options && options.constructor != Array) {
        options = [ options ];
    }

    fn = rule.function;
    params = [ ast ].concat(options);
    return fn.apply(null, params); // This "destructures" the array.
}

function rules(ast) {
    return ast.stylesheet.rules;
}

function transformURLs (ast, baseURL, filePath) {
    var urlPattern = /url\(['"]?([./?#\-\w]+)['"]?\)/g;
    // THIS IS A WORKAROUND --
    // The above regex does not generate a $1 grouping. (Why??)
    // Use these to make the entire url() set, then use String::slice
    var from = 4, to = -1;
    var matches, url, newUrl;
    // TODO: Search for rules with a url() in `value`
    // TODO: need to figure out a reliable way to parse CSS URL rules
    // TODO: need to figure out path to CSS images. :(
    // TODO: make the forEach a map
    rules(ast).forEach(function (rule, i, arr) {
        if (rule.declarations) {
            rule.declarations.forEach( function (declare, j, arr2) {
                if (declare.value && declare.value.indexOf('url') != -1) {
                    matches = declare.value.match(urlPattern);
                    if (matches) {
                        matches.forEach(function(m) {
                            if (m[from] == '\'' || m[from] == '"') {
                                from += 1;
                                to -= 1;
                            }
                            url = m.slice(from, to);
                            newUrl = util.transformURL(baseURL, filePath, url);
                            // FIXME -- there has got to be a better way....
                            arr[i].declarations[j].value = declare.value.replace(url, newUrl);
                        });
                    }
                }
            });
        }
    });
    return ast;
}

// Inplace modification of the AST for ease.
function prefixAllSelectors(ast, prefix) {
    // search for rule type of "rule"
    rules(ast).forEach(function (rule, idx, arr) {
        if (rule.selectors) {
            arr[idx].selectors = prefixRuleSelectors(rule.selectors, prefix);
        }
    })
    return ast;
}

function prefixRuleSelectors (list, prefix) {
    return list.map(prefixItem(prefix));
}

// Inplace modification of the AST for ease.
function renameAllSelectors(ast, from, rename) {
    // search for rule type of "rule"
    rules(ast).forEach(function (rule, idx, arr) {
        if (rule.selectors) {
            arr[idx].selectors = renameRuleSelectors(rule.selectors, from, rename);
        }
    })
    return ast;
}

function renameRuleSelectors (list, from, rename) {
    var renamer = renameItem(from, rename);
    return list.map(renamer);
}

function removeComments(ast) {
    // search for all rules of type "comment"
    // search all `declarations` in all rules for type "comment"
    return ast;
}

/** Return a new AST with the CSS tree modified by the provided function.
 *  This will apply the function not only to the main rules but will also
 *  travel the media queries to modify those as well.
 *  NOTE: This returns a new AST and does not modify the provided one.
 *  TODO: This function doesnt do anything yet.
 *
 */
function mapASTRules (ast, fn) {
    return ast;
}

/////// Helper Functions for map/forEach/etc


/**
 */

function prefixItem (prefix) {
    return function (item) {
        return (item.indexOf(prefix) == -1 ? prefix + ' ' : '') + item;
    };
}

/** Rename a CSSS selector. This is really a .replace() designed to be used
 *  inside a map() block.
 *  @param {string} the string to be replaced.
 */
function renameItem (from, rename) {
    return function (item) {
        // TODO: Verify this works correct with a . in class names.
        var re = new RegExp(from, 'g');
        return item.replace(re, rename);
    };
}

function testPath(path) {
    return function (re) { return re.test(path) }
}

function matchesType(type) {
    return function (rule) {
        return rule.type === type;
    }
}

function asArray(item) {
    if (!item) {
        return [];
    }
    if (item.constructor == Array) {
        return item;
    }
    return [ item ];
}
