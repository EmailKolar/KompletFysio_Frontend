//variable that defines the Book Appointment Modal's current step - see "customerBookAppointment.html" for more
let currentStep = 0

const progressBar = document.querySelector('.progress-bar')

//variable for the blue "Fortsæt" button
const continueBtn = document.getElementById("continueBtn")

//variable for the red "Afbryd" button
const cancelBtn = document.getElementById("cancelBtn")

function nextStep() {

    // Hide the current step in the Modal
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
            //logic for choose treatment (dropdown?)
            break
        case 3:
            console.log("choose employee")
            //logic for choose employee (dropdown with applicable employees based on chosen treatment, date and time)
            break
        case 4:
            console.log("choose date")
            //logic for choose date (based on chosen treatment and which employees are applicable)
            break
        case 5:
            console.log("choose time")
            //logic for choose time
            break
        case 6:
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

//this method is called when the customer presses "Afbryd" in the modal.
function resetBooking() {
    document.getElementById(`step${currentStep}Content`).style.display = 'none'
    currentStep = 0
    document.getElementById(`step${currentStep}Content`).style.display = 'block'
    console.log("reset booking")

    //reset the buttons
    cancelBtn.style.display = 'block'
    continueBtn.style.display = 'block'

    // reset the progressbar to 0
    progressBar.style.width = 0

}