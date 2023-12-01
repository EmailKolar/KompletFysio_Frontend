//Footer fetch til forsiden
fetch('html/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footerContentIndex').innerHTML = data;
    })
    .catch(error => {
        console.log('Fejl ved indlæsning af footer:', error);
    });

//Footer fetch til undersiderne
fetch('../html/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footerContent').innerHTML = data;
    })
    .catch(error => {
        console.log('Fejl ved indlæsning af footer:', error);
    });
