const wsUrl = 'wss://status.sipc-api.top';
let websocket = null;

function connectWebSocket() {
    websocket = new WebSocket(wsUrl);

    websocket.onopen = function () {
        console.log("Connected to WebSocket");
        requestServerStatus();
    };

    websocket.onclose = function () {
        console.log("WebSocket connection closed. Retrying...");
        setTimeout(connectWebSocket, 3000); // Retry every 3 seconds
    };

    websocket.onmessage = function (event) {
        displayServerStatus(JSON.parse(event.data));
    };
}

function requestServerStatus() {
    const servers = document.querySelectorAll('#server-list li');
    servers.forEach(server => {
        const host = server.dataset.host;
        const port = Number(server.dataset.port);
        const message = JSON.stringify({ host, port });
        if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(message);
        } else {
            console.log("WebSocket is not connected.");
        }
    });
}

function displayServerStatus(data) {
    const server = document.querySelector(`#server-list li[data-host="${data.host}"][data-port="${data.port}"]`);
    if (server) {
        if (data.online) {
            server.querySelector('.status').textContent = `${data.players.online}/${data.players.max}`;
            server.querySelector('.card-detail').innerHTML = `
            <div class="motd-container">${data.motd.html.replace(/\\/g, '')}</div>
        `;
        } else {
            server.querySelector('.status').textContent = `Disconnected`;
        }
    }
}


document.querySelectorAll('#server-list .card').forEach(card => {
    card.addEventListener('click', function () {
        const details = this.querySelector('.card-detail');
        if (details.style.height && details.style.height !== '0px') {
            details.style.height = '0px';
        } else {
            details.style.height = details.scrollHeight + 'px';
        }
    });
});

function updateTheme() {
    const theme = window.parent.localStorage.getItem('THEME_KEY') || 'dark';
    if (theme === 'dark') {
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
    }
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    updateTheme();
}

setInterval(requestServerStatus, 30000);
console.log(window.parent.localStorage.getItem('THEME_KEY'));
connectWebSocket();
toggleTheme()
