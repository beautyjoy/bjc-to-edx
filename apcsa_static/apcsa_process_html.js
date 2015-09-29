/**
 * 
 * sets up a apcsa web page. Uses jquery.
 */


// //// SPECS
var APCSA_SPECS = {};

// classes of divs that should be moved to margin.
// right now, ordering in the margin *between* these classes is ignored.
// should it be?
APCSA_SPECS.marginDivs = [ "key", "warning", "help", "vocab" ];

// talk bubble attributes (for align and color, default is first entry).
APCSA_SPECS.talkBubbleAligns = [ "left", "right" ];
APCSA_SPECS.talkBubbleColors = [ "blue", "red", "orange", "green" ];
APCSA_SPECS.talkBubbleImgDir = "/apcsa/r/static/art/robots/";


// populate this table with entries to be looked up automatically. This script
// checks for entries here by concatenating the 'char' and 'align' attributes:
// it that key is in this table, it grabs the value for the new 'char'
// attribute.
// If it isn't in this table, it leaves the char attribute alone
APCSA_SPECS.talkBubbleChars = {
    'bolt1_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_left1.png',
    'bolt1_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_right1.png',
    'bolt2_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_left2.png',
    'bolt2_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_right2.png',
    'bolt3_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_left3.png',
    'bolt3_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_right3.png',
    'bolt4_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_left4.png',
    'bolt4_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_right4.png',
    'bolt5_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_left5.png',
    'bolt5_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_right5.png',
    'bolt6_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_left6.png',
    'bolt6_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_bolt_right6.png',

    'cam1_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left1.png',
    'cam1_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right1.png',
    'cam2_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left2.png',
    'cam2_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right2.png',
    'cam3_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left3.png',
    'cam3_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right3.png',
    'cam4_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left4.png',
    'cam4_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right4.png',
    'cam5_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left5.png',
    'cam5_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right5.png',
    'cam6_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left6.png',
    'cam6_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right6.png',
    'cam7_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left7.png',
    'cam7_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right7.png',
    'cam8_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left8.png',
    'cam8_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right8.png',
    'cam9_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_left9.png',
    'cam9_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_cam_right9.png',

    'constance1_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_left1.png',
    'constance1_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_right1.png',
    'constance2_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_left2.png',
    'constance2_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_right2.png',
    'constance3_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_left3.png',
    'constance3_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_right3.png',
    'constance4_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_left4.png',
    'constance4_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_right4.png',
    'constance5_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_left5.png',
    'constance5_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_right5.png',
    'constance6_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_left6.png',
    'constance6_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_constance_right6.png',

    'float1_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_left1.png',
    'float1_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_right1.png',
    'float2_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_left2.png',
    'float2_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_right2.png',
    'float3_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_left3.png',
    'float3_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_right3.png',
    'float4_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_left4.png',
    'float4_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_right4.png',
    'float5_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_left5.png',
    'float5_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_right5.png',
    'float6_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_left6.png',
    'float6_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_right6.png',
    'float7_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_left7.png',
    'float7_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_right7.png',
    'float8_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_left8.png',
    'float8_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_float_right8.png',

    'octal1_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_left1.png',
    'octal1_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_right1.png',
    'octal2_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_left2.png',
    'octal2_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_right2.png',
    'octal3_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_left3.png',
    'octal3_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_right3.png',
    'octal4_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_left4.png',
    'octal4_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_right4.png',
    'octal5_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_left5.png',
    'octal5_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_octal_right5.png',

    'raster1_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_left1.png',
    'raster1_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_right1.png',
    'raster2_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_left2.png',
    'raster2_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_right2.png',
    'raster3_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_left3.png',
    'raster3_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_right3.png',
    'raster4_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_left4.png',
    'raster4_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_right4.png',
    'raster5_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_left5.png',
    'raster5_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_right5.png',
    'raster6_left' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_left6.png',
    'raster6_right' : APCSA_SPECS.talkBubbleImgDir + 'talk_raster_right6.png',

    'twitterton1_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_left1.png',
    'twitterton1_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_right1.png',
    'twitterton2_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_left2.png',
    'twitterton2_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_right2.png',
    'twitterton3_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_left3.png',
    'twitterton3_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_right3.png',
    'twitterton4_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_left4.png',
    'twitterton4_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_right4.png',
    'twitterton5_left' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_left5.png',
    'twitterton5_right' : APCSA_SPECS.talkBubbleImgDir
            + 'talk_twitterton_right5.png'
};

// talkBubbleCharDefaultWidth : "" ,
// matt don't want this no mo

// code folding stuff -- this script will put the code and placeholders
// inside the div spec'd by the author. The classes of those inner divs are:
// Class for div wrapping the actual code that can be folded
APCSA_SPECS.foldableCodeDivClass = 'theFoldableCode';

// Class for the Div containing placeholder image/text (i.e., when folded)
APCSA_SPECS.foldedDivClass = 'theFoldedPlaceholder';

// innerHTML of the placeholder div
// TODO: make this point to an icon or something.
APCSA_SPECS.foldedDivInnerHTML = '<span class="foldit">reveal</i></span>';






//  moved into build
// put this around everything
//APCSA_SPECS.full_selector = ".apcsa_full";
//APCSA_SPECS.createDivWrapper = function() {
//    $(document.body).wrapInner('<div class="apcsa_full"></div>');
//};


APCSA_SPECS.doTalkBubbles = function() {
// restrict to within .apcsa_full?
    $("div.talkBubble")
            .each(
                    function(i) {
                        // alert("here" + this.getAttribute("align"));
                        var td = $(this); // make jquery object from talkdiv,
                        // I guess
                        // set defaults
                        if ((jQuery.inArray(this.getAttribute('align'),
                                APCSA_SPECS.talkBubbleAligns)) == -1) {
                            this.setAttribute('align',
                                    APCSA_SPECS.talkBubbleAligns[0]);
                        }
                        if ((jQuery.inArray(this.getAttribute('color'),
                                APCSA_SPECS.talkBubbleColors)) == -1) {
                            this.setAttribute('color',
                                    APCSA_SPECS.talkBubbleColors[0]);
                        }
                        var charAttr = this.getAttribute('char') + '_'
                                + this.getAttribute('align');
                        if (charAttr in APCSA_SPECS.talkBubbleChars) {
                            this.setAttribute('char',
                                    APCSA_SPECS.talkBubbleChars[charAttr]);
                        }
                        // if (!(this.getAttribute('width'))) {
                        // this.setAttribute('width',
                        // APCSA_SPECS.talkBubbleCharDefaultWidth);
                        // }
                        // create table elements
                        var char_str = '<td class="characterImg '
                                + this.getAttribute('align') + '"> '
                                + '<img src="' + this.getAttribute('char')
                                // + '" width="' + this.getAttribute('width')
                                + '" /> ' + '</td> ';
                        var wedge_str = '<td class="talkWedge '
                                + this.getAttribute('color') + ' '
                                + this.getAttribute('align') + '"> ' + '</td> ';
                        var div_audiotag = "";
                        if (this.getAttribute('audio')) {
                            div_audiotag = ' audio="'
                                    + this.getAttribute('audio') + '" ';
                        }
                        var bubble_str = '<td class="talkBubbleTD"> '
                                + '<div class="talkBubble '
                                + this.getAttribute('color') + '" '
                                + div_audiotag + ' > ' + this.innerHTML
                                + '</div></td> ';
                        var pre_str = '<table class="talkTable"> <tr>';
                        var post_str = '</tr></table>';
                        if (this.getAttribute('align') == "right") {
                            // problems here with IE?
                            this.innerHTML = pre_str + bubble_str + wedge_str
                                    + char_str + post_str;
                        } else {
                            this.innerHTML = pre_str + char_str + wedge_str
                                    + bubble_str + post_str;
                        }
                    }).removeAttr('color').removeAttr('char').removeAttr(
                    'align').removeAttr('audio').removeClass('talkBubble')
            .addClass('talkBubbleOuter');
};


// have this only operate within .apcsa_full I think
APCSA_SPECS.fixMargins = function() {
    // if any vocab or help spans, we need to make a div.
    if ($(APCSA_SPECS.full_selector + " " + "span.vocab").length > 0) {
        $(APCSA_SPECS.full_selector).append('<div class="vocab"></div>');
        var vocabDiv = $("div.vocab");
        if (typeof (vocabClass) != "undefined") {
            vocabDiv.addClass(vocabClass);
        }
        $("span.vocab").each(
                function(i) {
                    if (!(this.getAttribute("term"))) {
                        this.setAttribute('term', this.innerHTML)
                    };
                    // TODO
                    vocabDiv.append('<a href="http://veritas.eecs.berkeley.edu/apcsa-ret/page/glossary.php?term='
                            + this.getAttribute('term') + '" target="_vocab">'
                            + this.getAttribute('term') + '</a>');
                });
    }
    // and for span.help
    if ($(APCSA_SPECS.full_selector + " " + "span.help").length > 0) {
        $(APCSA_SPECS.full_selector).append('<div class="help"></div>');
        var helpDiv = $("div.help");
        if (typeof (helpClass) != "undefined") {
            helpDiv.addClass(helpClass);
        }
        $(APCSA_SPECS.full_selector + " " + "span.help").each(
                function(i) {
                    if (!(this.getAttribute('topic'))) {
                        this.setAttribute('topic', this.innerHTML)
                    };
                    // TODO
                    helpDiv.append('<p><a href="http://veritas.eecs.berkeley.edu/apcsa-ret/page/help.php?topic='
                            + this.getAttribute('topic') + '" target="_help">'
                            + this.getAttribute('topic') + '</a></p>');
                });
    }

    // prepend "div." to each class in marginDivs
    var marginSelector = $.map(APCSA_SPECS.marginDivs, function(val, i) {
        return "div." + val;
    });

    // make the marginCol (first) and mainCols (second) if necessary
    if ($(marginSelector.join(',')).length > 0) {
        $(".apcsa_full").wrapInner('<div id="mainCol"></div>').prepend(
                '<div id=\"marginCol\"></div>');
        var $marginCol = $("#marginCol");

        // move divs into margin. Maybe this should order things more smartly...
        $.each(marginSelector, function(i, divclass) {
            $(divclass).appendTo($marginCol);
        });
    }
    ;
};


// removed title setup -- in curriculum.js now

APCSA_SPECS.slideShow = function() {
    if ($("div.slideshow").size() > 0) {
        if (!($.cycle())) {
            // whoops, they never loaded jquery.cycle!
            console
                    .error("You want to do slideshow stuff, you need to load jquery.cycle first, eh?");
        } else {
            var slideshowControlHTML = '<div id="slideshowControls" style="display: none; background-color:#FFFFCC; border:1px solid #DDDDDD; left: 0; margin:0; padding:6px; position:absolute; top:0; width:300px; z-index:1000;">'
                    + '<span style="margin: 0 10px;">(Paused...)</span>'
                    + '<span style="margin: 0 5px;"><a id="prevSlideshowControl" href="">Previous</a></span>'
                    + '<span style="margin: 0 5px;"><a id="nextSlideshowControl" href="">Next</a></span>';
            $("div.slideshow").wrapInner('<div id="theSlides">').prepend(
                    slideshowControlHTML).hover(function() {
                $('#slideshowControls').fadeIn();
                $('#theSlides').cycle('pause');
            }, function() {
                $('#slideshowControls').fadeOut();
                $('#theSlides').cycle('resume');
            });
            $('#theSlides').cycle({
                fx : 'fade',
                next : '#nextSlideshowControl',
                prev : '#prevSlideshowControl'
            });
        }
        ;
    }
    ;
};

APCSA_SPECS.foldables = function() {
    var foldDivs = $('div.foldable');
    // add element to show when foldable code div is collapsed, inside foldable
    // code div
    foldDivs
            .wrapInner('<div class="' + APCSA_SPECS.foldableCodeDivClass + '">')
            .prepend(
                    '<div class="' + APCSA_SPECS.foldedDivClass + '">'
                            + APCSA_SPECS.foldedDivInnerHTML + '</div>');
    // fold or show the right divs
    // someday, maybe, we need an initialSetting attribute. For now, fold all
    // the code.
    $('div.' + APCSA_SPECS.foldedDivClass).show();
    $('div.' + APCSA_SPECS.foldableCodeDivClass).hide();

    // add click functions to the outer div.
    // TODO -- should only be a click on the background image I think...
    // Remember, divs with same 'group' attribute value should toggle together
    foldDivs
            .click(function() {
                // showingCode is true if code div is currently not hidden
                var showingCode = (($(this).children(
                        '.' + APCSA_SPECS.foldableCodeDivClass + ':hidden')
                        .size()) == 0);
                var groupName = this.getAttribute('group');
                // set us to be all foldables with same group name, or just this
                // one if no matches.
                if (groupName) {
                    var us = $(foldDivs + '[group=' + groupName + ']');
                } else {
                    var us = $(this);
                }
                var placeholderKids = us.children('.'
                        + APCSA_SPECS.foldedDivClass);
                var codeKids = us.children('.'
                        + APCSA_SPECS.foldableCodeDivClass);
                if (showingCode) {
                    // this way, they show and hide at same time.
                    // Could do them in sequence with callbacks;
                    codeKids.hide("medium");
                    placeholderKids.show("medium");
                } else {
                    placeholderKids.hide("medium");
                    codeKids.show("medium");
                }
            }); // close foldDivs.click function
};



APCSA_SPECS.runAll = function() {
//    APCSA_SPECS.createDivWrapper();   // needs to go first
    APCSA_SPECS.doTalkBubbles();
    APCSA_SPECS.fixMargins();
//    APCSA_SPECS.slideShow();
    APCSA_SPECS.foldables();
};


// startmeup
$(document).ready(APCSA_SPECS.runAll);
