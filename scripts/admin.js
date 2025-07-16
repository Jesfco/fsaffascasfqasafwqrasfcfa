let pluginsData = [];
let newsData = [];
let selectedPlugin = null;
let selectedNews = null;

// Use Vercel proxy - this will route to your PHP backend
const API_BASE = '/api/';

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        console.error('No token found in localStorage');
        return { 'Content-Type': 'application/json' };
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}


// Improved authenticated request function
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('admin_token');
    const expiry = localStorage.getItem('token_expiry');
    console.log(`Token: ${token}, Expiry: ${expiry}`); // Debug log
    
    // Client-side expiry check first
    if (!token || !expiry || Date.now() > expiry * 1000) {
        console.warn('Deleted or expired token, redirecting to login');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token_expiry');
        alert('Session expired. Please log in again.');
        window.location.reload();
        throw new Error('!Session expired');
    }

    try {
        console.log(`Making request to ${url} with options:`, options, token,); // Debug log
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        if (response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('token_expiry');
            throw new Error('Session expired');
        }

        return response;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

// ... (keep all your existing variable declarations)
async function savePlugins() {
    try {
        console.group('Debugging Save Request');
        
        // Verify token exists
        const token = localStorage.getItem('admin_token');
        const expiry = localStorage.getItem('token_expiry');
        console.log('Token:', token ? `${token.substring(0, 8)}...` : 'MISSING');
        console.log('Expiry:', expiry ? new Date(parseInt(expiry)).toString() : 'MISSING');
        
        // Make the request
        console.log('Sending data...');
        const response = await fetch(API_BASE + 'save_plugins.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pluginsData),
            credentials: 'include'
        });
        
        // Get response text first
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        try {
            // Try to parse as JSON
            const data = JSON.parse(responseText);
            console.log('Parsed response:', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            console.log('Save successful!');
            return data;
        } catch (e) {
            console.error('Failed to parse response as JSON');
            throw new Error(`Invalid response: ${responseText.substring(0, 100)}`);
        }
        
    } catch (error) {
        console.error('Save failed:', error);
        throw error;
    } finally {
        console.groupEnd();
    }
}

// Run the debug


// Updated save functions
document.getElementById('save-plugins-btn').onclick = () => savePlugins().catch(console.error);
// async function() {
   /* try {
        const res = await makeAuthenticatedRequest(`${API_BASE}save_plugins.php`, {
            method: 'POST',
            body: JSON.stringify(pluginsData)
        });
        
        const result = await res.json();
        if (result.success) {
            alert('plugins.json saved successfully!');
        } else {
            alert('Failed to save plugins.json: ' + (result.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Save plugins error:', err);
        alert('Error saving plugins: ' + err.message);
    }
};

document.getElementById('save-news-btn').onclick = async function() {
    try {
        const res = await makeAuthenticatedRequest(`${API_BASE}save_news.php`, {
            method: 'POST',
            body: JSON.stringify(newsData)
        });
        
        const result = await res.json();
        if (result.success) {
            alert('news.json saved successfully!');
        } else {
            alert('Failed to save news.json: ' + (result.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Save news error:', err);
        alert('Error saving news: ' + err.message);
    }
};
*/
// Updated login function
async function adminLogin() {
    const password = document.getElementById('admin-password').value;
    try {
        const res = await fetch(`${API_BASE}login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            credentials: 'include'
        });
        
        const data = await res.json();
        console.log('Login response:', data); // Debug log
        
        if (data.success) {
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('token_expiry', data.expires * 1000);
            console.log('Stored token until:', new Date(data.expires));
            document.getElementById('admin-login').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
             if (!token || !expiry) {
        throw new Error('Missing authentication data');
    }
            loadAdminData();

        } else {
            document.getElementById('login-error').textContent = data.error || "Incorrect password.";
        }
    } catch (err) {
        console.error('Login error:', err);
        document.getElementById('login-error').textContent = "Login failed. Please try again.";
    }
}
// Updated checkAdminLogin function
async function checkAdminLogin() {
    const token = localStorage.getItem('admin_token');
    console.log('Stored token at startup:', token); // Debug log
    
    if (!token) return;
    
    try {
        const res = await makeAuthenticatedRequest(`${API_BASE}data.php?type=plugins`, {
            method: 'GET'
        });
        
        if (res.ok) {
            document.getElementById('admin-login').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
            loadAdminData();
        }
    } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('admin_token');
    }
}   

// ... (keep the rest of your existing code)

document.addEventListener('DOMContentLoaded', function () {
    checkAdminLogin();
    
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.onclick = async function () {
            const pw = document.getElementById('admin-password').value;
            const res = await fetch(API_BASE + 'login.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({password: pw})
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('admin_token', data.token);
                 localStorage.setItem('token_expiry', data.expires);
                 console.log('Stored token until:', new Date(data.expires * 1000));
                document.getElementById('admin-login').classList.add('hidden');
                document.getElementById('admin-panel').classList.remove('hidden');
                loadAdminData();
            } else {
                document.getElementById('login-error').textContent = data.error || "Incorrect password.";
            }
        };
    }

    // Sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function () {
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const section = this.getAttribute('data-section');
            document.getElementById('plugins-section').classList.toggle('hidden', section !== 'plugins');
            document.getElementById('news-section').classList.toggle('hidden', section !== 'news');
        });
    });

    // JSON Editor modal
    document.getElementById('open-json-editor').onclick = function () {
        document.getElementById('json-editor-modal').classList.remove('hidden');
        document.getElementById('json-file-select').value = 'plugins';
        document.getElementById('json-editor-area').value = JSON.stringify(pluginsData, null, 2);
    };
    document.getElementById('close-json-btn').onclick = function () {
        document.getElementById('json-editor-modal').classList.add('hidden');
    };
    document.getElementById('json-file-select').onchange = function () {
        const val = this.value;
        document.getElementById('json-editor-area').value = val === 'plugins'
            ? JSON.stringify(pluginsData, null, 2)
            : JSON.stringify(newsData, null, 2);
    };
    document.getElementById('save-json-btn').onclick = function () {
        try {
            const val = document.getElementById('json-file-select').value;
            const parsed = JSON.parse(document.getElementById('json-editor-area').value);
            if (val === 'plugins') {
                pluginsData = parsed;
                renderPluginsList();
                renderPluginEditor(null);
            } else {
                newsData = parsed;
                renderNewsList();
                renderNewsEditor(null);
            }
            document.getElementById('json-editor-modal').classList.add('hidden');
        } catch (e) {
            alert("Invalid JSON.");
        }
    };

    // Add Plugin/News
    document.getElementById('add-plugin-btn').onclick = function () {
        renderPluginEditor({ name: "", version: "", category: "Callout", description: "", tags: [], downloadUrl: "", lcpdfrUrl: "", icon: "" }, true);
    };
    document.getElementById('add-news-btn').onclick = function () {
        renderNewsEditor({ date: "", title: "", author: "", category: "", excerpt: "", tags: [] }, true);
    };

    // Save buttons with consistent token authentication
    document.getElementById('save-plugins-btn').onclick = async function () {
        try {
            const res = await makeAuthenticatedRequest(API_BASE + 'save_plugins.php', {
                method: 'POST',
                body: JSON.stringify(pluginsData)
            });
            const result = await res.json();
            if (result.success) {
                alert('plugins.json saved!');
            } else {
                alert('Failed to save plugins.json: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Save plugins error:', err);
            alert('Authentication required. Please log in first.');
        }
    };
    
    document.getElementById('save-news-btn').onclick = async function () {
        try {
            const res = await makeAuthenticatedRequest(API_BASE + 'save_news.php', {
                method: 'POST',
                body: JSON.stringify(newsData)
            });
            const result = await res.json();
            if (result.success) {
                alert('news.json saved!');
            } else {
                alert('Failed to save news.json: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Save news error:', err);
            alert('Authentication required. Please log in first.');
        }
    };

    // Upload Plugins
    document.getElementById('upload-plugins-btn').onclick = function () {
        document.getElementById('upload-plugins-input').click();
    };
    document.getElementById('upload-plugins-input').onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                pluginsData = JSON.parse(evt.target.result);
                renderPluginsList();
                renderPluginEditor(null);
            } catch (err) {
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    };

    // Upload News
    document.getElementById('upload-news-btn').onclick = function () {
        document.getElementById('upload-news-input').click();
    };
    document.getElementById('upload-news-input').onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                newsData = JSON.parse(evt.target.result);
                renderNewsList();
                renderNewsEditor(null);
            } catch (err) {
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    };
});

// FIXED: Load data from API with debugging
async function loadAdminData() {
    console.log('Loading admin data...');
    
    try {
        // Load plugins from API - NO AUTHENTICATION for GET requests
        const pluginsRes = await fetch(API_BASE + 'data.php?type=plugins', {
            method: 'GET'
        });
        
       console.log('Plugins response status:', pluginsRes.status);
        
        if (pluginsRes.ok) {
            const pluginsText = await pluginsRes.text();
           // console.log('Raw plugins response:', pluginsText);
            
            try {
                const pluginsData_response = JSON.parse(pluginsText);
               // console.log('Parsed plugins data:', pluginsData_response);
                pluginsData = Array.isArray(pluginsData_response) ? pluginsData_response : [];
            } catch (parseError) {
                console.error('Failed to parse plugins JSON:', parseError);
                pluginsData = [];
            }
        } else {
            console.error('Failed to load plugins, status:', pluginsRes.status);
            pluginsData = [];
        }
        
        renderPluginsList();
        renderPluginEditor(null);
    } catch (err) {
        console.error('Failed to load plugins:', err);
        pluginsData = [];
        renderPluginsList();
        renderPluginEditor(null);
    }
    
    try {
        // Load news from API - NO AUTHENTICATION for GET requests
        const newsRes = await fetch(API_BASE + 'data.php?type=news', {
            method: 'GET'
        });
        
        console.log('News response status:', newsRes.status);
        
        if (newsRes.ok) {
            const newsText = await newsRes.text();
          //  console.log('Raw news response:', newsText);
            
            try {
                const newsData_response = JSON.parse(newsText);
                console.log('Parsed news data:', newsData_response);
                newsData = Array.isArray(newsData_response) ? newsData_response : [];
            } catch (parseError) {
                console.error('Failed to parse news JSON:', parseError);
                newsData = [];
            }
        } else {
            console.error('Failed to load news, status:', newsRes.status);
            newsData = [];
        }
        
        renderNewsList();
        renderNewsEditor(null);
    } catch (err) {
        console.error('Failed to load news:', err);
        newsData = [];
        renderNewsList();
        renderNewsEditor(null);
    }
}

// --- Plugins UI with debugging ---
function renderPluginsList() {
    console.log('Rendering plugins list with data:', pluginsData);
    const el = document.getElementById('plugins-list');
    if (!el) {
        console.error('plugins-list element not found');
        return;
    }
    
    if (!Array.isArray(pluginsData) || pluginsData.length === 0) {
        console.log('No plugins data available');
        el.innerHTML = '<div style="color:#888;">No plugins found. Add some plugins or check your data.</div>';
        return;
    }
    
    el.innerHTML = pluginsData.map((p, i) => {
        console.log(`Plugin ${i}:`, p);
        return `
            <div class="admin-list-item${selectedPlugin === i ? ' selected' : ''}" data-index="${i}">
                <span>${p.icon || "🔌"} ${p.name || "<Unnamed>"}</span>
            </div>
        `;
    }).join('');
    
    el.querySelectorAll('.admin-list-item').forEach(item => {
        item.onclick = function() {
            const idx = parseInt(this.getAttribute('data-index'));
            selectedPlugin = idx;
            renderPluginsList();
            renderPluginEditor(pluginsData[idx]);
        };
    });
}

function renderPluginEditor(plugin, isNew) {
    const el = document.getElementById('plugin-editor');
    if (!el) return;
    if (!plugin) {
        el.innerHTML = '<div style="color:#888;">Select a plugin to edit.</div>';
        return;
    }
    el.innerHTML = `
        <label>Name: <input type="text" id="plugin-name-edit" value="${plugin.name || ""}"></label>
        <label>Version: <input type="text" id="plugin-version" value="${plugin.version || ""}"></label>
        <label>Category: 
            <select id="plugin-category">
                <option${plugin.category === 'Callout' ? ' selected' : ''}>Callout</option>
                <option${plugin.category === 'Script' ? ' selected' : ''}>Script</option>
            </select>
        </label>
        <label>Description: <textarea id="plugin-description">${plugin.description || ""}</textarea></label>
        <label>Tags (comma separated): <input type="text" id="plugin-tags" value="${plugin.tags ? plugin.tags.join(', ') : ""}"></label>
        <label>Download URL: <input type="text" id="plugin-downloadUrl" value="${plugin.downloadUrl || ""}"></label>
        <label>LCPDFR URL: <input type="text" id="plugin-lcpdfrUrl" value="${plugin.lcpdfrUrl || ""}"></label>
        <label>Icon: <input type="text" id="plugin-icon" value="${plugin.icon || ""}"></label>
        <div style="margin-top:12px;">
            ${!isNew ? `<button class="delete" id="delete-plugin-btn">Delete</button>` : ""}
            <button class="save-btn" id="save-plugin-btn">${isNew ? "Add" : "Save"}</button>
            ${isNew ? `<button class="cancel-btn" id="cancel-plugin-btn">Cancel</button>` : ""}
        </div>
    `;
    document.getElementById('save-plugin-btn').onclick = function () {
        const obj = {
            name: document.getElementById('plugin-name-edit').value,
            version: document.getElementById('plugin-version').value,
            category: document.getElementById('plugin-category').value,
            description: document.getElementById('plugin-description').value,
            tags: document.getElementById('plugin-tags').value.split(',').map(t => t.trim()).filter(Boolean),
            downloadUrl: document.getElementById('plugin-downloadUrl').value,
            lcpdfrUrl: document.getElementById('plugin-lcpdfrUrl').value,
            icon: document.getElementById('plugin-icon').value
        };
        if (isNew) {
            pluginsData.push(obj);
            selectedPlugin = pluginsData.length - 1;
        } else if (selectedPlugin !== null) {
            pluginsData[selectedPlugin] = obj;
        }
        renderPluginsList();
        renderPluginEditor(obj);
    };
    if (!isNew && document.getElementById('delete-plugin-btn')) {
        document.getElementById('delete-plugin-btn').onclick = function () {
            if (confirm('Delete this plugin?')) {
                pluginsData.splice(selectedPlugin, 1);
                selectedPlugin = null;
                renderPluginsList();
                renderPluginEditor(null);
            }
        };
    }
    if (isNew && document.getElementById('cancel-plugin-btn')) {
        document.getElementById('cancel-plugin-btn').onclick = function () {
            renderPluginEditor(null);
        };
    }
}

function renderNewsList() {
    console.log('Rendering news list with data:', newsData);
    const el = document.getElementById('news-list');
    if (!el) {
        console.error('news-list element not found');
        return;
    }
    
    if (!Array.isArray(newsData) || newsData.length === 0) {
        console.log('No news data available');
        el.innerHTML = '<div style="color:#888;">No news found. Add some news or check your data.</div>';
        return;
    }
    
    el.innerHTML = newsData.map((n, i) => `
        <div class="admin-list-item${selectedNews === i ? ' selected' : ''}" data-index="${i}">
            <span>📰 ${n.title || "<Untitled>"}</span>
        </div>
    `).join('');
    
    el.querySelectorAll('.admin-list-item').forEach(item => {
        item.onclick = function() {
            const idx = parseInt(this.getAttribute('data-index'));
            selectedNews = idx;
            renderNewsList();
            renderNewsEditor(newsData[idx]);
        };
    });
}

function renderNewsEditor(news, isNew) {
    const el = document.getElementById('news-editor');
    if (!el) return;
    if (!news) {
        el.innerHTML = '<div style="color:#888;">Select a news item to edit.</div>';
        return;
    }
    el.innerHTML = `
        <label>Date: <input type="text" id="news-date" value="${news.date || ""}"></label>
        <label>Title: <input type="text" id="news-title-edit" value="${news.title || ""}"></label>
        <label>Author: <input type="text" id="news-author" value="${news.author || ""}"></label>
        <label>Category: <input type="text" id="news-category" value="${news.category || ""}"></label>
        <label>Excerpt: <textarea id="news-excerpt">${news.excerpt || ""}</textarea></label>
        <label>Tags (comma separated): <input type="text" id="news-tags" value="${news.tags ? news.tags.join(', ') : ""}"></label>
        <div style="margin-top:12px;">
            ${!isNew ? `<button class="delete" id="delete-news-btn">Delete</button>` : ""}
            <button class="save-btn" id="save-news-btn-edit">${isNew ? "Add" : "Save"}</button>
            ${isNew ? `<button class="cancel-btn" id="cancel-news-btn">Cancel</button>` : ""}
        </div>
    `;
    document.getElementById('save-news-btn-edit').onclick = function () {
        const obj = {
            date: document.getElementById('news-date').value,
            title: document.getElementById('news-title-edit').value,
            author: document.getElementById('news-author').value,
            category: document.getElementById('news-category').value,
            excerpt: document.getElementById('news-excerpt').value,
            tags: document.getElementById('news-tags').value.split(',').map(t => t.trim()).filter(Boolean)
        };
        if (isNew) {
            newsData.push(obj);
            selectedNews = newsData.length - 1;
        } else if (selectedNews !== null) {
            newsData[selectedNews] = obj;
        }
        renderNewsList();
        renderNewsEditor(obj);
    };
    if (!isNew && document.getElementById('delete-news-btn')) {
        document.getElementById('delete-news-btn').onclick = function () {
            if (confirm('Delete this news item?')) {
                newsData.splice(selectedNews, 1);
                selectedNews = null;
                renderNewsList();
                renderNewsEditor(null);
            }
        };
    }
    if (isNew && document.getElementById('cancel-news-btn')) {
        document.getElementById('cancel-news-btn').onclick = function () {
            renderNewsEditor(null);
        };
    }
} 