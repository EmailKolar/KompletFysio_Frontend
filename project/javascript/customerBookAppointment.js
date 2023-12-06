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
let employeeAvailableWorkTimes = []
let selectedDate;
let selectedStartTime;

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
            modalTitle.innerHTML = "Login eller Opret"
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

async function getFormattedTimes(){
    let startTimeFormatted = timeFormatter(selectedDate, selectedStartTime)
    let endTimeFormatted = timeFormatter(selectedDate,generateEndTime(selectedStartTime,selectedDuration))
    console.log("start LocalDateTime: "+startTimeFormatted)
    console.log("end LocalDateTime: "+endTimeFormatted)
}

function generateEndTime(time, minutes){

    const [hours, originalMinutes] = time.split(':').map(Number);

    const totalMinutes = hours * 60 + originalMinutes + minutes;

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    const formattedHours = String(newHours).padStart(2, '0');
    const formattedMinutes = String(newMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;

}


function timeFormatter(date, time){
    const [year, month, day] = date.split('-');
    let [hours, minutes] = time.split(':');

    if(hours.length<=1) hours = "0"+ hours

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
        start.textContent = employeeAvailableWorkTimes[i]

        start.onclick = function () {
            console.log("clicked on timeslot: " + start.textContent)
            const allTimeSlots = document.querySelectorAll('.timeslotBox')
            allTimeSlots.forEach(slot => slot.classList.remove('timeslotBoxSelected'))
            start.classList.add('timeslotBoxSelected')
            enableContinueButton()
            selectedStartTime = start.textContent;
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


