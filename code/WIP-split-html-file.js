let quizzes = $('.assessment-data');
let fileSections = [];

quizzes.each(function(index, elm) {
  let qzHTML = $.html(elm); // like a call to outerHTML()
  var idx = text.indexOf(qzHTML);
  var before = text.slice(0, idx).trim();

  if (before.length) {
    fileSections.push(before);
  }
  fileSections.push(qzHTML);
  text = text.slice(idx + qzHTML.length).trim();
});

// Cover remaining HTML
if (text.length) {
  fileSections.push(text);
}

// Translate Each section into an "object"
fileSections.forEach((htmlFragment, idx) => {

});
