/**  LLAB AUTOBUILD WIP SCRIPT
 *
 *  TODO: This script is NOT FINISHED
 *  run with `node edc_test.js UNIT_NUM`
 */

// Default Node modules
var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;
var process = require('process');

var cheerio = require('cheerio');
var mkdirp = require('mkdirp');

var llab = require('./lib/llab');
var css = require('./code/css')
var util = require('./code/util');

var processedPaths = [];

BASEURL = '/bjc-r'; // MATCH LLAB.ROOTURL IN CURR REPO
// This is where a llab course CONTENT lives
// This should be a checked out state
curFolder = `curriculum${BASEURL}/`;
// This is where the edX XML folder will be.
output = './tmp/';

unit_files = {
    1: 'intro-loops.topic',
    2: 'conditionals-abstraction.topic',
    3: 'lists.topic',
    4: 'internet.topic',
    5: 'algorithms.topic',
    6: 'recursion-trees-fractals.topic',
    7: 'recursive-reporters.topic'
};

var cssRelPath = path.relative(
    curFolder,
    'curriculum/bjc-r/llab/css/default.css'
);
var CSSOptions = {
    paths: [
        // TODO: Use newer llab stuff?
        // TODO: Exclude Bootstrap?
        curFolder + '/llab/css/3.3.0/bootstrap-compiled.min.css',
        curFolder + '/llab/css/default.css',
        curFolder + '/css/bjc.css'
    ],
    rules: [
        {
            name: 'transform-urls',
            // Params: llab base url, relative file paths
            options: [BASEURL, cssRelPath]
        },
        {
            name: 'rename-selectors',
            options: ['.full', '.llab-full']
        },
        {
            name: 'prefix-selectors',
            options: '.llab-full'
            // , exclude: /bootstrap/
        }
    ]
};

// GLOBAL -- FIXME
var relPath;
var count;
var dir;
var PETER = false;

var PROCESS_FUNCTIONS = {
    file: processFile,
    quiz: processQuiz,
    txt: processTxt,
    markdown: processMarkdown,
    external: processExternal
};


function doWork(unit) {
    topic = `nyc_bjc/${unit}-${unit_files[unit]}`;
    mkdirp.sync(`${output}U${unit}`);
    // edX static files directory.
    mkdirp.sync(`${output}static`);
    
    topic = fs.readFileSync(util.topicPath(curFolder, topic));
    topic = topic.toString();
    data = llab.parse(topic);
    
    CSS_FILE_NAME = 'bjc-edx.css';
    css_file = fs.openSync(output + CSS_FILE_NAME, 'w');
    fs.writeSync(css_file, css(CSSOptions));

    cssPath = util.edXPath(CSS_FILE_NAME);
    cssString = '<link rel="stylesheet" href="' + cssPath + '">';
    jsPath = util.edXPath('edx-llab-hack.js');
    cssString += '<script src="' + jsPath + '"></script>\n\n';

    data.topics.forEach(parseTopic);
    console.log(`Unit ${unit} conversion is done!`);
}


function loadFile (path) {
}

function parseTopic (topic, args) {
    topic.contents.forEach(parseSection, args);
}

// TODO: Make this a config item`
function shouldParse (title) {
    return true;
    return title.indexOf('Programming Lab') == 0 ||
    title.indexOf('Investigation') == 0;
}

function parseSection (section, skip) {
    var title = section.title.trim();

    if (!shouldParse(title)) {
        console.log('skipping:', title);
        return;
    }

    dir = output;
    if (!PETER) {
        dir += title;
    }
    // Make if it doesn't exist.
    mkdirp.sync(dir);
    count = 0;
    results = [];
    section.contents.forEach(function (item) {
        // This also writes files...hmmm.
        results.push(processCurriculumItem(item));
    });

    return results;
}

// This needs renamed...
function processCurriculumItem(item) {
    if (!item.url) {
        return;
    } else if (!item.url.startsWith(BASEURL)) {
        return;
    }

    file = item.url.replace(BASEURL, curFolder);
    relPath = path.relative(curFolder, file);
    console.log('FILE: ', file);
    if (!file.endsWith('.html')) {
        return;
    }
    if (processedPaths.includes(file)) {
        return;
    }
    count += 1;

    processedPaths.push(file);
    html = fs.readFileSync(file);

    parts = splitFile(html, count, dir);
    parts.forEach(function(part, index) {
        var css = index === 0,
            data = processItem(part, css);
        // part.path is a file name
        console.log(dir);
        var folder = dir + '/' + part.directory;
        console.log('WRITING CONTENT', folder + part.path);
        mkdirp.sync(folder);
        fs.writeFileSync(folder + part.path, data);
    });

    return parts;
};

function processItem (item, options) {
    return PROCESS_FUNCTIONS[item.type].call(null, item.content, options);
}

function processQuiz(quiz) {
    return quiz;
}

function processMarkdown(file) {
    return file;
}

function processFile(file, options) {
    // FIXME -- this is a simplification for now.
    return processHTML(file, options);
}

function processExternal(item, options) {
    return item;
}

// TODO: this should copy stuff to the output directory.
function processTxt(file) {
    return file;
}

/** Does the work to modify a bunch of things to prep for edX
 *
 * @param {Cherrio-Object} The contents of the html file
 *
 */
// TODO: This needs to take in an array of functions.
// TODO: rename this processHTMLSegment
function processHTML (html, includeCSS) {
    var $, outerHTML, wrap;

    $ = cheerio.load(html);

    // Fix some of the EDC image elements with .button
    // These conflict with edX.
    $('.button').removeClass('button');

    // Fix image URLs
    $('img').each(function (index, elm) {
        var url = $(elm).attr('src') || '',
            newPath = util.transformURL(BASEURL, relPath, url);
        $(elm).attr('src', newPath);
        // Don't copy files more than once, minor optimization
        if (!processedPaths.includes(newPath)) {
            // TODO fix the url.
            fs.writeFileSync(
                `${output}${newPath}`,
                 fs.readFileSync(`curriculum${url}`)
            );
            processedPaths.push(newPath);
        }
    });

    // Fix Snap! run links.
    console.log('Found ', $('a').length, ' total urls.');
    console.log('Transforming ', $('a.run').length, ' STARTER FILE urls.');
    $('a.run').each(function (index, elm) {
        var url = $(elm).attr('href');
        $(elm).attr('href', util.transformURL(BASEURL, relPath, url)).attr('target', '_blank');
    });
    $('a').each(function (index, elm) {
        var url = $(elm).attr('href'),
            path;
        if (!url) { return; }
        path = url.split('?')[0]; // remove the query string
        processCurriculumItem({url: path});
    });
    // Remove EDC's inline HTML comments. (Why is it there.....)
    [
        '.comment',
        '.todo',
        '.commentBig'
    ].forEach(function (sel) { $(sel).remove(); });

    // wrap content in div.llab-full
    wrap = '<div class="llab-full">CONTENT</div>';

    outerHTML = wrap.replace(/CONTENT/, $.html());

    if (!includeCSS) {
        outerHTML = cssString + outerHTML;
    }

    return outerHTML;
}

/*
    Return a string of the CSS contensts and any JS contents that should appear
    at the top of the page.
    Typically this section only needs to appear once per edX 'vertical'
*/
function HTMLPreamble() {
    
}
/** Split a single curriculum page into components to be in a vertical.
 *
 * @param {string} the raw HTML file to be processed
 */
function splitFile (html, page, dir) {
    var $, output, title, quizzes, qzHTML, text;

    output = [];
    $ = cheerio.load(html);

    // EDC Puts an <h2> at the beginning of every page.
    title = $('h2').first().text();

    text = $('body').html()
    // parse quizes separately.
    quizzes = $('div.assessment-data');
    console.log('Found ', quizzes.length, ' quizzes.');
    quizzes.each(function(index, elm) {
        qzHTML = $.html(elm); // like a call to outerHTML()
        command = 'python3 code/mc_parser.py \'' + qzHTML + '\'';
        xml = exec(command).toString();
        var idx = text.indexOf(qzHTML);
        var before = text.slice(0, idx).trim();

        if (before.length) {
            num = output.length + 1;
            file = page + '-' + num + '-' + title + '.html';
            file = util.edXFileName(file);
            output.push({
                type: 'file',
                title: num + '-' + title,
                content: before,
                directory: 'html/',
                path: file
            }); // part before quiz
        }

        num = output.length + 1;
        file = page + '-' + num + '-' + title + '.xml';
        file = util.edXFileName(file);
        output.push({
            type: 'quiz',
            title: num + '-' + 'Quiz-'+ title,
            content: xml,
            directory: 'problem/',
            path: file
        }); // push quiz
        text = text.slice(idx + qzHTML.length);
    });

    if (quizzes.length == 0) {
        file = page + '-' + title + '.html';
        file = util.edXFileName(file);
        output.push({
            type: 'file',
            title: title,
            content: text,
            directory: 'html/',
            path: file
        });
    }

    return output;
}

module.exports = function(path, sectionName, directory) {
    // Globals
    PETER = true;
    // util.topicPath(curFolder, path) == assuming we have some folder.
    topic = fs.readFileSync(path).toString();
    data = llab.parse(topic);
    output = directory;

    var topic, data, result;

    data.topics.forEach(function (topic) {
        topic.contents.some(function (section) {
            var title = section.title.trim();
            found = title.indexOf(sectionName) != -1;
            if (found) {
                tmp = parseSection(section);
                result = tmp;
                return true;
            }
        });
    });

    return result;
}

//////////////////////////////////////////

if (process.argv.length > 2) {
    var start = 2, end = process.argv.length;
    for (var arg = start; arg < end; arg += 1) {
        var item = process.argv[arg]
        try {
            unit = parseInt(item);
            console.log(`Trying to convert Unit ${unit}`);
            doWork(unit);
        } catch (e) {
            console.log(`Error encountered for item ${item}`);
            console.log(e);
        }
    }
    console.log('Processed all items');
    process.exit(0);
}