/*
    This page is a bunch of extracted changes needed to make edX pages
    work like llab.
*/
var llab = {};

llab.paths = {};
llab.paths.css_files = {};

// Extracted from loader.js
// ADDITIONAL LIBRARIES
function getTag(name, src, type, onload) {
    var tag = document.createElement(name);

    if (src.substring(0, 2) === "//") {
        // external server, carry on..
    } else if (src.substring(0,1) === "/") {
        // root on this server
        src = window.location.href.replace(window.location.pathname, src);
    } else {
        // relative link
        src = llab.pathToLlab +  src;
    }

    var link  = name === 'link' ? 'href' : 'src';
    tag[link] = src;
    tag.type  = type;
    tag.onload = onload;
    tag.async = true;

    return tag;
}


// Syntax Highlighting support
// Note this are different paths than llab
llab.paths.syntax_highlights = "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/highlight.min.js";
llab.paths.css_files.syntax_highlights = "//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/tomorrow-night-blue.min.css";
// Math / LaTeX rendering
llab.paths.math_katex_js = "//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/katex.min.js";
llab.paths.css_files.math_katex_css = "//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/katex.min.css";
//

// Extracted from llab/library
llab.snapRunURLBase = "https://snap.berkeley.edu/snapsource/snap.html#open:";

llab.getSnapRunURL = function(targeturl) {
    if (!targeturl) { return ''; }

    var finalurl =  llab.snapRunURLBase,
        edc_gh = 'https://bjc.edc.org/bjc-r/',
        url_parts = targeturl.split('/'),
        xmlPath = url_parts[url_parts.length - 1].replace(/_/g, '/');

    return finalurl + edc_gh + xmlPath;
};
// End library

// Extracted from llab/curriculum.js
/** A prelimary API for defining loading additional content based on triggers.
 *  @{param} array TRIGGERS is an array of {trigger, callback} pairs.
 *  a `trigger` is currently a CSS selector that gets passed to $ to see if any
 *  of those elements are on the current page. If the elements are found then a
 *  `callback` is called with no arguments.
 *  TODO: Cleanup and test this code.
 *  TODO: Explore ideas for better trigger options?
 */
llab.additionalSetup = function(triggers) {
    var items;
    triggers.forEach(function (obj) {
        if (obj.trigger && obj.function) {
            items = $(obj.trigger);
            if (items.length) {
                obj.function.call(null);
            }
        }
    });
}

/** Import the required JS and CSS for Code highlighting.
 *  TODO: Abstract this away into its own function
 */
llab.codeHighlightSetup = function () {
    var cssFile, jsFile, css, js;
    cssFile = llab.paths.css_files.syntax_highlights;
    jsFile  = llab.paths.syntax_highlights;
    css = getTag('link', cssFile, 'text/css');
    css.rel = "stylesheet";
    js = getTag('script', jsFile, 'text/javascript');
    // onload function
    $(js).attr({'onload': 'llab.highlightSyntax()'});
    // Using $ to append to head causes onload not to be fired...
    document.head.appendChild(css);
    document.head.appendChild(js);
}

// Call The Functions to HighlightJS to render
llab.highlightSyntax = function() {
    // TODO: PUT THESE CLASSES SOMEWHERE
     $('pre code').each(function(i, block) {
          // Trim the extra whitespace in HTML files.
          block.innerHTML = block.innerHTML.trim();
          if (typeof hljs !== 'undefined') {
               hljs.highlightBlock(block);
          }
     });
}

/** Import the required JS and CSS for LaTeX Code.
 *  TODO: Abstract this away into its own function
 */
llab.mathDisplaySetup = function () {
    var cssFile, jsFile, css, js;
    cssFile = llab.paths.css_files.math_katex_css;
    jsFile  = llab.paths.math_katex_js;
    css = getTag('link', cssFile, 'text/css');
    css.rel = "stylesheet";
    js = getTag('script', jsFile, 'text/javascript');
    // onload function
    $(js).attr({'onload': 'llab.displayMathDivs()'});
    // Using $ to append to head causes onload not to be fired...
    document.head.appendChild(css);
    document.head.appendChild(js);
}

// Call the KaTeX APIS to render the LaTeX code.
llab.displayMathDivs = function () {
    // TODO: Investigate caching of the selectors?
    // TODO: PUT THESE CLASSES SOMEWHERE
    $('.katex, .katex-inline').each(function (idx, elm) {
        katex.render(elm.textContent, elm, {throwOnError: false}); //Changed .innerHTML to .textContent on 1/29/16 to get > and < to work.
    });
    // TODO: PUT THESE CLASSES SOMEWHERE
    $('.katex-block').each(function (idx, elm) {
        katex.render(elm.textContent, elm, { //Changed .innerHTML to .textContent on 1/29/16 to get > and < to work.
            displayMode: true, throwOnError: false
        });
    });
}

// End curriculum.js


// Custom stuff:
$(document).ready(function() {
    if (typeof Giffer !== 'undefined') {
        Gifffer();
    } else {
        var gif = $('<script>').attr(
            'src',
        'https://cdnjs.cloudflare.com/ajax/libs/gifffer/1.5.0/gifffer.min.js'
        ).on('load', 'function() {Giffer(); }');
        $('head').append(gif);
    }
    $('head').append($('<script>').attr(
        {src: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'}
    ));

    llab.additionalSetup([
        {
            trigger: 'a.run',
            function: function () {
                $("a.run").each(function() {
                    $(this).attr({
                        "target": "_blank",
                        'href': llab.getSnapRunURL($(this).attr('href'))
                    });
                });
            }
        },
        {  // TODO: PUT THESE CLASSES SOMEWHERE
           trigger: 'pre code',
           function: llab.codeHighlightSetup()
        },
        {   // TODO: PUT THESE CLASSES SOMEWHERE
            trigger: '.katex, .katex-inline, .katex-block',
            function: llab.mathDisplaySetup()
        }
    ]);
});
