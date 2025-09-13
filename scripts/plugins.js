document.addEventListener('DOMContentLoaded', function () {
    let pluginsData = [];
    const pluginsList = document.getElementById('plugins-list');

    async function loadPlugins() {
        try {
            const res = await fetch('data/content/plugins.json', {
                cache: 'force-cache'
            });
            if (!res.ok) throw new Error('Network response was not ok');
            const plugins = await res.json();

            if (!Array.isArray(plugins) || plugins.length === 0) {
                pluginsList.innerHTML = '<div class="error-message">No plugins available.</div>';
                return;
            }

            pluginsData = plugins;
            renderPluginsList();
        } catch (err) {
            pluginsList.innerHTML = '<div class="error-message">Could not load plugins. Please try again later.</div>';
        }
    }

    function renderPluginsList() {
        if (!Array.isArray(pluginsData) || pluginsData.length === 0) {
            pluginsList.innerHTML = '<div style="color:#888;">No plugins found. Add some plugins or check your data.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();
        
        pluginsData.forEach(plugin => {
            const card = document.createElement('div');
            card.className = 'plugin-card';
            card.setAttribute('data-category', plugin.category || 'Unknown');
            
            const tagsHtml = (plugin.tags || []).map(tag => `<span class="plugin-tag">${tag}</span>`).join('');
            const icon = plugin.icon || '🔌';
            const version = plugin.version ? `v${plugin.version}` : '';

            card.innerHTML = `
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
            `;
            fragment.appendChild(card);
        });

        pluginsList.innerHTML = '';
        pluginsList.appendChild(fragment);
        setupFiltering();
    }

    function setupFiltering() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        const pluginCards = document.querySelectorAll('.plugin-card');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const filter = this.getAttribute('data-filter');
                
                pluginCards.forEach(card => {
                    const shouldShow = filter === 'all' || card.getAttribute('data-category') === filter;
                    card.style.display = shouldShow ? '' : 'none';
                });
            });
        });

        const activeTab = document.querySelector('.filter-tab.active');
        if (activeTab) activeTab.click();
    }

    loadPlugins();
});
