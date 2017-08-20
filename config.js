// TODO: This isn't yet implemented.
// A llab-builder config file:
// This file will be `require`d by the main builder.
// Given the nature of custom transforms this seems preferable
// to a YAML file.
module.exports = {
    baseURL: '/bjc-r',
    contentFolder: 'curriculum/', // the directory containing the folder of "baseURL"
    edc_labs: { // TODO: where should random custom data be put?
        1: 'intro-loops.topic',
        2: 'conditionals-abstraction.topic',
        3: 'lists.topic',
        4: 'internet.topic',
        5: 'algorithms.topic',
        6: 'recursion-trees-fractals.topic',
        7: 'recursive-reporters.topic'
    },
    outputDirectory: './tmp/',
    cssFiles: [ // inside the curriculum folder
        '/llab/css/3.3.0/bootstrap-compiled.min.css',
        '/llab/css/default.css',
        '/css/bjc.css'
    ],
    compliedCSSName: 'bjc-edx.css',
    additionalScripts: [
        'edx-llab-hack.js'
    ],
    // These are functions which can use Cheerio to modify page html.
    // They are executed in this order.
    // TODO: Should these take in a selector: function pair?
    htmlTransforms: [
        rewriteImageURLs,
        rewriteSnapURLs,
        transformLocalFiles,
    ]
};

function rewriteImageURLs() {}
function rewriteSnapURLs() {}
function transformLocalFiles() {}
