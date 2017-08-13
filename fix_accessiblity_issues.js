/*
    A utility to interactive add alt text and title text.
*/


// Default Node modules
let fs = require('fs');
let path = require('path');
let exec = require('child_process').execSync;
let process = require('process');

let cheerio = require('cheerio');
let mkdirp = require('mkdirp');
let prompt = require('prompt-sync')

let llab = require('./lib/llab');
let util = require('./code/util');

var BASEURL = '/bjc-r';

if (process.argv.length > 2) {
  var start = 2,
    end = process.argv.length;
  for (var arg = start; arg < end; arg += 1) {
    var item = process.argv[arg];
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

function doWork(unit) {
  let unit_files = {
    1: 'intro-loops.topic',
    2: 'conditionals-abstraction.topic',
    3: 'lists.topic',
    4: 'internet.topic',
    5: 'algorithms.topic',
    6: 'recursion-trees-fractals.topic',
    7: 'recursive-reporters.topic'
  };

  topic = `nyc_bjc/${unit}-${unit_files[unit]}`;

  topic = fs.readFileSync(util.topicPath('curriculum/bjc-r/', topic));
  topic = topic.toString();
  data = llab.parse(topic);

  data.topics.forEach(parseTopic);
  console.log(`Unit ${unit} conversion is done!\n=============\n`);
}

function parseTopic(topic, args) {
  topic.contents.forEach(parseSection, args);
}

function parseSection(section, skip) {
  section.contents.forEach(item => processCurriculumItem(item));
}

function processCurriculumItem(item) {
  if (!item.url || !item.url.startsWith(BASEURL)) {
    return;
  }

  file = item.url;

  if (!file.endsWith('.html')) { return; }

  console.info('Reading: ', file);

  try {
    html = fs.readFileSync(`curriculum${file}`);
  } catch (err) {
    console.log(err);
    return;
  }


  data = processHTML(html),
  fs.writeFileSync(`curriculum${file}`, data);
  console.log('Wrote: ', file);
};

function processHTML(html, writeCSS) {
  var $, outerHTML, wrap;

  $ = cheerio.load(html, {
    normalizeWhitespace: true,
    xmlMode: true,
    decodeEntities: true
  });

  $('img').each((_, elm) => {
    let $elm = $(elm);
    let address = $elm.attr('src') || $elm.attr('data-gifffer');

    if (!address) {
      console.log('ERROR');
      console.log(elm);
      return;
    }

    let external_link = address.indexOf('://') !== -1;
    if (external_link) { return; }

    let altText = $elm.attr('alt');
    if (!altText) {
      console.error(`Image is missing alt text:\n\t${address}`);
    }
  });

  $('a').each((_, elm) => {
    let $elm = $(elm);
    var href = $elm.attr('href');

    if (!href) { return; }

    // Handle Snap! URLs and projects.
    if ($elm.hasClass('run')) {
      console.log('Snap File');
    }

    if (!$(elm).attr('title')) {
      console.log(`\tURL needs title: ${href}, "${$(elm).text()}"`);
    }
    // log URLs that need modified inside edx
    if (href.indexOf(BASEURL) == 0 && href.indexOf('.html') > 0) {
      console.log(`\tNeed to fix path in edX: ${href}`);
    }
  });

  return $.html();
}