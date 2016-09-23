# llab-to-edx
> But really, this is a generic edX course building tool.

## TOC -- coming someday.

## Overview
This builds a course from a set of YAML [TODO: link] files.
There are two YAML files per course:

* A course outline, typically `outline.yml`
* A configuration file, typically `settings.yml`

These are the default names which the tool expects, but you can always change them.

## Running The Builder

Building EDC content in `curriculum/bjc-r`:

DO:
```
node edc_test.js <unit-num> <unit-num...>
```

THIS DOES NOT WORK:
`./build-course OPTIONS`

## Misc. Notes

### CSS Processing
* Use built in rules
* Rules are executed in the order they are defined.
	* This is something that can be relied on so you can create dependencies


## Requirements
* node.js > 0.12 (but 4.2+ is recommended)
* Python 3 and BeautifulSoup
	* See http://www.crummy.com/software/BeautifulSoup/bs4/doc/#installing-beautiful-soup
* Patience!