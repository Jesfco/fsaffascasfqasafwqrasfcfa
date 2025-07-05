document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = 'http://tacsimstudios.atwebpages.com/';

    let pluginsData = [];

    // Fetch plugins data from API and render
    async function loadPlugins() {
        try {
            const res = await fetch(`${API_BASE}data.php?type=plugins`);
            if (!res.ok) throw new Error('Network response was not ok');
            const plugins = await res.json();

            if (!Array.isArray(plugins) || plugins.length === 0) {
                document.getElementById('plugins-list').innerHTML = '<div style="color:#888;">No plugins available.</div>';
                return;
            }

            pluginsData = plugins;

            renderPluginsList();
        } catch (err) {
            console.error('Error fetching plugins:', err);
            document.getElementById('plugins-list').innerHTML = '<div style="color:#888;">Could not load plugins.</div>';
        }
    }

    // Render plugins dynamically
    function renderPluginsList() {
        const container = document.getElementById('plugins-list');
        if (!container) return;

        if (!Array.isArray(pluginsData) || pluginsData.length === 0) {
            container.innerHTML = '<div style="color:#888;">No plugins found. Add some plugins or check your data.</div>';
            return;
        }

        container.innerHTML = pluginsData.map((plugin, i) => {
            const tagsHtml = (plugin.tags || []).map(tag => `<span class="plugin-tag">${tag}</span>`).join('');
            const icon = plugin.icon || '🔌';
            const version = plugin.version ? `v${plugin.version}` : '';

            return `
                <div class="plugin-card" data-category="${plugin.category || 'Unknown'}">
                    <div class="plugin-header">
                        <div class="plugin-icon">${icon}</div>
                        <div>
                            <div class="plugin-title">${plugin.name || '<Unnamed>'}</div>
                        </div>
                        <div class="plugin-version">${version}</div>
                    </div>
                    <p class="plugin-description">${plugin.description || ''}</p>
                    <div class="plugin-tags">${tagsHtml}</div>
                    <div class="plugin-actions">
                        <a href="${plugin.lcpdfrUrl || '#'}" class="plugin-button secondary" target="_blank" rel="noopener noreferrer">LCPDFR.com</a>
                        <a href="${plugin.downloadUrl || '#'}" class="plugin-button" target="_blank" rel="noopener noreferrer">Download</a>
                    </div>
                </div>
            `;
        }).join('');

        // Setup filtering
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.onclick = function () {
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const filter = this.getAttribute('data-filter');
                document.querySelectorAll('.plugin-card').forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            };
        });

        // Trigger the active filter on first render
        const activeTab = document.querySelector('.filter-tab.active');
        if (activeTab) activeTab.click();
    }

    // Initialize
    loadPlugins();
});
