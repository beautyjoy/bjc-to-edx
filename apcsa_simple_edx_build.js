/**  LLAB AUTOBUILD WIP SCRIPT
 *
 *  TODO: This script is NOT FINISHED
 *  run with `node test.js`
 */

// Default Node modules
fs = require('fs');
path = require('path');
exec = require('child_process').execSync;


cheerio = require('cheerio');
mkdirp = require('mkdirp');

llab = require('./lib/llab');
css = require('./code/css');
util = require('./code/util');
edx_util = require('edx_util');


var NATE_DEBUG = true;
function nateDEBUG(str) {
    if (NATE_DEBUG) {
        console.log(str);
    }
}



var PROCESS_FUNCTIONS = {
        file: processFile,
        quiz: processQuiz,
        markdown: processMarkdown,
        external: processExternal
    };

BASEURL = '/apcsa/r'; // MATCH LLAB.ROOTURL IN CURR REPO






/////////
///////// COURSE level

// This is where a llab course CONTENT lives
// This should be a checked out state
// TODO: Config param this shit.
curFolder = '../apcsa-r/main/';
    
// This is where the edX XML folder will be.
//output = './apcsa_edx_out/OUT/';
// if you want to make a new folder (i.e., not populate in existing)
output = './apcsa_edx_out/cur_' + new Date().toISOString() + "/";
output = output.replace(/:/g, "_");
output = output.replace("-", "_");


edx_util.startCourse(output);





//////////////
//////////////  CSS BS

//GLOBAL -- FIXME
var relPath;
var count;
var dir;
var PETER = false;

//var cssRelPath = path.relative(curFolder, 'curriculum/edc/llab/css/default.css');
//var CSSOptions = {
//    paths: [
//        // TODO: Use newer llab stuff?
//        // TODO: Exclude Bootstrap?
//        'curriculum/edc/llab/css/3.3.0/bootstrap-compiled.min.css',
//        'curriculum/edc/llab/css/default.css',
//        'curriculum/edc/css/bjc.css'
//    ],
//    rules: [
//        {
//            name: 'transform-urls',
//            // Params: baseURL, filePath
//            options: ['/bjc-r', cssRelPath]
//        },
//        {
//            name: 'rename-selectors',
//            options: ['.full', '.llab-full']
//        },
//        {
//            name: 'prefix-selectors',
//            options: '.llab-full'
//            // , exclude: /bootstrap/
//        }
//    ]
//};
//
//
//fs.writeFileSync('./tmp/' + 'bjc-edx.css', css(CSSOptions));

// NEED TO MANUALLY IMPORT CSS


function css_get_reference(cssfile) {
    var path = util.edXPath(cssfile);
    return '<link rel="stylesheet" href="' + path + '">\n\n';
}
var cssString = '';
cssString += css_get_reference('bootstrap.min.css');
cssString += css_get_reference('bootstrap-theme.min.css');
cssString += css_get_reference('brainstorm.css');
cssString += css_get_reference('matchsequence.css');
cssString += css_get_reference('default.css');
cssString += css_get_reference('ucb-apcsa.css');







/////////
///////// TOPICS/CHAPTER

var TOPICS_TO_PROCESS = [];

TOPICS_TO_PROCESS.push = ['c1/L1_objects_classes.topic', 'L1'];
//TOPICS_TO_PROCESS.push = ['c1/L2_first_programming.topic', 'L2'];
//TOPICS_TO_PROCESS.push = ['c1/L3_programming_2.topic', 'L3'];
//TOPICS_TO_PROCESS.push = ['c1/L4_conditionals_1.topic', 'L4'];
//TOPICS_TO_PROCESS.push = ['c1/L5_conditionals_2.topic', 'L5'];
//TOPICS_TO_PROCESS.push = ['c1/L6_virtual_pets.topic', 'L6'];

TOPICS_TO_PROCESS.forEach(function(topicpath, filename_prepend) {
    topic_do_me(TOPIC_TO_PROCESS[prepender], prepender);
});


edx_util.endCourse();



//var topic;
//var topicdata;
function topic_do_me(topicpath, prepeder) {
    
    
    topic = fs.readFileSync(util.topicPath(curFolder, topicpath));
    topic = topic.toString();
    topicdata = llab.parse(topic);
    topictitle = topicdata.title.trim();
    topictitle = topictitle || "TOPIC_TITLE";
    
    edx_util.startTopic(topicdata, topictitle, topicpath, prepender);
    topicdata.topics.forEach(parseTopic);
    edx_util.endTopic();
    
}


function parseTopic (topic, args) {
    topic.contents.forEach(parseSection, args);
}


///////////////////////  SEQUENTIAL / SECTION (topic heading)


function loadFile (path) {
    // ?
}

function shouldParse (title) {
    return true;
}



function parseSection (sectiondata, skip) {
    var title = sectiondata.title.trim();
    
    if (!shouldParse(title)) {
        console.log('skipping section:', title);
        return;
    }

    edx_util.startSection(sectiondata, title);

    sectiondata.contents.forEach(function (item) {
        processCurriculumItem(item);
    });

    edx_util.endSectin();
    
   
}




/////////////////////// VERTICAL / PAGE


// This needs renamed...
function processCurriculumItem (item) {
    if (!item.url) {
        console.log("skipping file: no url")
        return;
    } else if (item.url.indexOf(BASEURL) != 0) {
        return;
    }

    count += 1;
    file = item.url.replace(BASEURL, curFolder);
    relPath = path.relative(curFolder, file);
    console.log('FILE: ', file);
    html = fs.readFileSync(file);

nateDEBUG("process curriculum item: " );return;       
    
    parts = splitFile(html, count, dir);
    parts.forEach(function(part, index) {
        var css = index == 0;
        var data = processItem(part, css);
        // part.path is a file name
        console.log(dir);
        var folder = dir + '/' + part.directory
        console.log('WRITING CONTENT', folder + part.path);
        mkdirp.sync(folder);
        fs.writeFileSync(folder + part.path, data);
    });

    return parts;
};

function processItem (item, options) {
    return PROCESS_FUNCTIONS[item.type].call(null, item.content, options);
}

function processQuiz (quiz) {
    return quiz;
}

function processMarkdown (file) {
    return file;
}

function processFile (file, options) {
    // FIXME -- this is a simplification for now.
    return processHTML(file, options);
}

function processExternal (item, options) {
    return item;
}

/** Does the work to modify a bunch of things to prep for edX
 *
 * @param {Cherrio-Object} The contents of the html file
 *
 */
function processHTML (html, includeCSS) {
    var outerHTML, wrap;

    $ = cheerio.load(html);

    // Fix some of the EDC image elements with .button
    // These conflict with edX.
    $('.button').removeClass('button');

    // Fix image URLs
    $('img').each(function (index, elm) {
        var url = $(elm).attr('src');
        $(elm).attr('src', util.transformURL(BASEURL, relPath, url));
    });

    // Fix Snap! run links.
    console.log('Found ', $('a').length, ' ALL urls.');
    console.log('Transforming ', $('a.run').length, ' STARTER FILE urls.');
    $('a.run').each(function (index, elm) {
        var url = $(elm).attr('href');
        $(elm).attr('href', util.transformURL(BASEURL, relPath, url));
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


console.log('This conversion is done!');