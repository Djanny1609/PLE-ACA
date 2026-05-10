// --- 1. DATA INITIALIZATION ---
let users = JSON.parse(localStorage.getItem('app_users')) || [];
let allNotes = JSON.parse(localStorage.getItem('app_notes_secure')) || {}; 
let currentUser = null;

// --- 2. NAVIGATION & ACCESS ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    if(pageId === 'calendar') renderCalendar();
    if(pageId === 'settings') renderUserList();
    if(pageId === 'notes') renderNotes();
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

// --- 5. CALENDAR LOGIC ---
let currentDate = new Date();
function renderCalendar() {
    const grid = document.getElementById('calendar-days');
    const title = document.getElementById('month-title');
    grid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    title.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        grid.innerHTML += `<div class="calendar-day" style="font-weight:bold; background:#eee;">${day}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        grid.innerHTML += `<div class="calendar-day ${isToday ? 'today' : ''}">${i}</div>`;
    }
}
function changeMonth(step) {
    currentDate.setMonth(currentDate.getMonth() + step);
    renderCalendar();
}
