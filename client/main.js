const ID_GUEST_INPUT_AREA = "guestInput";
const ID_INPUT_DISPLAY_NAME = 'displayName';
const ID_BUTTON_GO_GUEST = 'goGuest'
const ID_STATUS = 'status';
const ID_WIDGET = 'widget';

function setStatus(value) {
  const statusArea = document.getElementById(ID_STATUS);
  statusArea.innerHTML = `<p>${value}</p>`;
}

function handleGuest() {
  const guestInputArea = document.getElementById(ID_GUEST_INPUT_AREA);
  const displayNameInput = document.getElementById(ID_INPUT_DISPLAY_NAME);
  const goGuestButton = document.getElementById(ID_BUTTON_GO_GUEST);
  
  displayNameInput.disabled = true;
  goGuestButton.disabled = true;
  setStatus("Setting Up...");
  
  const displayName = displayNameInput.value;

  // Make the API call to create the guest and space with bot
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
  var raw = JSON.stringify({
    "name": displayName || "Cisco Live Guest"
  });
  
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  
  fetch("./guest", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      setStatus("Connected.");
      guestInputArea.remove();
      const token = result.guestJWT;
      const spaceID = result.space.id;
      displayWidget(token, spaceID);
    })
    .catch(error => console.log('error', error));
}

function displayWidget(token, spaceID) {
  // Grab DOM element where widget will be attached
  var widgetEl = document.getElementById(ID_WIDGET);

  widgetEl.style.display = "block";

  // Initialize a new Space widget
  webex.widget(widgetEl).spaceWidget({
    guestToken: token,
    destinationType: 'spaceId',
    destinationId: spaceID,
    spaceActivities: {files: false, meet: false, message: true, people: true}
  });
}