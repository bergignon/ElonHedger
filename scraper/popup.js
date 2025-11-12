const tableBody = document.querySelector('#dataTable tbody');
const summary = document.getElementById('summary');
const exportBtn = document.getElementById('export');
const resetBtn = document.getElementById('reset');

function renderTable(data) {
  tableBody.innerHTML = '';
  let totalAll = 0;
  const sortedDates = Object.keys(data).sort();
  for (const date of sortedDates) {
    const count = data[date];
    const row = document.createElement('tr');
    row.innerHTML = `<td>${date}</td><td>${count}</td>`;
    tableBody.appendChild(row);
    totalAll += count;
  }
  summary.textContent = `Total tweets (all types): ${totalAll}`;
}

chrome.runtime.sendMessage({ type: 'getTotals' }, res => {
  renderTable(res.totalsByDate || {});
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'totalsUpdated') renderTable(msg.totalsByDate);
});

exportBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'getTotals' }, res => {
    const data = res.totalsByDate || {};
    const rows = [['Date', 'Tweets']];
    Object.keys(data).sort().forEach(date => {
      rows.push([date, data[date]]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tweets_per_day.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
});

resetBtn.addEventListener('click', () => {
  if (!confirm('Reset all stored tweet data?')) return;
  chrome.runtime.sendMessage({ type: 'resetTotals' });
  renderTable({});
});