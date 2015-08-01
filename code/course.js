
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
    child_process.execSync('rm -rf ' + outputDir); // TODO: this can be exploited in the most gristly of ways...
    child_process.execSync('cp -R template ' + outputDir);
    
    var outlineFile = outputDir + 'course/outline.xml';
    var outlineXml = et.parse(fs.readFileSync(outlineFile).toString());

    outline.chapters.forEach(function(chapter) {
	var chapterLoc = buildChapter(chapter);
	var chapterXml = et.SubElement(outlineXml.getroot(), 'chapter'); // make new xml 'chapter' node, and append to course outline
	chapterXml.set('url_name', chapterLoc); // set node's 'url_name' attribute to chapterLoc
    });
    fs.writeFileSync(outlineFile, outlineXml.write({'xml_declaration': false})); // write back out to outlineFile
};
course.buildCourse = buildCourse;

/* Creates and fills in files in chapter/, each of which points to
 * several sequential files. Returns the filename of the created
 * chapter. */
var buildChapter = function(chapterOutline) {
    var chapterXml = new et.ElementTree(et.Element('chapter'));
    var chapterTitle = chapterOutline.title;
    chapterXml.getroot().set('display_name', chapterTitle);
    chapterOutline.sections.forEach(function(section) {
	var sequentialLocation = buildSequential(section);
	var sequentialNode = et.SubElement(chapterXml.getroot(), 'sequential');
	sequentialNode.set('url_name', sequentialLocation);
    });
    var fileName = chapterTitle + '.xml';
    fs.writeFileSync(outputDir + 'chapter/' + fileName,
		     chapterXml.write({'xml_declaration': false}));
    return fileName;
};

/* Creates and fills in files in sequential/, each of which points to
 * several vertical files. */
var buildSequential = function(sequentialOutline) { // TODO: this function is very similar to buildChapter -- can probably generalize
    var sequentialXml = new et.ElementTree(et.Element('sequential'));
    var sequentialTitle = sequentialOutline.title;
    sequentialXml.getroot().set('display_name', sequentialTitle);
    sequentialOutline.content.forEach(function(vertical) {
	var verticalLocation = buildVertical(vertical);
	var verticalNode = et.SubElement(sequentialXml.getroot(), 'vertical');
	verticalNode.set('url_name', verticalLocation);
    });
    var fileName = sequentialTitle + '.xml';
    fs.writeFileSync(outputDir + 'sequential/' + fileName,
		     sequentialXml.write({'xml_declaration': false}));
    return fileName;
};

/* Creates and fills in files in vertical/, each of which points to
 * one or more curriculum elements (html files, quiz problems, videos,
 * etc). */
var buildVertical = function(verticalOutline) {
    var verticalXml = new et.ElementTree(et.Element('vertical'));
    var verticalTitle = verticalOutline.title;
    verticalXml.getroot().set('display_name', verticalTitle);
    switch (verticalOutline.type) {
    case 'file':
	break;

    case 'quiz':
	break;

    case 'llab':
	// 
	break;

    case 'external':
	break;

    default:
	throw 'Error: unrecognized vertical type "' + verticalOutline.type + '"';
	break;
    }
    return "woohoo";
};

module.exports = course;
