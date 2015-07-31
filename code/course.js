
var fs = require('fs');
var yaml = require('js-yaml');
var et = require('elementtree');
var child_process = require('child_process');

var course = {};
var config, outline, outputDir;

/* Copies the template xml course and fills in course/outline.xml with
 * pointers to chapter files. */
var buildCourse = function(courseDirectory, options) {
    config = yaml.load(fs.readFileSync(courseDirectory + 'config.yml'));
    outline = yaml.load(fs.readFileSync(courseDirectory + 'outline.yml'));

    // copy the template/ directory
    outputDir = 'output-course/'; // TODO: this should be read from the config
    child_process.execSync('cp -R template ' + outputDir);
    
    var outlineFile = fs.openSync(outputDir + 'course/outline.xml', 'w+');
    var outlineXml = et.parse(outlineFile); // something with ElementTrees

    outline.chapters.forEach(function(chapter) {
	var chapterLoc = buildCourse(chapter);
	// make new xml 'chapter' node
	// set node's 'url_name' attribute to chapterLoc
        // append to outlineXml 'course' node
    });
    // write back out to outlineFile
};
course.buildCourse = buildCourse;

/* Creates and fills in files in chapter/, each of which points to
 * several sequential files. Returns the filename of the created
 * chapter. */
var buildChapter = function(chapterOutline) {
    // create xml tree with 'chapter' as root node
    var chapterTitle = chapterOutline.title;
    // set display_name attribute  of 'chapter' to chapterTitle
    chapterOutline.sections.forEach(function(section) {
	var sequentialLocation = buildSequential(section);
	// create 'sequential' xml node
	// set url_name attribute to sequentialLocation
	// append to 'chapter' node
    });
    var fileName = outputDir + "chapter/" + chapterTitle + ".xml";
    var chapterFile = fs.openSync(fileName);
    // write xml object out to chapterFile
    return fileName;
};

/* Creates and fills in files in sequential/, each of which points to
 * several vertical files. */
var buildSequential = function(sequentialOutline) {

};

/* Creates and fills in files in vertical/, each of which points to
 * several curriculum elements (html files, quiz problems, videos,
 * etc). */
var buildVertical = function(verticalOutline) {
    
};

module.exports = course;
