const labels = {
  'F2.1': 'F2.1 — Books above the library average price',
  'F2.2a': 'F2.2(a) — Books never borrowed',
  'F2.2b': 'F2.2(b) — Members who never borrowed',
  'F2.3a': 'F2.3(a) — Most expensive book in each category',
  'F2.3b': 'F2.3(b) — Books above their category average',
  'F2.4a': 'F2.4(a) — Members above average loan count',
  'F2.4b': 'F2.4(b) — Authors with at least one borrowed book',
  'F2.5a': 'F2.5(a) — Reviews report',
  'F2.5b': 'F2.5(b) — Books above the overall average rating',
  'F2.6a': 'F2.6(a) — All author and publisher countries',
  'F2.6b': 'F2.6(b) — Countries with authors and publishers',
  'F2.6c': 'F2.6(c) — Countries with authors but no publisher',
  'F2.6d': 'F2.6(d) — Combined authors and members'
};

const heading = document.getElementById('heading');
const message = document.getElementById('message');
const table = document.getElementById('results');

function showRows(rows) {
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';
  if (!rows.length) {
    message.textContent = 'Query completed successfully. No rows were returned.';
    return;
  }
  message.textContent = `${rows.length} row(s) returned.`;
  const columns = Object.keys(rows[0]);
  const tr = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  rows.forEach(row => {
    const line = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      td.textContent = row[col] === null ? 'NULL' : row[col];
      line.appendChild(td);
    });
    tbody.appendChild(line);
  });
}

document.querySelectorAll('button[data-page]').forEach(button => {
  button.addEventListener('click', async () => {
    const page = button.dataset.page;
    heading.textContent = labels[page] || page;
    message.textContent = 'Running query...';
    table.querySelector('thead').innerHTML = '';
    table.querySelector('tbody').innerHTML = '';
    try {
      const response = await fetch(`/api/${encodeURIComponent(page)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      showRows(data);
    } catch (error) {
      message.textContent = `Error: ${error.message}`;
    }
  });
});

fetch('/api/health')
  .then(r => r.json())
  .then(data => {
    document.getElementById('status').textContent =
      data.status === 'connected' ? `Database connected: ${data.database}` : 'Database connection failed';
  })
  .catch(() => document.getElementById('status').textContent = 'Server is not responding');
