// Simple storage for user states (in real app, this would be on server)
let users = JSON.parse(localStorage.getItem('loginUsers') || '{}');

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');
    
    if (name.length < 2) {
        showMessage('Please enter a valid name with at least 2 characters.', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    // Simulate processing time
    setTimeout(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        // Check if user is currently logged in
        const isLoggedIn = users[name] && users[name].isActive;
        
        if (isLoggedIn) {
            // Log out the user
            users[name] = {
                ...users[name],
                isActive: false,
                logoutTime: now.toISOString(),
                lastAction: 'logout',
                lastActionTime: timeString
            };
            
            showMessage(`${name} logged out successfully at ${timeString}`, 'logout');
            updateUserStatus(name, false, 'logout', timeString);
        } else {
            // Log in the user
            users[name] = {
                name: name,
                isActive: true,
                loginTime: now.toISOString(),
                logoutTime: null,
                lastAction: 'login',
                lastActionTime: timeString
            };
            
            showMessage(`${name} logged in successfully at ${timeString}`, 'success');
            updateUserStatus(name, true, 'login', timeString);
        }
        
        // Save to localStorage
        localStorage.setItem('loginUsers', JSON.stringify(users));
        
        // Trigger dashboard update (if dashboard is open in another tab)
        localStorage.setItem('dashboardUpdate', Date.now().toString());
        
        nameInput.value = '';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login / Logout';
    }, 500);
});

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function updateUserStatus(name, isActive, action, time) {
    const statusElement = document.getElementById('userStatus');
    const lastActionElement = document.getElementById('lastAction');
    
    if (isActive) {
        statusElement.innerHTML = '<span class="online-indicator"></span>Online';
    } else {
        statusElement.innerHTML = '<span class="offline-indicator"></span>Offline';
    }
    
    lastActionElement.textContent = `${action} at ${time}`;
}

// Initialize status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's any stored user data to show
    const lastUser = Object.values(users).sort((a, b) => 
        new Date(b.loginTime || 0) - new Date(a.loginTime || 0)
    )[0];
    
    if (lastUser) {
        updateUserStatus(
            lastUser.name, 
            lastUser.isActive, 
            lastUser.lastAction, 
            lastUser.lastActionTime
        );
    }
});
