const qS = document.querySelector.bind(document);

function sendEmail(event) {

    if (this.checkValidity() === false) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sc = qS("#scName").value;
    const pw = qS("#scPassword").value;

    const url = `https://i1api.nrs.gov.bc.ca/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=CMSG.*`;

    const headers = new Headers();
    headers.set(
        "Authorization",
        "Basic " + window.btoa(sc + ':' + pw)
    );

    fetch(url, {
        method: "get",
        headers: headers
    })
        .then(resp => resp.json())
        .then(function (data) {
            const token = data.access_token;
            console.log(`token: ${token}`)
            if (!token || token.length < 16) {
                showError("An error occured while fetching a token. See console for more details.");
                return;
            }
            postToCmsg(token);
        })
        .catch(function (error) {
            console.log(`ERROR, caught error fetching token from ${url}`);
            console.log(error);
        });
}

function postToCmsg(token) {

    const url = `https://i1api.nrs.gov.bc.ca/cmsg-messaging-api/v1/messages`;

    // Things that aren't in the UI to enter
    const defaults = `
    {
        "@type" : "http://nrscmsg.nrs.gov.bc.ca/v1/emailMessage",
        "links": [
        ],
        "delay": 0,
        "expiration": 0,
        "maxResend": 0,
        "mediaType": "text/plain"
    }
    `
    // Add the user entered fields
    const requestBody = JSON.parse(defaults);
    requestBody.sender = qS("#sender").value;
    requestBody.subject = qS("#subject").value;
    requestBody.message = qS("#body").value;
    requestBody.recipients = qS("#recipients").value.replace(/\s/g, '').split(",");

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");

    fetch(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: headers
    })
        .then(res => res.json())
        .then(function (response) {
            console.log(response);
            $('#successModal').modal('show');
        })
        .catch(function (error) {
            console.error("Error posting email:", error);
            showError("An error occured while sending the email. See console for more details.");
        });
}


function showError(text) {
    $('#errorModal').modal('show'); // need the jQuery object to call the bootstrap modal method
    $('#errorModal .modal-body p').text(text);
}

qS("#emailForm").addEventListener("submit", sendEmail);
qS("#doneButton").addEventListener("click", function () { window.scrollTo(0, 0); location.reload(true); });
