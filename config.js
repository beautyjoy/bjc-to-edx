// A llab config file:
module.exports = {
    baseURL: '/bjc-r',
    contentFolder: 'curriculum/bjc-r',
    edc_labs: {
        1: 'intro-loops.topic',
        2: 'conditionals-abstraction.topic',
        3: 'lists.topic',
        4: 'internet.topic',
        5: 'algorithms.topic',
        6: 'recursion-trees-fractals.topic',
        7: 'recursive-reporters.topic'
    },
    outputDirectory: './tmp/',
    cssFiles: [
        '/llab/css/3.3.0/bootstrap-compiled.min.css',
        '/llab/css/default.css',
        '/css/bjc.css'
    ],
    compliedCSSName: 'bjc-edx.css',
    additionalScripts: [
        'edx-llab-hack.js'
    ]
};