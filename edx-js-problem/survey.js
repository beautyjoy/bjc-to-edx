var Survey = (function() {

    var LOGGING = false;
    function LOG(string) {
	if (LOGGING) {
	    console.log(string);
	}
    }

    var state = {'complete': false};
    var survey = document.getElementById("qualtrics");

    function receiveMessage(event) {
	LOG("Message received");
	state.complete = event.data.complete;
    };

    window.addEventListener("message", receiveMessage, false);

    function getGrade() {
	LOG("getting grade...");
	LOG(state);
	return JSON.stringify(state['complete']);
    }

    /*function messageSurvey() {
	LOG("messaging survey");
	survey.contentWindow.postMessage("hello", "*"); //"https://berkeley.qualtrics.com");
    }*/

    function getState() {
	return JSON.stringify(state);
    }

    function setState() {
	// Might need to do more here, so that the survey doesn't get
	// unnecessarily displayed
        stateStr = arguments.length === 1 ? arguments[0] : arguments[1];
        state = JSON.parse(stateStr);
	LOG("setting state");
	LOG(stateStr);
    }

    //messageSurvey();

    return {
        getState: getState,
        setState: setState,
        getGrade: getGrade
    };
}());