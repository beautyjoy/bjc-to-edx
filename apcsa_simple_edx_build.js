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
edx_util = require('./code/edx_util');


//////////////////////////////////

var TOPICS_TO_PROCESS = [];

TOPICS_TO_PROCESS.push(['c1/L1_objects_classes.topic', 'L1_']);
TOPICS_TO_PROCESS.push(['c1/L2_first_programming.topic', 'L2_']);
//TOPICS_TO_PROCESS.push(['c1/L3_programming_2.topic', 'L3_']);
//TOPICS_TO_PROCESS.push(['c1/L4_conditionals_1.topic', 'L4_']);
//TOPICS_TO_PROCESS.push(['c1/L5_conditionals_2.topic', 'L5_']);
//TOPICS_TO_PROCESS.push(['c1/L6_virtual_pets.topic', 'L6_']);


//////////////////////////

var DEBUGMODE = true;
function DEBUG(str) {
    if (DEBUGMODE) {
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


 
//GLOBAL -- FIXME
var relPath;
var count;
var dir;
var PETER = false;



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

//DEBUG("starting course: " + output);
edx_util.startCourse(output);





//////////////
//////////////  CSS BS



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



TOPICS_TO_PROCESS.forEach(function(topicinfo) {
    var topicpath = topicinfo[0];
    var prepender = topicinfo[1];
DEBUG("TOPIC sez do me: " + topicpath + " , " + prepender);
    topic_do_me(topicinfo[0], topicinfo[1]);
});


edx_util.endCourse();



//var topic;
//var topicdata;
function topic_do_me(topicpath, prepender) {
    
    
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
DEBUG("SECTION sez do me : " + title);
    edx_util.startSection(sectiondata, title);

    sectiondata.contents.forEach(function (page) {
        processPage(page);
    });

    edx_util.endSection();
    
   
}




/////////////////////// VERTICAL / PAGE

// TODO figure out how to do edx-specific components (e.g., stuff that doesn't
//    show up in llab-format -- autograding, etc.

// TODO bring back the split stuff -- apcsa will use it eventually

// This needs renamed...
function processPage (pagedata) {
    var item = pagedata;
    if (!item.url) {
        console.log("skipping file: no url")
        return;
    } else if (item.url.indexOf(BASEURL) != 0) {
        return;
    }
    

    var file = item.url.replace(BASEURL, curFolder);
    var relPath = path.relative(curFolder, file);
    var basename_base = path.basename(file, ".html");
//DEBUG('FILE: ' +  file);
    var html = fs.readFileSync(file);
    var $ = cheerio.load(html);
    
    var title = $('title').html();
    var text = $('body').html();
    
    edx_util.startVertical(relPath, title);
    
    //////// do  parts
    var partnum = 1;
    var get_part_basename = function () {
        return basename_base + "_p" + partnum++; 
    }
    // APCSA doesn't need to split files right now
    // parse quizes separately.
    var quizzes = $('div.assessment-data');
    if (quizzes.length > 0) {
        // quiz
        var xml = assessmentData2EdxProblem($, quizzes[0]);   // TODO only one in apcsa right now
        edx_util.addQuizEdxFormatComponent(xml, get_part_basename());
    } else {
        // html
        var proc_html = processHTML(html, true);
        edx_util.addHTMLComponenet(proc_html, title, get_part_basename());
    }
    
    edx_util.endVertical();
}
    
    



//TODO use cheerio rather than python craziness
function assessmentData2EdxProblem($, assessData) {
    var qzHTML = $.html(assessData); // like a call to outerHTML()
//console.log("ASSDAT2EDX : qzhtml-> " + qzHTML);
    
    var command;
    //var exec = "python3";
    var cmd = "/Anaconda3/python.exe";
    
    // pass in qzHTML as string
    // TODO replace doublequote with singlequote in qzHTML, just in case. 
    // or escape single quotes.
    // command = cmd + ' code/mc_parser.py \'' + qzHTML + '\'';
    
    // write ass-data to file, rather than pass in as string.  Overwrite whatever's there.
    var filename = "./apcsa_edx_out/CUR_ASSESSMENT_DATA.html";
    fs.writeFileSync(filename, qzHTML);
    command = cmd + ' code/mc_parser.py ' + filename;
        
    var xml = exec(command).toString();   // returns a buffer
   

    return xml;
}






///////////////////////////// PARTS



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

//    // Fix Snap! run links.
//    console.log('Found ', $('a').length, ' ALL urls.');
//    console.log('Transforming ', $('a.run').length, ' STARTER FILE urls.');
//    $('a.run').each(function (index, elm) {
//        var url = $(elm).attr('href');
//        $(elm).attr('href', util.transformURL(BASEURL, relPath, url));
//    });

    // Remove EDC's inline HTML comments. (Why is it there.....)
//    [
//        '.comment',
//        '.todo',
//        '.commentBig'
//    ].forEach(function (sel) { $(sel).remove(); });

    // wrap content in div.llab-full
    //wrap = '<div class="llab-full">CONTENT</div>';
    //outerHTML = wrap.replace(/CONTENT/, $.html());
    outerHTML = $.html();

    if (includeCSS != false) {
        outerHTML = cssString + outerHTML;
    }

    
    // HACKOLA - put in stub
    return getTestHTMLPage();
    
    return outerHTML;
}



function getTestHTMLPage() {
    var str = '<div class="apcsa_full"> <link rel="stylesheet" type="text/css" media="screen" href="/static/css_ucb_apcsa.css" />  <div class="header" audio="audio_header">STUB PAGE RIGHT NOW, TESTING</div>  <div id="marginCol"><div class="vocab"><a href="http://veritas.eecs.berkeley.edu/apcsa-ret/page/glossary.php?term=uniform distribution" target="_vocab">uniform distribution</a></div></div><div id="mainCol"> <p audio="2">The way to look at many, many rolls is with a chart.  The <tt>lesson10/Dice2</tt> project contains a bar chart class that can show the roll of a single die.  A good random number generator will make a <span class="vocab" term="uniform distribution">uniform distribution</span>, or a set of numbers in which any particular number is as likely as any other.  </p>  <div class="openbluejproj" project="c2/random/Dice2">   <p audio="1">Open the current project in BlueJ, and use the <tt>DieRollGenerator</tt> and    <tt>BarChart6</tt> classes to look at many, many rolls of your dice generator.      (<b>random/Dice2</b>).          </p>       </div>       <br><div class="imageCenter">  <img src="/static/art_scenes_random_dice.png" alt="Twitterton in trouble"></div> </div></div>';
    return str;
}



//////////////////////////// done


module.exports = "non requireable, you spud";


console.log('This conversion is done!');