/*

utilities for writing out edx tar.gz export files

TODO - don't fs.write inside forloop --build string and write once, yo.

Need to add functionality to merge into existing edx exports.  Check if file exists first,
if it does compare it to what you were going to write.  If they are different, well, notate
that somewhere!  Maybe its an update.
*/


// export
var edx_util = {};


///////
///////  PER COURSE /  EXPORT (ONE TIME)

var EXPORT_DIR;
var CHAPTERS_IN_COURSE = [];
var COURSEXML_FD;


// export dir is the root of the *existing* edx export; files should probably already
// be there ('course'.xml
edx_util.startCourse = function(exportdir) {
    EXPORT_DIR = exportdir;
    var CHAPTERS_IN_COURSE = [];
    
    // TODO - deal with coursexml -- see if it exists, etc.
    
    // if sub dirs don't exist, make them.
    fs.mkdirSync(exportdir);
    ['course/', 'chapter/', 'sequential/', 'vertical/', 'html/', 'video/', 'problem/'].
    forEach(function(dir) {
         fs.mkdirSync(exportdir + dir);
    });
    
    // make course.xml if it doesn't exist
    // TODO this should wait until endCourse()
    COURSEXML_FD = fs.openSync(EXPORT_DIR + "course/" + "TOAPPEND.xml", "a");
    fs.writeSync(COURSEXML_FD, "<course>\n"); 
    
}


edx_util.endCourse = function() {
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
var CUR_TOPIC_BASE;
var FILE_PREPEND_STR = "T0_";


// prepend can be null, or a string that will be unique across topics (to prepend files with)
edx_util.startTopic = function (topicdata, topictitle, topicpath, prepend_str) {
   // clear it
   SEQUENTIALS_IN_CUR_TOPIC = []; 
   
   CUR_TOPIC_TITLE = topictitle;  
   CUR_TOPIC_BASE = path.basename(topicpath, ".topic");   
    
   if (!prepend_str) {
       prepend_str = "T" + TOPIC_NUM++ + "_";
   }
   FILE_PREPEND_STR = prepend_str;
   
};

// write out the file
edx_util.endTopic = function() {
    var topicref = FILE_PREPEND_STR + CUR_TOPIC_BASE; // no ext
    var topicfd = fs.openSync(EXPORT_DIR + "chapter/" + topicref + ".xml", "w");
    fs.writeSync(topicfd, "<chapter display_name=\"" + CUR_TOPIC_TITLE + "\">\n");
    SEQUENTIALS_IN_CUR_TOPIC.forEach(function(seqtag) {
        fs.writeSync(topicfd, seqtag);
    });
    fs.writeSync(topicfd, "</chapter>");
    fs.closeSync(topicfd);
    
    addTopicReference2Course(topicref);
};


function addSequentialReference2Topic(sequential_url) {
    SEQUENTIALS_IN_CUR_TOPIC.push("   <sequential url_name=\"" + sequential_url + "\"/>");
}



///////// PER SEQUENTIAL / SECTION / HEADING
//  these have to be unique somehow
var CUR_SECTION_TITLE;
var CUR_SECTION_REF;
var VERTICALS_IN_CUR_SECTION = [];

// 1-9999 random number
function getRandomStr() {
    // TODO - pad with 0s
    var out = Math.floor(Math.random() * 9999) + 1;
    return ("_" + out.toString());
}

edx_util.startSection = function(sectiondata, title) {
    VERTICALS_IN_CUR_SECTION = [];
    CUR_SECTION_TITLE = title;
    var smush = title.replace(/[^A-Za-z0-9]/g, "");
    // gotta make the filename based on the title in the heading: topic -- no other choice...
    //   at a random number at end to help it be unique
    CUR_SECTION_REF = FILE_PREPEND_STR + smush + getRandomStr();   // no extension
};
    

edx_util.endSection = function() {
    // will overwrite if exists -- not the right thing!
    var sectionfd = fs.openSync(EXPORT_DIR + "sequential/" + CUR_SECTION_REF + ".xml", "w");
    fs.writeSync(sectionfd, "<sequential display_name=\"" + CUR_SECTION_TITLE + "\">\n");
    VERTICALS_IN_CUR_SECTION.forEach(function(verttag) {
        fs.writeSync(sectionfd, verttag);
    });
    fs.writeSync(sectionfd, "</sequential>");
    fs.closeSync(sectionfd);
    
    addSequentialReference2Topic(CUR_SECTION_REF);
};


function addVerticalRef2Section(vertical_url) {
    VERTICALS_IN_CUR_SECTION.push("   <vertical url_name=\"" + vertical_url + "\"/>");
}


/////////// PER PAGE / VERTICAL

var CUR_VERTICAL_TITLE;
var CUR_VERTICAL_REF;
var COMPONENTS_IN_CUR_VERTICAL = [];


edx_util.startVertical = function(vertical_path, title) {
    COMPONENTS_IN_CUR_VERTICAL = [];
    
    CUR_VERTICAL_TITLE = title;
    CUR_VERTICAL_REF = FILE_PREPEND_STR + path.basename(vertical_path, ".html");
//console.log("start vertical: path->" + vertical_path + ", title-> " + title);    
}


edx_util.endVertical = function() {
    // overwrite, bad, blah blah
    var verticalfd = fs.openSync(EXPORT_DIR + "vertical/" + CUR_VERTICAL_REF + ".xml", "w");
    fs.writeSync(verticalfd, "<vertical display_name=\"" + CUR_VERTICAL_TITLE + "\">\n");
    COMPONENTS_IN_CUR_VERTICAL.forEach(function(comp) {
        fs.writeSync(verticalfd, comp);
    });
    fs.writeSync(verticalfd, "</vertical>");
    fs.closeSync(verticalfd);
    
    addVerticalRef2Section(CUR_VERTICAL_REF);
};


// type is equal vertical xml tags (html, problem, video, ?
function addComponentRef2Vertical(comp_url, type) {
    COMPONENTS_IN_CUR_VERTICAL.push("   <" + type + " url_name=\"" + comp_url + "\"/>");
}



/////////// COMPONENTS / HTML / ETC





edx_util.addHTMLComponenet = function(htmlcontents, title, ref) {
    var dir = EXPORT_DIR + "html/";
    var basename = FILE_PREPEND_STR + ref ;  // add getRandomStr?
    var xmlcontents = 
        "<html editor=\"raw\" display_name=\"" + title 
        + "\" filename=\"" + basename + "\"/>";
    
    // make html and ht
    fs.writeFileSync(dir+basename+".html", htmlcontents);
    fs.writeFileSync(dir+basename+".xml", xmlcontents)
    
    addComponentRef2Vertical(basename, "html");
}



// process html into edxproblem, and sent to addQuizEdxFormatComponent
edx_util.addQuizLlabFormatComponent = function(div, ref) {
    //TODO!!!  coversion of llabformat to edxformat should happen in this module
}


// actually writes the xml to a file -- ref better be unique... (
edx_util.addQuizEdxFormatComponent = function(xml, ref) {
    var dir = EXPORT_DIR + "problem/";
    var basename = FILE_PREPEND_STR + ref + getRandomStr();
    var filename = basename + ".xml"
    // write file, potential overwrite, great evil, yadda yadda
    var compfd = fs.openSync(dir + filename, "w");
    fs.writeSync(compfd, xml);
    fs.closeSync(compfd);
    
    // add ref in current vertical
    addComponentRef2Vertical(basename, "problem");
}
        

edx_util.addVideoComponent = function(videoref, ref) {
    var basename;
    /* TODO - huh
      <video youtube_id_1_0="izOus9BnqSo" 
          sub="izOus9BnqSo" 
          html5_sources="[]" 
          download_video="false" 
          display_name="Video" 
          url_name="2b486b88c598453a9883abbe979fc6b7" 
          youtube="1.00:izOus9BnqSo" />
    */
    addComponentRef2Vertical(basename, "video");
}
        
        
        
        

module.exports = edx_util;