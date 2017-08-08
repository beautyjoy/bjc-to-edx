/*
    Translate a llab quiz into edXML format.
*/

const cheerio = require('cheerio');

module.exports = function (quizContent, options) {
    const $ = cheerio.load(quizContent);
};