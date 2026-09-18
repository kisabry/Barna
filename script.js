const journalBody = document.querySelector('#journal-body');
const currentDate = document.querySelector('#current-date');
const viewSwitcher = document.querySelector('#view-switcher');
const viewMenu = document.querySelector('#view-menu');
const journalView = document.querySelector('.journal-wrap');
const calendarView = document.querySelector('#calendar-view');
const otherView = document.querySelector('#other-view');
const storageKey = 'daybook-entries';

const initialEntries = [
  { date: '09.17', day: 'CSÜTÖRTÖK', mood: 'Fókuszált', moodClass: '', focus: 'A fontos dolgokra figyelni', note: 'Ma kevesebbet akarok egyszerre, de azt teljes figyelemmel.', energy: 4 },
  { date: '09.16', day: 'SZERDA', mood: 'Nyugodt', moodClass: 'calm', focus: 'Lassítani a tempón', note: 'Egy jó séta többet adott, mint egy újabb lista.', energy: 3 },
  { date: '09.15', day: 'KEDD', mood: 'Fáradt', moodClass: 'tired', focus: 'Csak a következő lépés', note: 'Nem kell ma minden választ megtalálni.', energy: 2 }
];

let entries = JSON.parse(localStorage.getItem(storageKey) || 'null') || initialEntries;

function renderEntries() {
  journalBody.innerHTML = entries.map((entry, index) => `
    <div class="journal-row table-grid" data-index="${index}">
      <span class="row-id">${String(index + 1).padStart(2, '0')}</span>
      <div class="cell-date"><strong>${entry.date}</strong><small>${entry.day}</small></div>
      <div class="mood"><i class="mood-dot ${entry.moodClass}"></i><div class="editable" contenteditable="true" data-field="mood">${entry.mood}</div></div>
      <div class="editable" contenteditable="true" data-field="focus">${entry.focus}</div>
      <div class="cell-copy"><div class="editable" contenteditable="true" data-field="note">${entry.note}</div><small>szabad jegyzet</small></div>
      <div class="energy" aria-label="${entry.energy} / 5 energia">${[1, 2, 3, 4, 5].map((level) => `<i class="${level <= entry.energy ? 'active' : ''}"></i>`).join('')}</div>
      <div class="row-actions"><button class="delete-row" type="button" aria-label="Sor törlése">×</button></div>
    </div>`).join('');
}

function saveEntries() {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function addEntry() {
  entries.unshift({ date: 'ÚJ', day: 'MA', mood: 'Hogyan vagyok?', moodClass: '', focus: 'Mi a mai fókusz?', note: 'Írj pár sort...', energy: 0 });
  saveEntries();
  renderEntries();
}

journalBody.addEventListener('input', (event) => {
  const cell = event.target.closest('[data-field]');
  const row = event.target.closest('.journal-row');
  if (!cell || !row) return;
  entries[Number(row.dataset.index)][cell.dataset.field] = cell.textContent;
  clearTimeout(window.saveTimer);
  window.saveTimer = setTimeout(saveEntries, 600);
});

journalBody.addEventListener('click', (event) => {
  if (!event.target.closest('.delete-row')) return;
  entries.splice(Number(event.target.closest('.journal-row').dataset.index), 1);
  saveEntries();
  renderEntries();
});

document.querySelector('#add-entry').addEventListener('click', addEntry);
document.querySelector('#add-row').addEventListener('click', addEntry);
viewSwitcher.addEventListener('click', () => {
  const isOpen = viewMenu.classList.toggle('open');
  viewSwitcher.setAttribute('aria-expanded', String(isOpen));
});
viewMenu.addEventListener('click', (event) => {
  const addTab = event.target.closest('[data-add-tab]');
  if (addTab) {
    const tabName = window.prompt('Az új fül neve:');
    if (!tabName || !tabName.trim()) return;
    const cleanName = tabName.trim();
    const tabId = `custom-${Date.now()}`;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.setAttribute('role', 'menuitem');
    tab.dataset.view = tabId;
    tab.textContent = cleanName;
    viewMenu.insertBefore(tab, addTab);
    const customView = document.createElement('section');
    customView.className = 'empty-view';
    customView.id = `${tabId}-view`;
    customView.hidden = true;
    customView.innerHTML = `<strong></strong><span>Ez az új nézet később feltölthető.</span>`;
    customView.querySelector('strong').textContent = cleanName;
    document.querySelector('.app-shell').appendChild(customView);
    tab.click();
    return;
  }
  const option = event.target.closest('[data-view]');
  if (!option) return;
  const selectedView = option.dataset.view;
  document.querySelectorAll('[data-view]').forEach((item) => item.classList.toggle('active', item === option));
  journalView.hidden = selectedView !== 'journal';
  calendarView.hidden = selectedView !== 'calendar';
  otherView.hidden = selectedView !== 'other';
  document.querySelectorAll('.empty-view[id$="-view"]').forEach((view) => {
    if (view !== calendarView && view !== otherView) view.hidden = view.id !== `${selectedView}-view`;
  });
  viewSwitcher.querySelector('strong').textContent = option.firstChild.textContent.trim();
  viewMenu.classList.remove('open');
  viewSwitcher.setAttribute('aria-expanded', 'false');
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.journaling-label') && !event.target.closest('.view-menu')) {
    viewMenu.classList.remove('open');
    viewSwitcher.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveEntries(); }
});

currentDate.textContent = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
renderEntries();
