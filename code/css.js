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
        concatenate: true,
        output: 'name.css', // TODO: Or just return a string??
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
    var paths, output, appliedRules,
        separator = '\n/**********/\n';
    
    paths = options.paths || [];
    if (paths.constructor != Array) {
        paths = [ paths ];
    }
    
    output = '';
    paths.forEach(function(path) {
        appliedRules = rulesForFile(path, options.rules);
        output += transfromFile(path, appliedRules);
        output += separator;
    })
    
    return output;
}

module.exports = proccessCSSFiles;

function transfromFile(path, rules) {
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

function rulesForFile(path, rules) {
    function testPath(path) {
        return function (re) { return re.test(path) }
    }
    
    // This could happen if the only option were concatentation.
    if (!rules) {
        return [];
    }
    
    var outputRules, include;
    
    outputRules = [];
    rules.forEach(function(rule) {
        // Match all files.
        include = !rule.only && !rule.exclude;
        if (include) {
            outputRules.push(rule);
            return;
        }

        // Any exclude rule calls this rule not to be matched.
        include = ! rule.exclude.any(testPath(path));
        // Any only rule will cause this to be matched.
        include = include || rule.only.some(testPath(path));

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
    // TODO: verify this actually works....
    return ast.stylesheet.rules;
}

function transformURLs (ast, replacement) {
    // TODO: Search for rules with a url() in `value`
    // TODO: need to figure out a reliable way to parse CSS URL rules
    // TODO: need to figure out path to CSS images. :(
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

