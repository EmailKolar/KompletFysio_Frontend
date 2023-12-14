//variable that defines the Book Appointment Modal's current step - see "customerBookAppointment.html" for more
let currentStep = 0

const progressBar = document.querySelector('.progress-bar')

//variable for the green "Fortsæt" button and red "Fortryd"
const continueBtn = document.getElementById("continueBtn")
const cancelBtn = document.getElementById("cancelBtn")

//Modal title - this changes for every step in the modal
const modalTitle = document.getElementById("staticBackdropLabel")

//lists for the different treatments
let allTreatments = []
let massageList = []
let fysioList = []
let pregnantList = []
let lungList = []

//step 1 - customer login
let customerId = 1

//step 2 - choose treatment
let selectedTreatmentId;
let selectedDuration;
let treatmentTypeButton = document.getElementById("treatmentTypeButton")
let treatmentButton = document.getElementById("treatmentButton")
let treatmentTypeDropdown = document.getElementById("treatmentSelectionDropDown")

//step 3 - choose employee
let employeeList = []
let selectedEmployeeId;

//step 4 - chose date/time
const tableBody = document.getElementById("timeslots")
let employeeAvailableWorkTimes = []
let selectedDate;
let selectedStartTime;
let formatedStartTime;
let formatedEndTime;

//Fetches
//For Local
// const fetchAllTreatmentsURL = "http://localhost:8080/allTreatments"
// const fetchEmployeesWithTreatmentIdURL = "http://localhost:8080/getEmployeeByTreatmentId/"
// const fetchEmployeeTimeSlotsURL = "http://localhost:8080/getEmployeeHoursById/"
// const fetchAnyEmployeeTimeSlotsURL = "http://localhost:8080/getAnyEmployeeHours/"
// const fetchSaveAppointmentURL = "http://localhost:8080/appointment"
// const signUpFetchURL = "http://localhost:8080/saveCustomer"
// const logInURL = "http://localhost:8080/logInCustomer"

const fetchAllTreatmentsURL = "https://kompletfysiobackend.azurewebsites.net/allTreatments"
const fetchEmployeesWithTreatmentIdURL = "https://kompletfysiobackend.azurewebsites.net/getEmployeeByTreatmentId/"
const fetchEmployeeTimeSlotsURL = "https://kompletfysiobackend.azurewebsites.net/getEmployeeHoursById/"
const fetchAnyEmployeeTimeSlotsURL = "https://kompletfysiobackend.azurewebsites.net/getAnyEmployeeHours/"
const fetchSaveAppointmentURL = "https://kompletfysiobackend.azurewebsites.net/appointment"
const signUpFetchURL = "https://kompletfysiobackend.azurewebsites.net/saveCustomer"
const logInURL = "https://kompletfysiobackend.azurewebsites.net/logInCustomer"

async function nextStep() {

    // Hide the current step/body in the Modal (see "modal-body" in customerBookAppointment)
    document.getElementById(`step${currentStep}Content`).style.display = 'none'
    currentStep++;

    //This is the main method for booking. functions and fetches will be called from here
    switch (currentStep) {

        case 1:
            modalTitle.innerHTML = "Log ind eller Opret"
            disableContinueButton()
            //logic for customer login or customer Registration
            break
        case 2:
            modalTitle.innerHTML = "Vælg Behandling"
            treatmentButton.disabled = true
            disableContinueButton()
            await fetchTreatments()
            inputTreatmentLists()
            //choose treatment
            //logic for choose treatment (dropdown?)
            break
        case 3:
            modalTitle.innerHTML = "Vælg Behandler"
            disableContinueButton()
            await fetchCapableEmployees()
            showCapableEmployees()
            //fetch employee's based on treatment_id
            //logic for choose employee (dropdown with applicable employees based on chosen treatment, date and time)
            break
        case 4:
            modalTitle.innerHTML = "Vælg Dato & Tid"
            disableContinueButton()
            date()
            break
        case 5:
            await getFormattedTimes()
            saveAppointment()
            modalTitle.innerHTML = "Færdig"
            cancelBtn.style.display = 'none'
            continueBtn.style.display = 'none'
            //logic for confirmation (save to DB ect.)
            break
    }

    // Show the next step in the Modal
    document.getElementById(`step${currentStep}Content`).style.display = 'block'

    // Update the progress bar to visually inform the customer
    // const progressBar = document.querySelector('.progress-bar')
    const progress = (currentStep / 5) * 100
    progressBar.style.width = `${progress}%`
    progressBar.setAttribute('aria-valuenow', progress)
}

function saveAppointment() {
    //pack up the json response
    const data = {
        startTime: formatedStartTime,
        endtime: formatedEndTime,
        note: "",
        customerId: customerId,
        employeeId: selectedEmployeeId,
        treatmentId: selectedTreatmentId
    }
    const body = JSON.stringify(data)
    console.log(body)
    fetch(fetchSaveAppointmentURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            return response.json()
        })
        .then(data => {
            console.log("Appointment added: " + data)
        })
        .catch(error => {
            console.error("Error saving Appointment: " + error)
        });
}

async function getFormattedTimes() {
    formatedStartTime = timeFormatter(selectedDate, selectedStartTime)
    formatedEndTime = timeFormatter(selectedDate, generateEndTime(selectedStartTime, selectedDuration))
    console.log("start LocalDateTime: " + formatedStartTime)
    console.log("end LocalDateTime: " + formatedEndTime)
}

function generateEndTime(time, minutes) {

    const [hours, originalMinutes] = time.split(':').map(Number);

    const totalMinutes = hours * 60 + originalMinutes + minutes;

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    const formattedHours = String(newHours).padStart(2, '0');
    const formattedMinutes = String(newMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;

}


function timeFormatter(date, time) {
    const [year, month, day] = date.split('-');
    let [hours, minutes] = time.split(':');

    if (hours.length <= 1) hours = "0" + hours

    return year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":00"
}


function date() {
    let dateContainer = document.getElementById("dateInputContainer")
    dateContainer.innerHTML = ""
    dateContainer.style.margin = "10px"
    let dateInput = document.createElement("input")
    dateInput.type = "date"

    dateInput.addEventListener("change", function () {
        selectedDate = dateInput.value
        console.log(dateInput.value)

        fetchEmployeeAvailableTimeSlots()

    });
    dateContainer.appendChild(dateInput)
}

function createTimeslots() {
    //reset the timeslot Table body
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
        console.log("rest 1 table")
        disableContinueButton()
    }

    for (let i = 0; i < employeeAvailableWorkTimes.length; i++) {
        const row = document.createElement('tr')
        const singleTimeSlot = document.createElement("div")
        singleTimeSlot.style.padding = "3px"
        singleTimeSlot.style.width = "100%"
        const start = document.createElement('td')
        start.classList.add("timeslotBox")
        start.textContent = employeeAvailableWorkTimes[i].timeSlot

        start.onclick = function () {
            console.log("clicked on timeslot: " + start.textContent)
            const allTimeSlots = document.querySelectorAll('.timeslotBox')
            allTimeSlots.forEach(slot => slot.classList.remove('timeslotBoxSelected'))
            start.classList.add('timeslotBoxSelected')
            selectedStartTime = employeeAvailableWorkTimes[i].timeSlot
            enableContinueButton()
            //when customer presses "Vilkårlig behandler"
            // The selectedEmployeeId is set to the one corresponding with the timeslot
            if (selectedEmployeeId < 0) {
                selectedEmployeeId = employeeAvailableWorkTimes[i].employeeId
            }
        }
        singleTimeSlot.appendChild(start);
        row.appendChild(singleTimeSlot)
        tableBody.appendChild(row)
    }
}

function showCapableEmployees() {
    let employeeContainer = document.getElementById("employeesContainer")
    employeeContainer.innerHTML = ''

    //customer can select the wilcardEmployee, and the selectedEmployeeId will become <0 Anne wanted that feature :)
    let wildCardEmployeeDiv = document.createElement("div")
    wildCardEmployeeDiv.textContent = "Vilkårlig Behandler"
    wildCardEmployeeDiv.classList.add("btn", "btnGreen", "employeeBox")
    wildCardEmployeeDiv.style.marginBottom = "25px"
    wildCardEmployeeDiv.onclick = function () {

        let allGreenButtons = document.querySelectorAll('.btnGreenSelected')
        allGreenButtons.forEach(box => box.classList.remove('btnGreenSelected'))
        wildCardEmployeeDiv.classList.add('btnGreenSelected')

        selectedEmployeeId = -1
        console.log("selected EmployeeId: " + selectedEmployeeId);
        enableContinueButton();
    };
    employeeContainer.appendChild(wildCardEmployeeDiv)

    for (let i = 0; i < employeeList.length; i++) {
        let employeeDiv = document.createElement("div")
        employeeDiv.classList.add("btn", "employeeBox", "btnGreen")

        //set the name of the employee
        let employeeName = employeeList[i].firstName + " " + employeeList[i].lastName
        employeeDiv.textContent = employeeName

        // make an onclick for each div/employee
        employeeDiv.onclick = function () {

            let allGreenButtons = document.querySelectorAll('.btnGreenSelected')
            allGreenButtons.forEach(box => box.classList.remove('btnGreenSelected'))
            employeeDiv.classList.add('btnGreenSelected')

            selectedEmployeeId = employeeList[i].employeeId
            console.log("selected EmployeeId: " + selectedEmployeeId)
            enableContinueButton()
        };
        employeeContainer.appendChild(employeeDiv)
    }
}


function inputTreatmentLists() {
    let massageIdRange = [1, 2, 3, 4]
    let sportsFysioIdRange = [5, 6, 7, 8, 9]
    let pregnantIdRange = [10, 11]
    let lungIdRange = [12, 13]

    massageList = allTreatments.filter(treatment => massageIdRange.includes(treatment.treatmentId))
    fysioList = allTreatments.filter(treatment => sportsFysioIdRange.includes(treatment.treatmentId))
    pregnantList = allTreatments.filter(treatment => pregnantIdRange.includes(treatment.treatmentId))
    lungList = allTreatments.filter(treatment => lungIdRange.includes(treatment.treatmentId))
}

//selects the chosen treatmentType in step 2
function selectTreatmentType(choice) {
    disableContinueButton()
    treatmentTypeDropdown.innerHTML = ""
    treatmentButton.textContent = "Vælg Behandling"

    //now the user can press the "Vælg Behandling" button
    treatmentButton.disabled = false

    //put the chosen list into "behandlingsType"
    let selectedList;
    switch (choice) {
        case 1:
            treatmentTypeButton.textContent = "Fysio- & sportsfysioterapi"
            selectedList = fysioList
            break;
        case 2:
            treatmentTypeButton.textContent = "Massage"
            selectedList = massageList
            break;
        case 3:
            treatmentTypeButton.textContent = "Gravid- & efterfødsel"
            selectedList = pregnantList
            break;
        case 4:
            treatmentTypeButton.textContent = "Lungefysioterapi"
            selectedList = lungList
            break;
    }


    //Add the list items to the dropDown
    selectedList.forEach(treatment => {
        let listTreatment = document.createElement("li")
        listTreatment.className = "dropdown-item"
        listTreatment.style.cursor = "pointer"
        listTreatment.textContent = treatment.treatmentName
        listTreatment.style.textAlign = "center"
        listTreatment.onclick = () => {
            console.log("treatment:", treatment)
            treatmentButton.textContent = treatment.treatmentName
            selectedTreatmentId = treatment.treatmentId
            selectedDuration = treatment.duration
            console.log("Selected treatment ID:", selectedTreatmentId + ", selected duration: " + selectedDuration)
            enableContinueButton()
        };
        treatmentTypeDropdown.appendChild(listTreatment)
    });
}

//this method is called when the customer presses "Afbryd" in the modal.
function resetBooking() {
    document.getElementById(`step${currentStep}Content`).style.display = 'none'
    currentStep = 0
    document.getElementById(`step${currentStep}Content`).style.display = 'block'
    console.log("reset booking")

    //reset the buttons
    cancelBtn.style.display = 'block'
    continueBtn.style.display = 'block'
    treatmentTypeButton.textContent = "Vælg Behandlings Type"
    treatmentTypeDropdown.innerHTML = ""
    treatmentButton.textContent = "Vælg Behandling"

    //reset the timeslot Table body
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
        console.log("rest 1 table")
    }

    // reset the progressbar to 0
    progressBar.style.width = 0
    enableContinueButton()
}

function disableContinueButton() {
    continueBtn.disabled = true;
}

function enableContinueButton() {
    continueBtn.disabled = false;
}

async function fetchTreatments() {
    try {
        const result = await fetch(fetchAllTreatmentsURL);
        if (result.status >= 400) {
            throw new Error();
        }
        const body = await result.json();
        allTreatments = body;
    } catch (error) {
        //TODO Exception handling?
    }
}

async function fetchCapableEmployees() {
    try {
        const result = await fetch(fetchEmployeesWithTreatmentIdURL + selectedTreatmentId);
        if (result.status >= 400) {
            throw new Error();
        }
        const body = await result.json();
        employeeList = body;
        console.log(employeeList)
    } catch (error) {
        //TODO Exception handling?
    }
}

function fetchEmployeeAvailableTimeSlots() {
    //getAnyEmployeeHours/{date}/{duration}/{treatmentId}
    let fetchUrl
    if (selectedEmployeeId > 0) {
        fetchUrl = fetchEmployeeTimeSlotsURL + selectedEmployeeId + "/" + selectedDate + "/" + selectedDuration
    } else {
        fetchUrl = fetchAnyEmployeeTimeSlotsURL + selectedDate + "/" + selectedDuration + "/" + selectedTreatmentId
    }

    employeeAvailableWorkTimes = []
    fetch(fetchUrl)
        .then(result => {
            if (result >= 400) {
                throw new Error();
            }
            return result.json()
        }).then(body => {
        employeeAvailableWorkTimes = body;
        // employeeAvailableWorkTimes = body.map(object => object.timeSlot);
        console.log(employeeAvailableWorkTimes)
        createTimeslots()
    })
}

function signUpFetch() {
    event.preventDefault()

    let fname = document.getElementById("fnameField").value;
    let lname = document.getElementById("lnameField").value;
    let dob = document.getElementById("dobField").value;
    let cpr = document.getElementById("cprField").value;
    let address = document.getElementById("addressField").value;
    let post = document.getElementById("post").value;
    let city = document.getElementById("cityField").value;
    let username = document.getElementById("usernameFieldSignup").value;
    let password = document.getElementById("passwordFieldSignup").value;

    let bodylist = {
        customerId: 1,
        firstName: fname,
        lastName: lname,
        dateOfBirth: dob,
        cpr: cpr,
        address: address,
        zipCode: post,
        city: city,
        username: username,
        password: password
    }

    let body = JSON.stringify(bodylist)
    fetch(signUpFetchURL, {
        method: "POST",
        body: body,
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("Signup success")
            customerId = data.customerId
            closeSignUpAndLoginModals()
            nextStep()
        })
        .catch(error => {
            console.error("Error:", error);
        });


}

function logInFetch() {
    event.preventDefault()
    let username = document.getElementById("usernameFieldLogIn").value;
    let password = document.getElementById("passwordFieldLogIn").value;

    let bodylist = {
        username: username,
        password: password
    }

    let body = JSON.stringify(bodylist)

    fetch(logInURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            return response.json()
        })
        .then(data => {
            console.log("Log in success: " + data.cpr)
            customerId = data.customerId
            closeSignUpAndLoginModals()
            nextStep()
        })
        .catch(error => {
            console.error("Error loggind in: " + error)
        });
}
function closeSignUpAndLoginModals(){
    let modal1 = document.getElementById("signupModal")
    modal1.style.display = "none"

    let modal2 = document.getElementById("logInModal")
    modal2.style.display = "none"
}


