/**  LLAB AUTOBUILD WIP SCRIPT
 *
 *  TODO: This script is NOT FINISHED
 *  run with `node edc_test.js UNIT_NUM`
 */

// Default Node modules
var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;
var process = require('process');

var cheerio = require('cheerio');
var mkdirp = require('mkdirp');

var llab = require('./lib/llab');
var css = require('./code/css')
var util = require('./code/util');

// Use an object like a hash.
var processedPaths = {};

BASEURL = '/bjc-r'; // MATCH LLAB.ROOTURL IN CURR REPO
// This is where a llab course CONTENT lives
// This should be a checked out state
curFolder = `curriculum${BASEURL}/`;
// This is where the edX XML folder will be.
baseOutput = './tmp';

let unit_files = {
  1: 'intro-loops.topic',
  2: 'conditionals-abstraction.topic',
  3: 'lists.topic',
  4: 'internet.topic',
  5: 'algorithms.topic',
  6: 'recursion-trees-fractals.topic',
  7: 'recursive-reporters.topic'
};

var cssRelPath = path.relative(
  curFolder,
  'curriculum/bjc-r/llab/css/default.css'
);

var CSSOptions = {
  paths: [
    // TODO: Use newer llab stuff?
    // TODO: Exclude Bootstrap?
    curFolder + '/llab/css/3.3.0/bootstrap-compiled.min.css',
    curFolder + '/llab/css/default.css',
    curFolder + '/css/bjc.css'
  ],
  rules: [{
    name: 'transform-urls',
    // Params: llab base url, relative file paths
    options: [BASEURL, cssRelPath]
  }, {
    name: 'rename-selectors',
    options: ['.full', '.llab-full']
  }, {
    name: 'prefix-selectors',
    options: '.llab-full'
      // , exclude: /bootstrap/
  }]
};

// GLOBAL -- FIXME
var relPath;
var count;
var dir;
var PETER = false;

// TODO: This seems redundant, mostly.
var PROCESS_FUNCTIONS = {
  file: processFile,
  quiz: processQuiz,
  txt: processTxt,
  markdown: processMarkdown,
  external: processExternal,
  script: processScript
};

// TODO: fixme (refactor to not make this a global)
var cssString = '';

function doWork(unit) {
  topic = `nyc_bjc/${unit}-${unit_files[unit]}`;
  output = `${baseOutput}/U${unit}`;
  mkdirp.sync(output);
  // edX static files directory.
  mkdirp.sync(`${output}/static`);

  topic = fs.readFileSync(util.topicPath(curFolder, topic));
  topic = topic.toString();
  data = llab.parse(topic);

  // TODO: Extract into preable section.
  CSS_FILE_NAME = 'bjc-edx.css';
  fs.writeFileSync(
    `${output}/static/${CSS_FILE_NAME}`,
    css(CSSOptions)
  );

  cssString = `
    <link rel="stylesheet" href="${util.edXPath(CSS_FILE_NAME)}">
    <script src="${util.edXPath('edx-llab-hack.js')}"></script>\n
  `;
  fs.writeFileSync(
    `${output}/static/edx-llab-hack.js`,
    fs.openSync('edx-llab-hack.js', 'r')
  );

  data.topics.forEach(parseTopic);
  console.log(`Unit ${unit} conversion is done!\n=============\n`);
}

function loadFile(path) {}

function parseTopic(topic, args) {
  topic.contents.forEach(parseSection, args);
}

// TODO: Make this a config item
function shouldParse(title) {
  return true;
}

function parseSection(section, skip) {
  var title = section.title.trim();

  if (!shouldParse(title)) {
    console.log('skipping:', title);
    return;
  }

  dir = output;
  if (!PETER) {
    dir += `/${title}`;
  }

  mkdirp.sync(dir);
  count = 0;
  section.contents.forEach(item => processCurriculumItem(item));
}

// This needs renamed...
function processCurriculumItem(item) {
  if (!item.url || !item.url.startsWith(BASEURL)) {
    return;
  }

  file = item.url.replace(BASEURL, curFolder);
  relPath = path.relative(curFolder, file);

  if (!file.endsWith('.html') || processedPaths[file] == 1) {
    return;
  }

  console.info('Reading: ', file);
  count += 1;
  processedPaths[file] = 1;

  try {
    html = fs.readFileSync(file);
  } catch (err) {
    console.log(err);
    return;
  }

  parts = splitFile(html, count, dir);
  parts.forEach(function(part, index) {
    var includeCSSLink = index === 0,
      data = processItem(part, includeCSSLink),
      folder = `${dir}/${part.directory}`;
    mkdirp.sync(folder);
    fs.writeFileSync(folder + part.path, data.content || data);
    // console.log('Wrote: ', folder + part.path);
  });
};

function processItem(item, options) {
  return PROCESS_FUNCTIONS[item.type].apply(null, arguments);
}

function processFile(item, options) {
  // FIXME -- this is a simplification for now.
  return processHTML(item.content, options);
}


// TODO: These are simplifications.
// They are just ID functions
// Rethink?
function processTxt(content) {
  return content;
}

function processExternal(content) {
  return content;
}

function processQuiz(content) {
  return content;
}

function processMarkdown(content) {
  return content;
}

function processScript(item) {
  return item.content;
}

function processHTMLSegment(htmlContent, transformations) {

}

/** Does the work to modify a bunch of things to prep for edX
 *
 * @param {Cherrio-Object} The contents of the html file
 *
 */
// TODO: This needs to take in an array of functions.
// TODO: rename this processHTMLSegment
function processHTML(html, writeCSS) {
  var $, outerHTML, wrap;

  $ = cheerio.load(html, { normalizeWhitespace: true });

  // Fix some of the EDC image elements with .button
  // These conflict with edX.
  $('.button').removeClass('button');

  // Fix image URLs
  $('img').each((_, elm) => {
    let $elm = $(elm);
    var img_addr = $elm.attr('src') || $elm.attr('data-gifffer'),
      newPath;

    if (!img_addr) {
      console.log('ERROR');
      console.log(elm);
      return;
    }

    let external_link = img_addr.indexOf('://') !== -1;
    if (external_link) {
      return;
    }

    newPath = util.transformURL(BASEURL, relPath, img_addr);
    $elm.attr('src', newPath);

    let altText = $elm.attr('alt');
    if (!altText) {
      console.error(`Image is missing alt text:\n\t${newPath}`);
    }

    // Don't copy files more than once, minor optimization
    if (!processedPaths[newPath]) {
      fs.writeFileSync(
        `${output}/${newPath}`,
        fs.readFileSync(`curriculum${img_addr}`)
      );
      processedPaths[newPath] = 1;
    }
  });

  // Create Real Heading Tags
  let sectionHeadings = {
    '.dialog': 'Thinking Out Loud',
    '.forYouToDo': 'For You To Do',
    '.ifTime': 'If There Is Time...',
    '.takeItFurther': 'Take It Further',
    '.time': 'If you are short on time, you can skip...'
  };
  let secetions = Object.keys(sectionHeadings);
  secetions.forEach(section => {
    $(section).each((index, elm) => {
      let headingText = sectionHeadings[section];
      if (index > 0) {
        headingText += ` (Part ${index + 1})`;
      }
      $(elm).prepend(`<h3 class="sectionHeading">${headingText}</h3>`)
    });
  });

  // Fixup "Vocabulary"
  let vocabSections = [
    '.vocab',
    '.vocabBig',
    '.vocabFullWidth'
  ].join(', ');
  $(vocabSections).each((_, elm) => {
    $(elm).prepend('<span class="vocab-header">Vocabulary</span>');
  });

  // Fix Snap! run links.
  let allURLs = $('a');
  let snapURLs = $('a.run');
  allURLs.each(function(index, elm) {
    let $elm = $(elm);
    var href = $elm.attr('href');

    if (!href) { return; }

    if (!$(elm).attr('title')) {
      console.log(`\tURL needs title: ${href}, "${$(elm).text()}"`);
    }
    // log URLs that need modified inside edx
    if (href.indexOf(BASEURL) > -1 && href.indexOf('.html' > -1)) {
      console.log(`\tNeed to fix path in edX: ${href}`);
    }

    // Handle Snap! URLs and projects.
    if ($elm.hasClass('run')) {
      let newPath = util.transformURL(BASEURL, relPath, href);
      $elm.attr('target', '_blank').attr('href', newPath);

      // TODO: extract to copy file function
      if (!processedPaths[newPath]) {
        fs.writeFileSync(
          `${output}/${newPath}`,
          fs.readFileSync(`curriculum${href}`)
        );
        processedPaths[newPath] = 1;
      }
    }
  });

  // Remove EDC's inline HTML comments.
  [
    '.comment',
    '.todo',
    '.commentBig'
  ].forEach(function(sel) {
    $(sel).remove();
  });

  // wrap content in div.llab-full
  wrap = '<div class="llab-full">CONTENT</div>';

  outerHTML = wrap.replace(/CONTENT/, $.html());

  // TODO: This is really broken
  if (writeCSS) {
    outerHTML = cssString + outerHTML;
  }

  return outerHTML;
}

/*
    Return a string of the CSS contensts and any JS contents that should appear
    at the top of the page.
    Typically this section only needs to appear once per edX 'vertical'
*/
function HTMLPreamble() {

}

/** Split a single curriculum page into components to be in a vertical.
 *
 * @param {string} the raw HTML file to be processed
 */
function splitFile(html, page, dir) {
  var $, output, title, quizzes, qzHTML, text;

  output = [];
  $ = cheerio.load(html);

  // EDC Puts an <h2> at the beginning of every page.
  title = $('h2').first().text();
  // Remove the title because edX flags this.
  $('h2').first().remove()

  // Extract JS scripts from the head.
  // TODO: Move to the 'preamble'
  const giffer = 'window.onload = function() {Gifffer();}';
  $('head script').each(function(index, elm) {
    let contents = $(elm).html();
    let hasContent = !$(elm).attr('src') && contents.length;
    if (contents == giffer) { return; }
    if (hasContent) {
      console.log('Page has custom JS element');
      let num = output.length + 1;
      let file = page + '-' + num + '-' + title + '.js';
      file = util.edXFileName(file);
      output.push({
        type: 'script',
        title: num + '-' + title,
        content: `<script type="text/javascript">\n${contents}\n</script>`,
        directory: 'html/',
        path: file
      });
    }
  })

  text = $('body').html()
  // parse quizes separately.
  quizzes = $('div.assessment-data');
  if (quizzes.length) {
    console.log('Found ', quizzes.length, ' quizzes.');
  }
  quizzes.each(function(index, elm) {
    qzHTML = $.html(elm); // like a call to outerHTML()
    command = 'python3 code/mc_parser.py \'' + qzHTML + '\'';
    xml = exec(command).toString();
    var idx = text.indexOf(qzHTML);
    var before = text.slice(0, idx).trim();

    if (before.length) {
      $before = cheerio.load(before);
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
      title: num + '-' + 'Quiz-' + title,
      content: xml,
      directory: 'problem/',
      path: file
    }); // push quiz
    text = text.slice(idx + qzHTML.length);
  });

  if (quizzes.length == 0) {
    file = `${page}-${title}.html`;
  } else {
    num = output.length + 1;
    file = `${page}-${num}-${title}.html`;
  }
  if (text.length) {
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

// TODO: Document...
module.exports = function(path, sectionName, directory) {
  // Globals
  PETER = true;
  // util.topicPath(curFolder, path) == assuming we have some folder.
  topic = fs.readFileSync(path).toString();
  data = llab.parse(topic);
  output = directory;

  var topic, data, result;

  data.topics.forEach(function(topic) {
    topic.contents.some(function(section) {
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

//////////////////////////////////////////

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
