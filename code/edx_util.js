/*

utilities for writing out edx tar.gz export files

TODO - don't fs.write inside forloop --build string and write once, yo.

Need to add functionality to merge into existing edx exports.  Check if file exists first,
if it does compare it to what you were going to write.  If they are different, well, notate
that somewhere!  Maybe its an update.
*/


// export
var edx_util = {};


var filename_prepend = guid

///////
///////  PER COURSE /  EXPORT (ONE TIME)

var EXPORT_DIR;
var CHAPTERS_IN_COURSE = [];
var COURSEXML_FD;


// export dir is the root of the *existing* edx export; files should probably already
// be there ('course'.xml
edx_util.startCourse(exportdir) {
    EXPORT_DIR = exportdir;
    // TODO - deal with coursexml -- see if it exists, etc.
    
    // if sub dirs don't exist, make them.
    fs.mkdirSync(exportdir);
    ['course/', 'chapter/', 'sequential/', 'vertical/', 'html/', 'video/', 'problem/'].
    forEach(function(dir) {
         fs.mkdirSync(exportdir + dir);
    });
    
    // make course.xml if it doesn't exist
    // TODO this should wait until endCourse()
    COURSEXML_FD = fs.openSync(exportdir + "course/" + "TOAPPEND.xml", "a");
    fs.writeSync(COURSEXML_FD, "<course>\n"); 
    
}


edx_util.endCourse() {
    // TODO write and close file
    CHAPTERS_IN_COURSE.forEach(function(chap){
        fs.writeSync(COURSEXML_FD, chap);
    });
    fs.writeSync(COURSEXML_FD, "</course>\n");
    fs.closeSync(COURSEXML_FD);
}


function addTopicReference2Course(chapter_ref) {
    CHAPTERS_IN_COURSE.push("  <chapter url_name=\"" + chapter_ref + "\"/>");
}




///////////////
/////////////// PER TOPIC / CHAPTER

var TOPIC_NUM = 1;
var SEQUENTIALS_IN_CUR_TOPIC = [];
var CUR_TOPIC_TITLE = "TOPIC_TITLE";
var CUR_TOPIC_PATH;
var FILE_PREPEND_STR = "T0_";


// prepend can be null, or a string that will be unique across topics (to prepend files with)
edx_util.startTopic = function (topicdata, topictitle, topicpath, prepend_str) {
   // clear it
   SEQUENTIALS_IN_CUR_TOPIC = []; 
   
   CUR_TOPIC_TITLE = topictitle;  
   CUR_TOPIC_PATH = topicpath;   // TODO - remove the extension
    
    
   if (!prepend_str) {
       prepend_str = "T" + TOPIC_NUM++ + "_";
   }
   FILE_PREPEND_STR = prepend_str;
   
};

// write out the file
edx_util.endTopic = function() {
    var topicref = FILE_PREPEND_STR + CUR_TOPIC_PATH; // no ext
    var topicfd = fs.openSync(exportdir + "chapter/" + topicref + ".xml", "w");
    fs.writeSync(topicfd, "<chapter display_name=\"" + CUR_TOPIC_TITLE + "\">\n");
    SEQUENTIALS_IN_CUR_TOPIC.forEach = function(seqtag) {
        fs.writeSync(topicfd, seqtag);
    };
    fs.writeSync(topicfd, "</chapter>");
    fs.closeSync(topicfd);
    
    addTopicReference2Course(topicref);
};


function addSequentialReference2Topic(sequential_url) {
    SEQUENTIALS_IN_CUR_TOPIC.push("   <sequential url_name=\"" + sequential_url + "\"/>");
}



///////// PER SEQUENTIAL / SECTION / TOPIC_HEADING
//  these have to be unique somehow
var CUR_SECTION_TITLE;
var CUR_SECTION_REF;
var VERTICALS_IN_CUR_SECTION = [];

// 1-999 random number
function getRandomInt() {
    return Math.floor(Math.random() * 999) + 1;
}

edx_util.startSection = function(sectiondata, title) {
    CUR_SECTION_TITLE = title;
    var smush = title.replace("/[^A-Za-z0-9]/g", "");
    // gotta make the filename based on the title in the heading: topic -- no other choice...
    //   at a random number at end to help it be unique
    CUR_SECTION_REF = FILE_PREPEND_STR + smush + getRandomInt().toString();   // no extension
};
    

edx_util.endSection = function() {
    // will overwrite if exists -- not the right thing!
    sectionfd = fs.openSync(exportdir + "sequential/" + CUR_SECTION_REF + ".xml", "w");
    fs.writeSync(topicfd, "<sequential display_name=\"" + CUR_SECTION_TITLE + "\">\n");
    VERTICALS_IN_CUR_SECTION.forEach = function(verttag) {
        fs.writeSync(sectionfd, verttag);
    };
    fs.writeSync(sectionfd, "</sequential>");
    fs.closeSync(sectionfd);
    
    addSequentialReference2Topic(CUR_SECTION_REF);
};


addVerticalRef2Section(vertical_url) {
    VERTICALS_IN_CUR_SECTION.push("   <vertical url_name=\"" + vertical_url + "\"/>");
}


/////////// PER PAGE / VERTICAL










/////////// PER DIV / HTML / ETC

edx_util.addHTMLFile = function(html) {
    
}


        
        
        
        
        

module.exports = edx_util;