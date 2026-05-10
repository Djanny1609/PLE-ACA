// 1. NAVIGATION LOGIC
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(pageId === 'calendar') renderCalendar();
}

// 2. NOTE TAKER LOGIC
let notes = JSON.parse(localStorage.getItem('my_notes')) || [];

function renderNotes() {
    const list = document.getElementById('notes-list');
    if(!list) return;
    list.innerHTML = '';
    notes.forEach((note, index) => {
        const div = document.createElement('div');
        div.className = 'note-item';
        div.innerHTML = `<span>${note}</span> <button class="delete-btn" onclick="deleteNote(${index})">Delete</button>`;
        list.appendChild(div);
    });
}

function addNote() {
    const input = document.getElementById('note-input');
    if (input.value.trim() === '') return;
    notes.push(input.value);
    localStorage.setItem('my_notes', JSON.stringify(notes));
    input.value = '';
    renderNotes();
}

function deleteNote(index) {
    notes.splice(index, 1);
    localStorage.setItem('my_notes', JSON.stringify(notes));
    renderNotes();
}

// 3. CALENDAR LOGIC
let currentDate = new Date();

function renderCalendar() {
    const grid = document.getElementById('calendar-days');
    const title = document.getElementById('month-title');
    if(!grid) return;
    grid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    title.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const div = document.createElement('div');
        div.className = 'calendar-day day-header';
        div.innerText = day;
        grid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            div.classList.add('today');
        }
        div.innerText = i;
        grid.appendChild(div);
    }
}

function changeMonth(step) {
    currentDate.setMonth(currentDate.getMonth() + step);
    renderCalendar();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderNotes();
});
