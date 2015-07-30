

fs = require('fs');
path = require('path');

cheerio = require('cheerio');
mkdirp = require('mkdirp');

llab = require('./lib/llab');
util = require('./code/util');



curFolder = 'curriculum/edc/'
output = './tmp/U2/';
topic1 = 'nyc_bjc/1-intro-loops.topic';
topic2 = 'nyc_bjc/2-conditionals-abstraction.topic';

BASEURL = '/bjc-r'; // MATCH LLAB.ROOTURL IN CURR REPO
 topic = fs.readFileSync(util.topicPath(curFolder, topic1));
//topic = fs.readFileSync(util.topicPath(curFolder, topic2));

topic = topic.toString();
data = llab.parse(topic);

CSSFILES = [
    'curriculum/edc/llab/css/3.3.0/bootstrap-compiled.min.css',
    'curriculum/edc/llab/css/default.css',
    'curriculum/edc/css/bjc.css'
]

var combinedCSS = CSSFILES.map(function(file) {
    fs.readFileSync(file).toString();
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
        section.contents.forEach(function (item) {
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

            $ = cheerio.load(html);
            // Fix image URLs
            imgs = $('img');
            for (var i = 0; i < imgs.length; i += 1) {
                url = imgs[i].attribs.src;
                imgs[i].attribs.src = util.transformURL(BASEURL, relPath, url);
            }

            // Fix Snap! run links.
            runs = $('a.run');
            for (var i = 0; i < runs.length; i += 1) {
                url = runs[i].attribs.href;
                runs[i].attribs.href = util.transformURL(BASEURL, relPath, url);
            }

            parts = [];
            text = $('body').html()
            // parse quizes separately.
            quizzes = $('div.assessment-data');
            console.log('Found ', quizzes.length, ' quizzes.');
            quizzes.each(function(index, elm) {
                qzHTML = $.html(elm); // like a call to outerHTML()
                var idx = text.indexOf(qzHTML);
                parts.push(text.slice(0, idx)); // part before quiz
                parts.push(qzHTML); // push quiz
                text = text.slice(idx + qzHTML.length);
            });

            parts = parts.filter(function(item) {
                return item.trim().length != 0;
            });

            if (parts.length > 0) {
                parts.forEach(function (item, idx, array) {
                    data = cssString + text;
                    fs.writeFileSync(dir + '/' + count + '-' + idx +
                                        '-curriculum.html', data);
                });
            } else {
                // FIXME.
                data = cssString + text;
                fs.writeFileSync(dir + '/' + count + '-curriculum.html', data);
            }
        })
    }
}

// require('repl').start('> ');


// QUIZ_REGEX = /(?=<div[.*?\n]class=["']assessment-data["'][.*?\n]>[.*?\n]</div>)/ig