
document.addEventListener("DOMContentLoaded", function () {

    const logInUrl = "http://localhost:8080/logInCustomer"

    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        let username = document.getElementById("usernameFieldLogIn").value;
        let password = document.getElementById("passwordFieldLogIn").value;

        let  bodylist = {
            username : username,
            password : password
        }

        let body = JSON.stringify(bodylist)

        fetch(logInUrl + "/"+username+"/"+password,{
            method : "POST",
            headers:{
                "Conten-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
            })
            .catch(error =>{
                console.error("err: ", error)
            })
    })

})