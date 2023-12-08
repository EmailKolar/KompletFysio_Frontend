let firstName = document.getElementById("firstNameInput");
let lastName = document.getElementById("lastNameInput")
let usernamer = document.getElementById("usernameInput")
let password = document.getElementById("passwordInput")
let isPartner = document.getElementById("isPartnerCheckBox")

function saveEmployee() {
    //pack up the json response
    const data = {
        firstName: firstName,
        lastName: lastName,
        username: usernamer,
        password: password,
        isPartner: isPartner
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