document.addEventListener("DOMContentLoaded",function (){
    document.getElementById('signupForm').addEventListener('submit', signup);
})

function signup(event) {
    event.preventDefault()
    const nameField = document.getElementById("nameField").value;
    const passwordFieldSignup = document.getElementById("passwordFieldSignup").value;
    let payload = {
        username: nameField,
        password: passwordFieldSignup
    };
    payload = JSON.stringify(payload)
    fetch("http://localhost:8080/signup",
        {
            method: "POST",
            body: payload,
            headers:{'content-type': 'application/json'}
        })
        .then(function (res) {
            return res.json();
        })
        // .then(function (data) {
        //     printThis(div, JSON.stringify(data), "green")
        // })
}