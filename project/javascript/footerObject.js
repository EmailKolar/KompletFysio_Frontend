function createBootstrapContent(columnNumber) {
    let content = `
        <h3>KOL${columnNumber}</h3>
        <p>Noget indhold til kolonne ${columnNumber}</p>
    `;
    return content;
}

function createBootstrapFooter() {
    const footer = document.createElement('footer');
    footer.classList.add('bg-dark', 'text-light', 'py-4');

    const container = document.createElement('div');
    container.classList.add('container');

    const row = document.createElement('div');
    row.classList.add('row');

    // Opretter de 3 columns
    for (let i = 0; i < 3; i++) {
        const column = document.createElement('div');
        column.classList.add('col');
        column.setAttribute('id', `kolonne-${i + 1}`);
        row.appendChild(column);
    }

    container.appendChild(row);
    footer.appendChild(container);

    return footer;
}

function addContentToFooter() {
    const footer = createBootstrapFooter();

    const existingFooter = document.querySelector('.footer');
    existingFooter.appendChild(footer);

    for (let i = 0; i < 2; i++) {
        const columnNumber = i + 1;
        const footerContent = createBootstrapContent(columnNumber);

        const footerColumns = footer.querySelectorAll('.col');
        footerColumns[i].innerHTML = footerContent;
    }
}

export { addContentToFooter };
