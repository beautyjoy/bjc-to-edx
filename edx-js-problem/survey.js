var Survey = (function() {

    var state = {'complete': false};
    var survey = document.getElementById("qualtrics");
    console.log(survey);
    // survey.onload = function() {
    // 	var complete = 
    // }

    function receiveMessage(event) {
	console.log("edx received message");
	console.log(event.data);
	state.complete = event.data.complete;
    };

    window.addEventListener("message", receiveMessage, false);

    // Might need RPC/SOP stuff here - see webGLDemo.js

    function getGrade() {
	messageSurvey();
	return JSON.stringify(state['complete']);
    }

    function messageSurvey() {
	console.log("messaging qualtrics");
	survey.contentWindow.postMessage("hello", "*"); //"https://berkeley.qualtrics.com");
    }

    function getState() {
	messageSurvey();
	return JSON.stringify(state);
    }

    function setState() {
	// Might need to do more here, so that the survey doesn't get
	// unnecessarily displayed
        stateStr = arguments.length === 1 ? arguments[0] : arguments[1];
        state = JSON.parse(stateStr);
    }

    survey.onload = messageSurvey;

    return {
        getState: getState,
        setState: setState,
        getGrade: getGrade
    };
}());