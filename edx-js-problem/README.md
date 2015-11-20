# Survey authoring
1. Write survey in markdown syntax (possibly outlining first). Surveys themselves exist in https://github.com/beautyjoy/surveys
2. When you're satisfied with the questions, copy them into a separate .txt file in [Qualtrics advanced format](http://www.qualtrics.com/university/researchsuite/advanced-building/advanced-options-drop-down/import-and-export-surveys/).
3. Create survey in [Qualtrics](https://berkeley.qualtrics.com) and upload .txt file ("Advanced Options" -> "Import"). Double check that "back button" is enabled under "Survey Options."
4. While editing the survey, click "Look & Feel", "Advanced", and copy [qualtrics.js](https://github.com/beautyjoy/llab-to-edx/blob/master/edx-js-problem/qualtrics.js) into the "Header" box.
5. Upload survey.js and survey.css (probably not necessary) to edX. These can be used for all surveys unchanged.
6. Make a new copy of survey.html with the appropriate Qualtrics URL.
7. Create a javascript graded problem in edX using edx_problem.xml. Make sure to change the "html_file" attribute to point to the appropriate html file.
8. Add other_problem.html as a second problem on the same page.
