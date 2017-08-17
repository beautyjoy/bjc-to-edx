/*
    A utility to interactively add alt text and title text.
*/


// Default Node modules
let fs = require('fs');
let path = require('path');
let exec = require('child_process').execSync;
let process = require('process');

let cheerio = require('cheerio');
let prompt = require('prompt-sync')();
let Babyparse = require('babyparse');

let llab = require('./lib/llab');

var BASEURL = '/bjc-r';
//
var INTERACTIVE = 'interactive';
var CSV = 'csv';
var REPORT = 'report';
var MODE = REPORT;

// TODO: use optparse or something
let args = process.argv;
if (args.length > 2) {
  let unit = parseInt(args[2]);
  let csvPath = args.length > 3 ? args[3] : null
  console.log(`Processing Unit ${unit}`);
  doWork(unit, csvPath);
  console.log('Processed all items');
  process.exit(0);
}

function doWork(unit, csvPath) {
  let unit_files = {
    1: 'intro-loops.topic',
    2: 'conditionals-abstraction.topic',
    3: 'lists.topic',
    4: 'internet.topic',
    5: 'algorithms.topic',
    6: 'recursion-trees-fractals.topic',
    7: 'recursive-reporters.topic'
  };

  let csvData = {};
  if (csvPath) {
    let csvFile = fs.readFileSync(csvPath).toString();
    csvData = Babyparse.parse(csvFile).data;
  }

  topic = `nyc_bjc/${unit}-${unit_files[unit]}`;
  topic = fs.readFileSync(`curriculum/bjc-r/topic/${topic}`);
  topic = topic.toString();
  data = llab.parse(topic);

  data.topics.forEach(parseTopic, {
    mode: MODE,
    data: csvData
  });
  console.log(`Unit ${unit} processing is done!\n=============\n`);
}

function parseTopic(topic, opts) {
  topic.contents.forEach(parseSection, opts);
}

function parseSection(section, opts) {
  section.contents.forEach(item => processCurriculumItem(item, opts));
}

function processCurriculumItem(item, options) {
  if (!item.url || !item.url.startsWith(BASEURL)) {
    return;
  }

  let file = item.url;

  if (!file.endsWith('.html')) { return; }

  console.info('Reading: ', file);

  let html;
  try {
    html = fs.readFileSync(`curriculum${file}`);
  } catch (err) {
    console.log(err);
    return;
  }

  let output = processHTML(html, options);

  if (MODE !== REPORT) {
    fs.writeFileSync(`curriculum${file}`, output);
    console.log('Wrote: ', file);
  }
};

// TODO extract this out into a library
/*
    options: {
        mode: CSV|REPORT|INTERACTIVE,
        data: a lookup table: {
            'file/path': 'some alt text'
        }
    }
*/
function processHTML(html, options) {
  let $ = cheerio.load(html, {
    normalizeWhitespace: false
  });

  options = options || {};

  $('img').each((_, elm) => {
    let $elm = $(elm);
    let address = $elm.attr('src') || $elm.attr('data-gifffer');

    if (!address) {
      console.log('ERROR');
      console.log(elm);
      return;
    }

    let altText = $elm.attr('alt');
    if (!altText) {
      if (options.mode !== CSV) {
        console.log(`Image is missing alt text:\n\t${address}`);
      } else {
        let text = options.data[address];
        if (text) {
          $elm.attr('alt', text).attr('title', text);
        }
      }

      if (options.mode === INTERACTIVE) {
        console.log(`Context: ${$elm.parent().text()}`);
        try {
          let flags = '-g';
          if (address.indexOf('.gif') > 0) {
            flags = '-g -a Safari';
          }
          exec(`open ${flags} 'curriculum/${address}'`);
        } catch (e) {
          console.error(`Unable to open ${address}`);
        }
        altText = prompt('enter alt text for the image: ');
        altText = altText.trim()
        $elm.attr('alt', altText).attr('title', altText);
      }
    }
  });

  $('a').each((_, elm) => {
    let $elm = $(elm);
    var href = $elm.attr('href');

    if (!href) { return; }

    if (!$elm.attr('title')) {
      if (options.mode !== CSV) {
        console.log(`URL needs title: ${href}, "${$(elm).text()}`);
      } else {
        if (options.data[href]) {
          $elm.attr('title', options.data[href]);
        }
      }
      if (options.mode == INTERACTIVE) {
        if ($elm.hasClass('run')) {
          console.log('Snap File');
        }

        console.log(`
          URL needs title: ${href}, "${$(elm).text()}
          PARENT:
          ${$(elm).parent().text}
        `);

        if (href.indexOf('://') > -1) {
          try {
            exec(`open -g '${href}'`);
          } catch (e) {

          }
        }

        let titleText = prompt('enter title text for link:');
        titleText = titleText.trim();
        $elm.attr('title', titleText);
      }
    }

    // log URLs that need modified inside edx
    if (href.indexOf(BASEURL) == 0 && href.indexOf('.html') > 0) {
      console.log(`\tNeed to fix path in edX: ${href}`);
    }
  });

  return $.html();
}