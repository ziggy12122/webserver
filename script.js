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

    // Check connection periodically
    setInterval(checkConnection, 2000);
    checkConnection();
});

let isConnected = false;

async function checkConnection() {
    try {
        const response = await fetch('/api/status');
        if (response.ok) {
            const data = await response.json();
            document.getElementById('connection-status').innerText = "Connected";
            document.getElementById('connection-status').classList.add('connected');
            isConnected = true;
            
            // Sync settings if just connected
            // In a real app we would sync all settings here
        }
    } catch (e) {
        document.getElementById('connection-status').innerText = "Disconnected";
        document.getElementById('connection-status').classList.remove('connected');
        isConnected = false;
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
