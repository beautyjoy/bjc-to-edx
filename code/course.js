
fs   = require('fs');
var yaml = require('js-yaml');
var xml2js = require('xml2js');

var course = {};

var build = function(courseOutline) {
    var parsedOutline = yaml.load(courseOutline);
    
};
course.build = build;


module.exports = course;
