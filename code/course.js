/** @file This file builds an edX course in OLX format.
 * @author Peter Sujan peterasujan@gmail.com
 */


var fs = require('fs');
var child_process = require('child_process');

var yaml = require('js-yaml');
var et = require('elementtree');
// DOES THE PROCESSING AND SUCH
var TEST_TEMP = require('../test.js');

var course = {};
var config, outline, outputDir;

/** Copies the template xml course and fills in
 * course/outline.xml withpointers to chapter files. */
var buildCourse = function(courseDirectory, options) {
    // TODO: Check overrides in options. Store the defaults in some variable.
    config = yaml.load(fs.readFileSync(courseDirectory + 'settings.yml'));
    outline = yaml.load(fs.readFileSync(courseDirectory + 'outline.yml'));

    // copy the template/ directory
    outputDir = 'output-course/'; // TODO: this should be read from the config
    child_process.execSync('rm -rf ' + outputDir); // TODO: this can be exploited in the most gristly of ways...
    child_process.execSync('cp -R template ' + outputDir);
    
    var outlineFile = outputDir + 'course/outline.xml';
    var outlineXml = et.parse(fs.readFileSync(outlineFile).toString());

    outline.chapters.forEach(function(chapter) {
        var chapterLoc = buildChapter(chapter);
        var chapterXml = et.SubElement(outlineXml.getroot(), 'chapter');
        chapterXml.set('url_name', chapterLoc);
    });
    fs.writeFileSync(outlineFile, outlineXml.write({'xml_declaration': false}));
};
course.buildCourse = buildCourse;

/**  Creates and fills in files in chapter/, each of which
 * points to several sequential files. Returns the filename of the
 * created chapter. */
var buildChapter = function (chapterOutline) {
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

/**  Creates and fills in files in sequential/, each of which
 * points to several vertical files. */
var buildSequential = function (sequentialOutline) { // TODO: this function is very similar to buildChapter -- can probably generalize
    var sequentialXml = new et.ElementTree(et.Element('sequential'));
    var sequentialTitle = sequentialOutline.title;
    sequentialXml.getroot().set('display_name', sequentialTitle);
    sequentialOutline.content.forEach(function(item) {
	buildVerticals([item]).forEach(function(verticalLocation) {
            var verticalNode = et.SubElement(sequentialXml.getroot(), 'vertical');
            verticalNode.set('url_name', verticalLocation);
        });
    });
    var fileName = sequentialTitle + '.xml';
    fs.writeFileSync(outputDir + 'sequential/' + fileName,
		     sequentialXml.write({'xml_declaration': false}));
    return fileName;
};

/**  Creates and fills in files in vertical/, each of which
 * points to one or more curriculum elements (html files, quiz
 * problems, videos, etc). */
var buildVerticals = function(verticalOutlines) {
    if (verticalOutlines[0].type == 'llab') {
	// TODO: rename once Michael has updated
	console.log('--------------------------------------------------');
	console.log(verticalOutlines);
        var llabElements = TEST_TEMP(verticalOutlines[0].path,
                                     verticalOutlines[0].section, 
                                     outputDir);
	var isDefined = function(x) {return (x !== undefined);};
        return llabElements.filter(isDefined).map(function(x) {return buildVerticals(x)[0];});
    }
    var verticalXml, verticalTitle;
    verticalXml = new et.ElementTree(et.Element('vertical'));
    verticalTitle = verticalOutlines[0].title;
    verticalXml.getroot().set('display_name', verticalTitle);
    verticalOutlines.forEach(buildVerticalElement, {'parent': verticalXml});
    // TODO: write file here
    var fileName = verticalTitle + '.xml';
    fs.writeFileSync(outputDir + 'vertical/' + fileName,
		     verticalXml.write({'xml_declaration': false}));
    return [fileName];
};

var buildVerticalElement = function(verticalElement) {
    var itemXml;
    var verticalXml = this.parent;
    // TODO: extract this to be a function
    switch (verticalElement.type) {
    case 'file':
        // TODO: this assumes that the path is already xml-ified, which
        // will likely not be the case
        itemXml = new et.SubElement(verticalXml.getroot(), "html");
        itemXml.set("url_name", verticalElement.path);
	return verticalElement.path;
        break;

    case 'quiz':
        itemXml = new et.SubElement(verticalXml.getroot(), "problem");
        itemXml.set("url_name", verticalElement.path);
	return verticalElement.path;
        break;
	
    case 'video':
        itemXml = new et.SubElement(verticalXml.getroot(), "video");
        itemXml.set("url_name", verticalElement.path);
	return verticalElement.videoId; // TODO: this also needs to write a separate xml file in the 'video' directory
        break;
        
    case 'external': // TODO: not sure exactly what this will be
	return 'UNSUPPORTED';
        break;
	
    default:
        throw 'Error: unrecognized vertical type "' + verticalElement.type + '"';
        break;
    }
};
module.exports = course;
