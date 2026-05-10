// --- 1. DATA INITIALIZATION ---
let users = JSON.parse(localStorage.getItem('app_users')) || [];
let allNotes = JSON.parse(localStorage.getItem('app_notes_secure')) || {}; 
let allEvents = JSON.parse(localStorage.getItem('app_events_secure')) || {}; 
let currentUser = null;

// --- 2. NAVIGATION & ACCESS ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    if(pageId === 'calendar') renderCalendar();
    if(pageId === 'settings') renderUserList();
    if(pageId === 'notes') renderNotes();
    if(pageId === 'events') renderEvents();
    
    if(pageId === 'home' && currentUser) {
        document.getElementById('home-welcome').innerText = `Welcome, ${currentUser.username}!`;
    }
}

function checkAccess(pageId) {
    if (!currentUser) {
        alert("Access Denied: Please log in to view this page.");
        showPage('settings');
    } else {
        showPage(pageId);
    }
}

// --- 3. AUTHENTICATION LOGIC ---
function handleAuth(type) {
    const userInp = document.getElementById('username');
    const passInp = document.getElementById('password');

    if (!userInp.value || !passInp.value) return alert("Fields cannot be empty.");

    if (type === 'signup') {
        if (users.find(u => u.username === userInp.value)) return alert("Username taken!");
        
        users.push({ username: userInp.value, password: passInp.value });
        localStorage.setItem('app_users', JSON.stringify(users));
        alert("Account created! Now please Log In.");
    } else {
        const found = users.find(u => u.username === userInp.value && u.password === passInp.value);
        if (found) {
            currentUser = found;
            updateAuthUI();
            showPage('home');
        } else {
            alert("Invalid credentials.");
        }
    }
    userInp.value = ''; passInp.value = '';
}

function logout() {
    currentUser = null;
    updateAuthUI();
    showPage('settings');
}

function updateAuthUI() {
    const outView = document.getElementById('logged-out-view');
    const inView = document.getElementById('logged-in-view');
    if (currentUser) {
        outView.style.display = 'none';
        inView.style.display = 'block';
        document.getElementById('welcome-user').innerText = `Hello, ${currentUser.username}!`;
        document.getElementById('notes-user-label').innerText = currentUser.username;
    } else {
        outView.style.display = 'block';
        inView.style.display = 'none';
    }
}

function renderUserList() {
    const list = document.getElementById('user-list');
    list.innerHTML = users.map(u => `<li>👤 ${u.username}</li>`).join('');
}

// --- 4. PRIVATE NOTES LOGIC ---
function renderNotes() {
    const list = document.getElementById('notes-list');
    if (!currentUser) return;
    const userNotes = allNotes[currentUser.username] || [];
    
    list.innerHTML = userNotes.map((note, index) => 
        `<div class="note-item">
            <span>${note}</span>
            <button class="delete-btn" onclick="deleteNote(${index})">Delete</button>
        </div>`
    ).join('');
}

function addNote() {
    const input = document.getElementById('note-input');
    if (!input.value.trim() || !currentUser) return;

    if (!allNotes[currentUser.username]) allNotes[currentUser.username] = [];
    
    allNotes[currentUser.username].push(input.value);
    localStorage.setItem('app_notes_secure', JSON.stringify(allNotes));
    input.value = '';
    renderNotes();
}

function deleteNote(index) {
    allNotes[currentUser.username].splice(index, 1);
    localStorage.setItem('app_notes_secure', JSON.stringify(allNotes));
    renderNotes();
}

// --- 5. EVENTS LOGIC ---
function renderEvents() {
    const list = document.getElementById('events-list');
    if (!list || !currentUser) return;
    const userEvents = allEvents[currentUser.username] || [];
    
    list.innerHTML = userEvents.map((ev, index) => 
        `<div class="note-item" style="border-left: 5px solid #4a90e2;">
            <div><strong>${ev.name}</strong><br><small>${ev.date}</small></div>
            <button class="delete-btn" onclick="deleteEvent(${index})">Delete</button>
        </div>`
    ).join('');
    
    if(document.getElementById('calendar').classList.contains('active')) renderCalendar();
}

function addEvent() {
    const nameInp = document.getElementById('event-name');
    const dateInp = document.getElementById('event-date');

    if (!nameInp.value || !dateInp.value || !currentUser) return alert("Fill all fields.");

    if (!allEvents[currentUser.username]) allEvents[currentUser.username] = [];
    
    allEvents[currentUser.username].push({ name: nameInp.value, date: dateInp.value });
    localStorage.setItem('app_events_secure', JSON.stringify(allEvents));
    
    nameInp.value = ''; dateInp.value = '';
    renderEvents();
}

function deleteEvent(index) {
    allEvents[currentUser.username].splice(index, 1);
    localStorage.setItem('app_events_secure', JSON.stringify(allEvents));
    renderEvents();
}

// --- 6. CALENDAR LOGIC ---
let currentDate = new Date();

function renderCalendar() {
    const grid = document.getElementById('calendar-days');
    const title = document.getElementById('month-title');
    if (!grid || !title) return;

    grid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    title.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

    const userEvents = (currentUser && allEvents[currentUser.username]) ? allEvents[currentUser.username] : [];

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        grid.innerHTML += `<div class="calendar-day" style="font-weight:bold; background:#eee;">${day}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayEvents = userEvents.filter(e => e.date === dateString);

        let eventHtml = dayEvents.map(e => 
            `<div style="font-size:0.7rem; background:#4a90e2; color:white; margin-top:2px; border-radius:2px; padding:1px 3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${e.name}
            </div>`
        ).join('');

        grid.innerHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}" style="min-height: 60px;">
                ${i}
                ${eventHtml}
            </div>`;
    }
}

function changeMonth(step) {
    currentDate.setMonth(currentDate.getMonth() + step);
    renderCalendar();
}

// Initialize UI on load
updateAuthUI();
