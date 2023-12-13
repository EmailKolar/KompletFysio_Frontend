document.addEventListener("DOMContentLoaded", function () {

const signUpUrl = "http://localhost:8080/saveCustomer"

document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let fname = document.getElementById("fnameField").value;
    let lname = document.getElementById("lnameField").value;
    let dob = document.getElementById("dobField").value;
    let cpr = document.getElementById("cprField").value;
    let address = document.getElementById("addressField").value;
    let post = document.getElementById("post").value;
    let city = document.getElementById("cityField").value;
    let username = document.getElementById("usernameFieldSignup").value;
    let password = document.getElementById("passwordFieldSignup").value;

    let  bodylist = {
       customerId : 1,
       firstName : fname,
       lastName : lname,
       dateOfBirth : dob,
       cpr : cpr,
       address : address,
       zipCode : post,
       city : city,
       username : username,
       password : password
    }

   let body = JSON.stringify(bodylist)

    signUpFetch(signUpUrl,body)

})

    function signUpFetch(fetchUrl,body){
        fetch(fetchUrl,{
            method: "POST",
            body : body,
            headers:{
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error("Error:", error);
            });

    }
})