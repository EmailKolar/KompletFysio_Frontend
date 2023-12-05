//variable that defines the Book Appointment Modal's current step - see "customerBookAppointment.html" for more
let currentStep = 0

const progressBar = document.querySelector('.progress-bar')

//variable for the blue "Fortsæt" button and red "Fortryd"
const continueBtn = document.getElementById("continueBtn")
const cancelBtn = document.getElementById("cancelBtn")

//lists for the different treatments
let allTreatments = []
let massageList = []
let fysioList = []
let pregnantList = []
let lungList = []

//step 2 - choose treatment
let selectedTreatmentId;
let selectedDuration;
let treatmentTypeButton = document.getElementById("treatmentTypeButton")
let treatmentButton = document.getElementById("treatmentButton")
let treatmentTypeDropdown = document.getElementById("treatmentSelectionDropDown")

//step 3 - choose employee
let employeeList = []
let selectedEmployeeId;
let selectedDate;

//step 4 - chose date/time
let employeeAvailableWorkTimes = []
const tableBody = document.getElementById("timeslots")

//Fetches
const fetchAllTreatmentsURL = "http://localhost:8080/allTreatments"
const fetchEmployeesWithTreatmentIdURL = "http://localhost:8080/getEmployeeByTreatmentId/"
const fetchEmployeeTimeSlotsURL = "http://localhost:8080/getEmployeeHoursById/"

async function nextStep() {

    // Hide the current step/body in the Modal (see "modal-body" in customerBookAppointment)
    document.getElementById(`step${currentStep}Content`).style.display = 'none'
    currentStep++;

    //This is the main method for booking. functions and fetches will be called from here
    switch (currentStep) {

        case 1:
            console.log("customer login")
            //logic for customer login or customer Registration
            break
        case 2:
            console.log("treatment")
            disableContinueButton()
            await fetchTreatments()
            inputTreatmentLists()
            //choose treatment
            //logic for choose treatment (dropdown?)
            break
        case 3:
            console.log("choose employee")
            disableContinueButton()
            await fetchCapableEmployees()
            showCapableEmployees()
            //fetch employee's based on treatment_id
            //logic for choose employee (dropdown with applicable employees based on chosen treatment, date and time)
            break
        case 4:
            //logic for choose date (based on chosen treatment and which employees are applicable)
            console.log("choose date")
            disableContinueButton()
            date()
            break
        case 5:
            console.log("done")
            cancelBtn.style.display = 'none'
            continueBtn.style.display = 'none'
            //logic for confirmation (save to DB ect.)
            break
    }

    // Show the next step in the Modal
    document.getElementById(`step${currentStep}Content`).style.display = 'block'


    // Update the progress bar to visually inform the customer
    // const progressBar = document.querySelector('.progress-bar')
    const progress = (currentStep / 6) * 100
    progressBar.style.width = `${progress}%`
    progressBar.setAttribute('aria-valuenow', progress)


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
    // console.log(dateInput.value)

    dateContainer.appendChild(dateInput)
}


//revervations yoink:
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
        start.textContent = employeeAvailableWorkTimes[i]

        start.onclick = function () {
            console.log("clicked on timeslot: " + start.textContent)
            const allTimeSlots = document.querySelectorAll('.timeslotBox')
            allTimeSlots.forEach(slot => slot.classList.remove('timeslotBoxSelected'))
            start.classList.add('timeslotBoxSelected')
            enableContinueButton()
        }

        singleTimeSlot.appendChild(start);
        row.appendChild(singleTimeSlot)
        tableBody.appendChild(row)
    }
}


function showCapableEmployees() {
    let employeeContainer = document.getElementById("employeesContainer")
    employeeContainer.innerHTML = ''

    let wildCardEmployeeDiv = document.createElement("div")
    wildCardEmployeeDiv.textContent = "Vilkårlig Behandler"
    wildCardEmployeeDiv.classList.add("btn", "btn-secondary", "employeeBox")
    wildCardEmployeeDiv.style.marginBottom = "25px"
    wildCardEmployeeDiv.onclick = function () {
        //customer can select the wilcardEmployee, and the selectedEmployeeId will become <0 Anne wanted that feature :)
        removeBlueColorOnButtons()
        wildCardEmployeeDiv.classList.remove("btn-secondary");
        wildCardEmployeeDiv.classList.add("btn-primary");

        selectedEmployeeId = -1
        console.log("selected EmployeeId: " + selectedEmployeeId);
        enableContinueButton();
    };
    employeeContainer.appendChild(wildCardEmployeeDiv)

    for (let i = 0; i < employeeList.length; i++) {
        let employeeDiv = document.createElement("div")
        employeeDiv.classList.add("btn", "btn-secondary")
        employeeDiv.classList.add("employeeBox")

        //set the name of the employee
        let employeeName = employeeList[i].firstName + " " + employeeList[i].lastName
        employeeDiv.textContent = employeeName

        // make an onclick for each div/employee
        employeeDiv.onclick = function () {

            removeBlueColorOnButtons()
            // Add btn-primary class to the selected employee (btn)
            employeeDiv.classList.remove("btn-secondary");
            employeeDiv.classList.add("btn-primary");

            selectedEmployeeId = employeeList[i].employeeId
            console.log("selected EmployeeId: " + selectedEmployeeId)
            enableContinueButton()
        };
        employeeContainer.appendChild(employeeDiv)
    }
}

function removeBlueColorOnButtons() {
    let allButtons = document.querySelectorAll(".employeeBox");
    console.log(allButtons)
    allButtons.forEach(button => {
        button.classList.remove("btn-primary");
        button.classList.add("btn-secondary");
    });
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

    // console.log(massageList)
    // console.log(fysioList)
    // console.log(pregnantList)
    // console.log(lungList)

}

//selects the chosen treatmentType in step 2
function selectTreatmentType(choice) {
    disableContinueButton()

    treatmentTypeDropdown.innerHTML = ""
    // treatmentTypeButton.textContent = "Vælg Behandlings Type"

    treatmentButton.textContent = "Vælg Behandling"

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
    //add and remove styling to the buttons
    treatmentTypeButton.classList.remove("btn-primary")
    treatmentTypeButton.classList.add("btn-secondary")
    treatmentButton.classList.remove("btn-secondary")
    treatmentButton.classList.add("btn-primary")

    //Add the list items to the dropDown
    selectedList.forEach(treatment => {
        let listTreatment = document.createElement("li")
        listTreatment.className = "dropdown-item"
        listTreatment.textContent = treatment.treatmentName
        listTreatment.style.textAlign = "center"
        listTreatment.onclick = () => {
            console.log("treatment:", treatment)
            treatmentButton.textContent = treatment.treatmentName
            selectedTreatmentId = treatment.treatmentId
            selectedDuration = treatment.duration
            console.log("Selected treatment ID:", selectedTreatmentId + ", selected duration: " + selectedDuration)
            treatmentButton.classList.add("btn-secondary")
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
    treatmentTypeButton.classList.remove("btn-secondary")
    treatmentTypeButton.classList.add("btn-primary")
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
    // continueBtn.classList.remove("btn-primary")
    continueBtn.disabled = true;
}

function enableContinueButton() {
    // continueBtn.classList.remove("btn-secondary")
    // continueBtn.classList.add("btn-primary")
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
        // console.log(allTreatments);
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
    fetch(fetchEmployeeTimeSlotsURL + selectedEmployeeId + "/" + selectedDate + "/" + selectedDuration)
        .then(result => {
            if (result >= 400) {
                throw new Error();
            }
            return result.json()
        }).then(body => {
        employeeAvailableWorkTimes = body;
        console.log(employeeAvailableWorkTimes)
        createTimeslots()
    })
}


