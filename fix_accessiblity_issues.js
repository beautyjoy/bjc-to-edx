/*
    A utility to interactive add alt text and title text.
*/


// Default Node modules
let fs = require('fs');
let path = require('path');
let exec = require('child_process').execSync;
let process = require('process');

let cheerio = require('cheerio');
let prompt = require('prompt-sync')();

let llab = require('./lib/llab');

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

  topic = fs.readFileSync(`curriculum/bjc-r/topic/${topic}`);
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

  let file = item.url;

  if (!file.endsWith('.html')) { return; }

  console.info('Reading: ', file);

  try {
    let html = fs.readFileSync(`curriculum${file}`);
  } catch (err) {
    console.log(err);
    return;
  }

  fs.writeFileSync(`curriculum${file}`, processHTML(html));
  console.log('Wrote: ', file);
};

function processHTML(html) {
  var $ = cheerio.load(html, {
    normalizeWhitespace: false
  });

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
      console.log(`Image is missing alt text:\n\t${address}`);
      console.log(`Context: ${$elm.parent().text()}`);
      try {
        exec(`open 'curriculum/${address}'`);
      } catch {
        console.error(`Unable to open ${address}`);
      }
      altText = prompt('enter alt text for the image: ');
      altText = altText.trim()
      $elm.attr('alt', altText).attr('title', altText);
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

      if (href.indexOf('://') > -1) {
        try {
          exec(`open '${href}'`);
        } catch {}
      }

      let titleText = prompt('enter title text for link:');
      titleText = titleText.trim();
      $elm.attr('title', titleText);
    }
    // log URLs that need modified inside edx
    if (href.indexOf(BASEURL) == 0 && href.indexOf('.html') > 0) {
      console.log(`\tNeed to fix path in edX: ${href}`);
    }
  });

  return $.html();
}