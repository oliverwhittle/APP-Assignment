const POPUP = document.getElementById('popup');
const CREATETASKBTN = document.getElementById('createTask');
const CLOSEPOPUPBTN = document.getElementById('closePopup');
const SUBMITTASKBTN = document.getElementById("submitTask");
const UPDATETASKBTN = document.getElementById("updateTask");

const URL = "http://127.0.0.1:8000"; //This is the url of the server
var xhr = new XMLHttpRequest();

CLOSEPOPUPBTN.addEventListener("click", function() {
    POPUP.classList.remove('open');
    SUBMITTASKBTN.classList.remove('editing');
    UPDATETASKBTN.classList.remove('creating'); 
    POPUP.classList.add('closed');
});

CREATETASKBTN.addEventListener("click", function() {
    POPUP.classList.remove('closed');
    UPDATETASKBTN.classList.add('creating'); 
    POPUP.classList.add('open');
});

UPDATETASKBTN.addEventListener("click", function() {
    console.log(UPDATETASKBTN.className);
    createEvent(true, parseInt(UPDATETASKBTN.className)); //parseInt is used to convert the string to an integer
});

//This handles the process of PUTting data in the server json file

SUBMITTASKBTN.addEventListener("click", function() {
    createEvent(false, -1); // -1 is a placeholder for the index
});

function createEvent(updating, index) { //updating is a boolean that shows if the task is being edited, index is an integer
    if (allInputsHaveValueCheck(document.getElementById("eventColour").value,
                                document.getElementById("eventEndDate").value,
                                document.getElementById("eventPriority").value, 
                                document.getElementById("eventDetails").value)) {
        
        if (updating) {
            POPUP.classList.remove('open');
            SUBMITTASKBTN.classList.remove('editing');
            POPUP.classList.add('closed');
        }else{
            POPUP.classList.remove('open');
            UPDATETASKBTN.classList.remove('creating');
            POPUP.classList.add('closed');                            
        }
        
        xhr.open("PUT", URL + "/set", true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        let data = {
            eventColour: document.getElementById("eventColour").value,
            endDate: document.getElementById("eventEndDate").value,
            eventPriority: document.getElementById("eventPriority").value,
            detailsText: document.getElementById("eventDetails").value
        };
        let json = JSON.stringify(data);
        xhr.onload = function() { 
            if (updating) {
                deleteEvent(index); //delete old event
            }else {
                pageLoad();
            }
        }
        xhr.send(json);
    }else{
        alert("Please fill in all fields");
    }
}

//This will handle the created events loading with the webpage

window.onload = pageLoad();

function pageLoad() {
    xhr.open("GET", URL + "/get/" + sortByManager(), true);
    xhr.onload = function() {
        let responseJSON = JSON.parse(xhr.responseText);
        let tabelBody = document.getElementById("tableBody");
        while (tabelBody.childNodes.length > 0) {
            tabelBody.deleteRow(-1);
        }
        for(let i = 0; i < responseJSON['events'].length; i++) {
            if (responseJSON['events'][i] != null) {
                let eventObj = responseJSON['events'][i];
                console.log(typeof eventObj)
                if (allInputsHaveValueCheck(eventObj)) {
                
                    //Creates a new table row that will contain three pieces of data (event colour, event date and event details)

                    let tableRow = tabelBody.insertRow(i);

                    //Set up event info

                    let eventColour = tableRow.insertCell(0);
                    let eventDate = tableRow.insertCell(1);
                    let eventPriority = tableRow.insertCell(2);
                    let eventDetails = tableRow.insertCell(3);
                    
                    eventPriority.classList.add(eventObj.eventPriority);
                    eventDetails.classList.add("details");

                    eventColour.style.background = eventObj.eventColour;
                    eventDate.innerHTML = eventObj.endDate;
                    eventPriority.innerHTML = eventObj.eventPriority;
                    eventDetails.innerHTML = eventObj.detailsText;

                    //Set up delete button

                    let deleteBtnCell = tableRow.insertCell(4);
                    let deleteBtn = document.createElement("button");
                    deleteBtn.classList.add("deleteBtn");
                    deleteBtn.innerHTML = '<i class="fa fa-trash"></i>'
                    deleteBtnCell.appendChild(deleteBtn);
                    deleteBtn.addEventListener("click", function() {
                        let button = "#events > tbody > tr > td > .deleteBtn";
                        let buttons = document.querySelectorAll(button);
                        let buttonIndex = Array.from(buttons).indexOf(this);
                        deleteEvent(buttonIndex);
                    })

                    //Set up edit button

                    let editBtnCell = tableRow.insertCell(5);
                    let editBtn = document.createElement("button");
                    editBtn.classList.add("editBtn");
                    editBtn.innerHTML = '<i class="fa fa-pencil"></i>'
                    editBtnCell.appendChild(editBtn);
                    editBtn.addEventListener("click", function() {
                        let button = "#events > tbody > tr > td > .editBtn";
                        let buttons = document.querySelectorAll(button);
                        let buttonIndex = Array.from(buttons).indexOf(this);
                        POPUP.classList.remove('closed');
                        POPUP.classList.add('open');
                        UPDATETASKBTN.className = buttonIndex; //set the index of the event to be updated
                        SUBMITTASKBTN.classList.add('editing'); //set the submit button to editing mode
                        let selectedTableRow = document.querySelectorAll("#events > tbody > tr")[buttonIndex]; //get the table row of the event to be updated
                        document.getElementById("eventColour").value = selectedTableRow.children[0].style.background; //set the values of the popup to the values of the event to be updated
                        document.getElementById("eventEndDate").value = selectedTableRow.children[1].innerHTML;
                        document.getElementById("eventPriority").value = selectedTableRow.children[2].innerHTML;
                        document.getElementById("eventDetails").value = selectedTableRow.children[3].innerHTML;
                    })
                }else{
                    alert("Please fill in all fields");
                }
            }
        }
    }
    xhr.send();
}

function allInputsHaveValueCheck(eventColour, eventDate, eventPriority, eventDetails) {
    var allInputsHaveValue = true;
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] == "") {
            allInputsHaveValue = false;
        }
    }
    if (allInputsHaveValue == true) {
        return true;
    }else {
        return false;
    }
  }

function deleteEvent(buttonIndex) {
    xhr.open("DELETE", URL + "/delete/" + buttonIndex, true);
    xhr.onload = function() { 
        pageLoad();
    }
    xhr.send();
}

function sortByManager() {
    let value = document.getElementById("sortBy").value;
    if (value == "Date") {
        return "date";
    }else if (value == "Priority") {
        return "priority";
    }
}