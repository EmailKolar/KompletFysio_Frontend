

function listOfCustomers() {
    //reset the timeslot Table body

    //fixme delete this?
    // while (tableBody.firstChild) {
    //     tableBody.removeChild(tableBody.firstChild);
    //     console.log("rest 1 table")
    //     disableContinueButton()
    // }


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