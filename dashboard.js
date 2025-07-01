let users = {};

function getRandomColor(name) {
    const colors = [
        '#667eea', '#764ba2', '#28a745', '#17a2b8', 
        '#ffc107', '#fd7e14', '#e83e8c', '#6f42c1'
    ];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

function getInitials(name) {
    return name.split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const loginDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const timeString = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    if (loginDate.getTime() === today.getTime()) {
        return `Today, ${timeString}`;
    } else {
        return `${date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        })}, ${timeString}`;
    }
}

function calculateDuration(loginTime, logoutTime = null) {
    const start = new Date(loginTime);
    const end = logoutTime ? new Date(logoutTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
        return `${diffHours}h ${remainingMins}m`;
    }
    return `${diffMins}m`;
}

function updateStats() {
    const userArray = Object.values(users);
    
    // Count today's logins
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogins = userArray.filter(user => 
        new Date(user.loginTime) >= today
    ).length;
    
    // Count active users
    const activeUsers = userArray.filter(user => user.isActive).length;
    
    // Get last login time
    const lastLogin = userArray
        .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))[0];
    
    document.getElementById('totalLogins').textContent = todayLogins;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('lastLoginTime').textContent = 
        lastLogin ? formatTime(lastLogin.loginTime).replace('Today, ', '') : 'Never';
}

function updateTable() {
    const tableContent = document.getElementById('tableContent');
    const userArray = Object.values(users)
        .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
    
    if (userArray.length === 0) {
        tableContent.innerHTML = `
            <div class="empty-state">
                <div class="icon">👋</div>
                <h3>No login activity yet</h3>
                <p>Users will appear here when they log in through the login page.</p>
            </div>
        `;
        return;
    }
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Login Time</th>
                    <th>Status</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    userArray.forEach(user => {
        const avatarColor = getRandomColor(user.name);
        const initials = getInitials(user.name);
        const loginTime = formatTime(user.loginTime);
        const duration = calculateDuration(user.loginTime, user.logoutTime);
        
        tableHTML += `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-avatar" style="background: ${avatarColor}">
                            ${initials}
                        </div>
                        <div class="user-name">${user.name}</div>
                    </div>
                </td>
                <td>
                    <div class="time-info">
                        ${loginTime}
                        ${user.logoutTime ? `<div class="logout-time">Logged out: ${formatTime(user.logoutTime)}</div>` : ''}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${user.isActive ? 'online' : 'offline'}">
                        <span class="status-indicator ${user.isActive ? 'online' : 'offline'}"></span>
                        ${user.isActive ? 'Online' : 'Offline'}
                    </span>
                </td>
                <td>${duration}</td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    tableContent.innerHTML = tableHTML;
}

function loadData() {
    users = JSON.parse(localStorage.getItem('loginUsers') || '{}');
    updateStats();
    updateTable();
}

function refreshData() {
    loadData();
    
    // Show visual feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '🔄 Refreshing...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 500);
}

// Listen for storage changes (when login page updates data)
window.addEventListener('storage', function(e) {
    if (e.key === 'dashboardUpdate' || e.key === 'loginUsers') {
        loadData();
    }
});

// Auto-refresh every 5 seconds
setInterval(loadData, 5000);

// Initial load
document.addEventListener('DOMContentLoaded', loadData);
