/** This reads in command line 
 *
 */

var course = require('./course');

// This does the bulk of the work. 
function main() {
    // TODO: this should read from a command line arg
    course.buildCourse("courses/bjc1x/", {});
};



main();