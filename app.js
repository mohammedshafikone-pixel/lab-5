// Show selected page
function showPage(pageId) {

    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });

    document.getElementById(pageId).classList.remove('hidden');
}


// Fetch API data
async function getData(url) {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to load data');
    }

    return await response.json();
}


// Display data in HTML table
function displayTable(containerId, data) {

    const container = document.getElementById(containerId);

    if (!data || data.length === 0) {
        container.innerHTML = '<p>No results found.</p>';
        return;
    }

    const columns = Object.keys(data[0]);

    let html = '<table><thead><tr>';

    columns.forEach(column => {
        html += `<th>${column}</th>`;
    });

    html += '</tr></thead><tbody>';

    data.forEach(row => {

        html += '<tr>';

        columns.forEach(column => {

            const value = row[column] ?? '';

            html += `<td>${escapeHTML(value)}</td>`;
        });

        html += '</tr>';
    });

    html += '</tbody></table>';

    container.innerHTML = html;
}


// Prevent HTML injection when displaying data
function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}


// Load categories into search form
async function loadCategories() {

    try {

        const data = await getData('/api/categories');

        const select = document.getElementById('categoryId');

        data.forEach(category => {

            const option = document.createElement('option');

            option.value = category.category_id;

            option.textContent = category.name;

            select.appendChild(option);

        });

    } catch (error) {
        console.error(error);
    }
}


// F2.1 Search Books
async function searchBooks() {

    const keyword = document.getElementById('keyword').value;

    const minPrice = document.getElementById('minPrice').value;

    const maxPrice = document.getElementById('maxPrice').value;

    const categoryId = document.getElementById('categoryId').value;

    const params = new URLSearchParams({
        keyword,
        minPrice,
        maxPrice,
        categoryId
    });

    try {

        const data = await getData('/api/search?' + params);

        displayTable('searchResults', data);

    } catch (error) {

        alert(error.message);

    }
}


// F2.2 Catalogue
async function loadCatalogue() {

    try {

        const data = await getData('/api/catalogue');

        displayTable('catalogueResults', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.3 (a)
async function loadCategoryReports() {

    try {

        const data = await getData('/api/reports/categories');

        displayTable('categoryResults', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.3 (b)
async function loadAuthorReports() {

    try {

        const data = await getData('/api/reports/authors');

        displayTable('authorReports', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.3 (c)
async function loadPriceReports() {

    try {

        const data = await getData('/api/reports/prices');

        displayTable('priceResults', [data]);

    } catch (error) {
        alert(error.message);
    }
}


// F2.4 (a)
async function loadActiveLoans() {

    try {

        const data = await getData('/api/loans/active');

        displayTable('activeLoans', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.4 (b)
async function loadNoMembers() {

    try {

        const data = await getData('/api/loans/no-members');

        displayTable('noMembers', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.4 (c)
async function loadNoBooks() {

    try {

        const data = await getData('/api/loans/no-books');

        displayTable('noBooks', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.5 (a)
async function loadMostBooks() {

    try {

        const data = await getData('/api/most-borrowed/books');

        displayTable('mostBooks', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.5 (b)
async function loadMostMembers() {

    try {

        const data = await getData('/api/most-borrowed/members');

        displayTable('mostMembers', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.6 (a)
async function loadAuthors() {

    try {

        const data = await getData('/api/authors');

        displayTable('allAuthors', data);

    } catch (error) {
        alert(error.message);
    }
}


// F2.6 (b)
async function loadSameCountry() {

    try {

        const data = await getData('/api/authors/same-country');

        displayTable('sameCountry', data);

    } catch (error) {
        alert(error.message);
    }
}


// Start
document.addEventListener('DOMContentLoaded', () => {

    loadCategories();

    showPage('search');

});