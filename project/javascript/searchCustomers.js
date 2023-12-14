listOfCustomers()

let customerList = [];

async function fetchAllCustomers() {
        try {
            const result = await fetch("http://localhost:8080/getAllCustomers");
            if (result.status >= 400) {
                throw new Error();
            }
            const body = await result.json();
            customerList = body;
            console.log(customerList)
        } catch (error) {
            console.error("Error in fetch all customer, searchCustomer.js line 15 " + error)
        }
}

async function listOfCustomers() {
    await fetchAllCustomers();

    console.log("This should run afterwards")

    const customers = document.getElementById("customers")
    customers.innerHTML = ""

    for (let i = 0; i < customerList.length; i++) {
        const row = document.createElement('tr')

        const fName = document.createElement('td')
        fName.classList.add("customerBox")
        fName.textContent = customerList[i].firstName
        row.appendChild(fName)

        const lName = document.createElement('td')
        lName.classList.add("customerBox")
        lName.textContent = customerList[i].lastName
        row.appendChild(lName)

        const iD = document.createElement('td')
        iD.classList.add("customerBox")
        iD.textContent = customerList[i].customerId;
        row.appendChild(iD)

        customers.appendChild(row)
    }

}