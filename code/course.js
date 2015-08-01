
fs   = require('fs');
var yaml = require('js-yaml');
var et = require('elementtree');

var course = {};
var config, outline;

var buildCourse = function(courseDirectory, options) {
    config = yaml.load(fs.readFileSync(courseDirectory + 'config.yml'));
    outline = yaml.load(fs.readFileSync(courseDirectory + 'outline.yml'));
    var parsedOutline = yaml.load(outline);
    
    parsedOutline.chapters.forEach(buildChapter);
};
course.buildCourse = buildCourse;

var buildChapter = function(chapterOutline) {
    
};

var buildSequential = function(sequentialOutline) {

};

var buildVertical = function(verticalOutline) {

};

module.exports = course;
