# llab-to-edx

This too takes in course content from our ["llab"][llab] formatted courses
and mostly turns them into something usable for uploading to [edX][edx].

[llab]: https://github.com/beautyjoy/llab
[edx]: https://edx.org

## TOC -- coming someday.

## Overview

Right now there are a bunch of single-use style scripts:

	* apcsa_simple_edx_build.js
	* apcsa_test.js
	* edc_test.js (start with this, probably)

These do various content transformations, and are somewhat specific to our needs.

Basically, the scripts in a topic file, which is a list of HTML pages organized into sections. The script will process each HTML file, and modify the content as necessary to work in edX. There are a few common modifications:

Each HTML file is designed to be 1 page in edX. Some HTML pages are split in "sections" in edX, because that have interactive quizzes.

* CSS mods:
	* We "compile" the llab CSS into 1 file, and link that at the top of each course page in edX.
* JS Mods:
	* A JS file `edx-llab-hack.js` is inserted at the top of each page.
* Quizzes:
	* LLAB includes an HTML-style quiz. There's a set of Python tools that translate this to the edXML / OLX formatted XML.
* URL transformations:
	* all the images and files we link to will have different URLs on edX.
	* The inline-replaces those URLs with ones edX will translate correctly.
	* Some URLs (like in-course content links) still need to be manually translated.
* Section Headings:
	* Removing the first `<h2>` page title
	* Inserts section heading text.

## Running The Builder

Building EDC content in `curriculum/bjc-r`:

DO:
```
node edc_test.js <unit-num> <unit-num...>
```

### Accessibility Fixes

## Example Courses

## Misc. Notes

### CSS Processing
* Use built in rules
* Rules are executed in the order they are defined.
	* This is something that can be relied on so you can create dependencies


## Requirements
* node.js > 6.4.0, lastest recommended
	* There's a number of ES6 features used.
	* Dependencies can be installed with `npm install`
* Python 3 and BeautifulSoup
	* See http://www.crummy.com/software/BeautifulSoup/bs4/doc/#installing-beautiful-soup
* Patience!
