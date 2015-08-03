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
output = './tmp/U2/';
topic1 = 'nyc_bjc/1-intro-loops.topic';
topic2 = 'nyc_bjc/2-conditionals-abstraction.topic';

BASEURL = '/bjc-r'; // MATCH LLAB.ROOTURL IN CURR REPO
//topic = fs.readFileSync(util.topicPath(curFolder, topic1));
topic = fs.readFileSync(util.topicPath(curFolder, topic2));

topic = topic.toString();
data = llab.parse(topic);

CSSFILES = [
    'curriculum/edc/llab/css/3.3.0/bootstrap-compiled.min.css',
    'curriculum/edc/llab/css/default.css',
    'curriculum/edc/css/bjc.css'
]

var combinedCSS = CSSFILES.map(function(file) {
    return fs.readFileSync(file).toString();
}).join('\n\n/******/\n\n');

fs.writeFileSync('./tmp/bjc-edx.css', combinedCSS);

cssPath = util.edXPath('bjc-edx.css');
cssString = '<link rel="stylesheet" href="' + cssPath + '">';

function loadFile (path) {

}

data.topics.forEach(parseTopic);


function parseTopic (topic) {
    topic.contents.forEach(parseSection);
}

function parseSection (section) {
    if (section.title.indexOf(' Programming Lab') == 0 ||
        section.title.indexOf(' Investigation') == 0) {

        dir = output + section.title;
        // Make if it doesn't exist.
        mkdirp.sync(dir);
        count = 0;
        section.contents.forEach(processCurriculumItem)
    }
}

console.log('Suck it bitches. This content was converted.');

// GLOBAL -- FIXME
var relPath;
var count;
var dir;
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
        fs.writeFileSync(dir + '/' + part.path, data);
    });
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

    outerHTML = $.html();
    if (includeCSS != false) {
        outerHTML = cssString + outerHTML;
    }

    wrap = '<div class="full">CONTENT</div>';
    
    // wrap content in div.full
    return wrap.replace(/CONTENT/, outerHTML);
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
            output.push({
                type: 'html',
                content: before,
                path: file
            }); // part before quiz
        }
        
        num = output.length + 1;
        file = page + '-' + num + '-' + title + '.xml';
        output.push({
            type: 'quiz',
            content: xml,
            path: file
        }); // push quiz
        text = text.slice(idx + qzHTML.length);
    });
    
    if (quizzes.length == 0) {
        output.push({
            type: 'html',
            content: text,
            path: page + '-' + title + '.html'
        });
    }
    
    return output;
}

module.exports = function(path, section, output) {
    
}