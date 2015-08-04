/*  LLAB AUTOBUILD WIP SCRIPT
 */

fs = require('fs');
path = require('path');
exec = require('child_process').execSync;

cheerio = require('cheerio');
mkdirp = require('mkdirp');

llab = require('./lib/llab');
util = require('./code/util');


curFolder = 'curriculum/edc/'
output = './tmp/';


BASEURL = '/bjc-r'; // MATCH LLAB.ROOTURL IN CURR REPO
if (true) {
    output += 'U1/';
    topic = 'nyc_bjc/1-intro-loops.topic';
} else {
    output += 'U2/';
    topic = 'nyc_bjc/2-conditionals-abstraction.topic';
}

topic = fs.readFileSync(util.topicPath(curFolder, topic));
topic = topic.toString();
data = llab.parse(topic);

// GLOBAL -- FIXME
var relPath;
var count;
var dir;
var PETER = false;


function doCSS(path) {
    path = path || './tmp/';
    
    var CSSFILES = [
        'curriculum/edc/llab/css/3.3.0/bootstrap-compiled.min.css',
        'curriculum/edc/llab/css/default.css',
        'curriculum/edc/css/bjc.css'
    ];

    var combinedCSS = CSSFILES.map(function(file) {
        return fs.readFileSync(file).toString();
    }).join('\n\n/******/\n\n');
    
    fs.writeFileSync(path + 'bjc-edx.css', combinedCSS);
}

doCSS();

cssPath = util.edXPath('bjc-edx.css');
cssString = '<link rel="stylesheet" href="' + cssPath + '">\n\n';

function loadFile (path) {

}

data.topics.forEach(parseTopic);


function parseTopic (topic, args) {
    topic.contents.forEach(parseSection, args);
}

function shouldParse (title) {
    return title.indexOf('Programming Lab') == 0 ||
    title.indexOf('Investigation') == 0;
}

function parseSection (section, skip) {
    var title = section.title.trim();
    
    if (!shouldParse(title) || skip === true) {
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

console.log('Suck it bitches. This content was converted.');

function processCurriculumItem (item) {
    if (!item.url) {
        return;
    } else if (item.url.indexOf(BASEURL) != 0) {
        return;
    }

    count += 1;
    file = item.url.replace(BASEURL, curFolder);
    relPath = path.relative(curFolder, file);
    console.log('FILE: ', file);
    html = fs.readFileSync(file);

    parts = splitFile(html, count, dir);
    parts.forEach(function(part, index) {
        var css = index == 0;
        var data = processHTML(part.content, css);
        console.log('WRITING CONTENT', dir + '/' + part.path);
        // FIXME this is broken.
        thing= (dir + '/' + part.path).split('/').slice(0, -1).join('/')
        mkdirp.sync(thing);
        fs.writeFileSync(dir + '/' + part.path, data);
    });
    
    return parts;
}


/** Does the work to modify a bunch of things to prep for edX
 *
 * @param {Cherrio-Object} The contents of the html file
 *
 */
function processHTML (html, includeCSS) {
    var i, imgs, runs, url, outerHTML, wrap;
    
    $ = cheerio.load(html);
    
    // Fix image URLs
    imgs = $('img');
    for (i = 0; i < imgs.length; i += 1) {
        url = imgs[i].attribs.src;
        imgs[i].attribs.src = util.transformURL(BASEURL, relPath, url);
    }

    // Fix Snap! run links.
    runs = $('a.run');
    for (i = 0; i < runs.length; i += 1) {
        url = runs[i].attribs.href;
        runs[i].attribs.href = util.transformURL(BASEURL, relPath, url);
    }

    // Remove EDC's inline HTML comments. (Why is it there.....)
    [
        '.comment',
        '.todo',
        '.commentBig'
    ].forEach(function (sel) { $(sel).remove(); });

    // wrap content in div.llab-full
    wrap = '<div class="llab-full">CONTENT</div>';
    
    outerHTML = wrap.replace(/CONTENT/, $.html());
    
    if (includeCSS != false) {
        outerHTML = cssString + outerHTML;
    }
    
    return outerHTML;
}

/** Split a single curriculum page into components to be in a vertical.
 *
 * @param {string} the raw HTML file to be processed
 */
function splitFile (html, page, dir) {
    var $, output, title, quizzes, qzHTML, text;

    output = [];
    $ = cheerio.load(html);

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
            if (PETER) {
                file = 'html/' + file;
            }
            output.push({
                type: 'html',
                content: before,
                path: file
            }); // part before quiz
        }
        
        num = output.length + 1;
        file = page + '-' + num + '-' + title + '.xml';
        if (PETER) {
            file = 'problem/' + file;
        }
        output.push({
            type: 'quiz',
            content: xml,
            path: file
        }); // push quiz
        text = text.slice(idx + qzHTML.length);
    });
    
    if (quizzes.length == 0) {
        file = page + '-' + title + '.html';
        if (PETER) {
            file = 'html/' + file;
        }
        output.push({
            type: 'html',
            content: text,
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
            skip = title.indexOf(sectionName) == -1;
            tmp = parseSection(section, skip)
            if (tmp) {
                result = tmp;
                return true;
            }
        })
    });

    return result;
}
