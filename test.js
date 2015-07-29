

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
BASEURL = '/bjc-r';
 topic = fs.readFileSync(util.topicPath(curFolder, topic1));
//topic = fs.readFileSync(util.topicPath(curFolder, topic2));

topic = topic.toString();
data = llab.parse(topic);

CSSFILES = [
    'curriculum/edc/llab/css/3.3.0/bootstrap-compiled.min.css',
    'curriculum/edc/llab/css/default.css',
    'curriculum/edc/css/bjc.css'
]

var combinedCSS = '<style>\n'

CSSFILES.forEach(function(file) {
    combinedCSS += fs.readFileSync(file).toString();
})

combinedCSS += '\n</style>\n\n'

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
            
            // parse quizes separately.
            quizzes = $('div.assessment-data');
            console.log('Found ', quizzes.length, ' quizzes.');
            
            data = combinedCSS + $('body').html();
            fs.writeFileSync(dir + '/' + count + '-curriculum.html', data);
        })
    }
}


require('repl').start('> ');
