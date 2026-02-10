document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Load saved IP
    const savedIP = localStorage.getItem('serverIP');
    if (savedIP) {
        document.getElementById('server-ip').value = savedIP;
    }

    // Auto-Search / Check connection
    // We try localhost first, then saved IP
    if (!savedIP && window.location.hostname !== 'localhost') {
        // If hosted remotely and no IP saved, default to localhost for PC users
        document.getElementById('server-ip').value = 'localhost';
    }
    
    setInterval(checkConnection, 2000);
    checkConnection();
});

let isConnected = false;
let autoSearching = true;

function getApiUrl(endpoint) {
    const ip = document.getElementById('server-ip').value || 'localhost';
    localStorage.setItem('serverIP', ip);
    // Determine protocol: if ip is localhost, use http
    return `http://${ip}:8080${endpoint}`;
}

async function checkConnection() {
    try {
        const response = await fetch(getApiUrl('/api/status'));
        if (response.ok) {
            const data = await response.json();
            document.getElementById('connection-status').innerText = "Connected";
            document.getElementById('connection-status').classList.add('connected');
            isConnected = true;
        }
    } catch (e) {
        document.getElementById('connection-status').innerText = "Disconnected";
        document.getElementById('connection-status').classList.remove('connected');
        isConnected = false;
        
        // Auto-Search Logic for local users
        if (autoSearching && document.getElementById('server-ip').value !== 'localhost') {
            console.log("Connection failed, trying localhost...");
            document.getElementById('server-ip').value = 'localhost';
            autoSearching = false; // Only try once to avoid loop
            checkConnection();
        }
    }
}

async function updateSetting(section, key, value) {
    if (!isConnected) return;

    // Convert boolean to 1/0
    const valToSend = (typeof value === 'boolean') ? (value ? 1 : 0) : value;

    try {
        await fetch(getApiUrl('/api/set'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `section=${section}&key=${key}&value=${valToSend}`
        });
    } catch (e) {
        console.error("Failed to update setting", e);
    }
}
