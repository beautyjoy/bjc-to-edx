

fs = require('fs');
path = require('path');

cheerio = require('cheerio');
mkdirp = require('mkdirp');

llab = require('./lib/llab');
util = require('./code/util');



curFolder = 'curriculum/edc/'
topic1 = 'nyc_bjc/1-intro-loops.topic';
BASEURL = '/bjc-r';
topic = fs.readFileSync(util.topicPath(curFolder, topic1));
topic = topic.toString();
data = llab.parse(topic);

CSSFILES = [
    'curriculum/edc/llab/css/3.3.0/bootstrap-compiled.min.css'
]



var output = './tmp/';
data.topics.forEach(function (topic) {
    topic.contents.forEach(function (section) {
        if (section.title.indexOf(' Programming Lab') == 0) {
            count = 0;
            section.contents.forEach(function (item) {
                if (!item.url) {
                    return;
                } else if (item.url.indexOf(BASEURL) != 0) {
                    return;
                }
                
                count += 1;
                file = item.url.replace(BASEURL, curFolder);
                console.log('FILE: ', file);
                html = fs.readFileSync(file);
                $ = cheerio.load(html);
                imgs = $('img');
                for (var i = 0; i < imgs.length; i += 1) {
                    relPath = path.relative(curFolder, file);
                    url = imgs[i].attribs.src;
                    imgs[i].attribs.src = util.transformURL(BASEURL, relPath, url);
                }
                data = $('body').html();
                dir = output + section.title;
                mkdirp.sync(output + section.title);
                fs.writeFileSync(dir + '/edx-' + count + '.html', data);
            })
        }
    })
})

require('repl').start('> ');
