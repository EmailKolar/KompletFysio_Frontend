//fixme this works now, make it show it in the html list
function fetchAllCustomers() {
    let customerList = []
    fetch("http://localhost:8080/getAllCustomers")
        .then(result => {
            if (result >= 400) {
                throw new Error();
            }
            return result.json()
        }).then(body => {
        customerList = body;
        console.log(customerList)
    })

    // fetch("localhost:8080/getAllCustomers")
    //     .then()
    // try {
    //     const result = fetch("localhost:8080/getAllCustomers");
    //     if (result.status >= 400) {
    //         throw new Error();
    //     }
    //     const body = result;
    //     console.log(body);
    // } catch (error) {
    //     console.log("Error when fetching all customers" + error)
    // }
}

function listOfCustomers() {
    //fixme delete this?
    // while (tableBody.firstChild) {
    //     tableBody.removeChild(tableBody.firstChild);
    //     console.log("rest 1 table")
    //     disableContinueButton()
    // }
    console.log("This runs line 23")
    fetchAllCustomers();
    console.log("This runs line 25")


    //TODO MAKE THIS LIST
    // for (let i = 0; i < employeeAvailableWorkTimes.length; i++) {
    //     const row = document.createElement('tr')
    //     const singleTimeSlot = document.createElement("div")
    //     singleTimeSlot.style.padding = "3px"
    //     singleTimeSlot.style.width = "100%"
    //     const start = document.createElement('td')
    //     start.classList.add("timeslotBox")
    //     start.textContent = employeeAvailableWorkTimes[i]
    //
    //     start.onclick = function () {
    //         console.log("clicked on timeslot: " + start.textContent)
    //         const allTimeSlots = document.querySelectorAll('.timeslotBox')
    //         allTimeSlots.forEach(slot => slot.classList.remove('timeslotBoxSelected'))
    //         start.classList.add('timeslotBoxSelected')
    //         enableContinueButton()
    //         selectedStartTime = start.textContent;
    //     }
    //     singleTimeSlot.appendChild(start);
    //     row.appendChild(singleTimeSlot)
    //     tableBody.appendChild(row)
    // }
}