
console.log("TESTING TESTING");

function receiveMessage(event) {
    //console.log("qualtrics received message");
    var complete = (document.getElementById("EndOfSurvey") !== null);
    //console.log("trying to post message");
    event.source.postMessage({"complete": complete}, "*");
}

window.addEventListener("message", receiveMessage, false);

//window.onclick = receiveMessage;
