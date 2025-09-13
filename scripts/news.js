document.addEventListener('DOMContentLoaded', function () {
    const featured = document.getElementById('featured-news');
    const container = document.getElementById('news-list');
    
    async function loadNews() {
        try {
            const res = await fetch('data/content/news.json', {
                cache: 'force-cache'
            });
            if (!res.ok) throw new Error('Network response was not ok');
            const news = await res.json();
            
            if (!news || news.length === 0) {
                if (featured) featured.innerHTML = "";
                if (container) container.innerHTML = "<p>No news available.</p>";
                return;
            }
            
            news.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (featured && news.length > 0) {
                const top = news[0];
                const featuredArticle = document.createElement('article');
                featuredArticle.className = 'featured-article';
                featuredArticle.innerHTML = `
                    <span class="featured-badge">BREAKING</span>
                    <h2 class="featured-title">${top.title}</h2>
                    <div class="featured-meta">
                        ${top.date ? `<span>📅 ${top.date}</span>` : ""}
                        ${top.author ? `<span>👤 ${top.author}</span>` : ""}
                        ${top.tags && top.tags.length ? `<span>🏷️ ${top.tags.join(', ')}</span>` : ""}
                    </div>
                    <p class="featured-excerpt">${top.excerpt || top.content || ""}</p>
                `;
                featured.innerHTML = '';
                featured.appendChild(featuredArticle);
            }

            if (container && news.length > 1) {
                const fragment = document.createDocumentFragment();
                const rest = news.slice(1);
                
                rest.forEach(item => {
                    const article = document.createElement('article');
                    article.className = 'news-card';
                    article.innerHTML = `
                        ${item.category ? `<span class="news-category ${item.category}">${item.category.toUpperCase()}</span>` : ""}
                        <h3 class="news-title">${item.title}</h3>
                        <div class="news-meta">
                            ${item.date ? `<span>📅 ${item.date}</span>` : ""}
                            ${item.author ? `<span>👤 ${item.author}</span>` : ""}
                            ${item.tags && item.tags.length ? `<span>🏷️ ${item.tags.join(', ')}</span>` : ""}
                        </div>
                        <p class="news-excerpt">${item.excerpt || item.content || ""}</p>
                    `;
                    fragment.appendChild(article);
                });
                
                container.innerHTML = '';
                container.appendChild(fragment);
            }
        } catch (err) {
            if (featured) featured.innerHTML = "";
            if (container) container.innerHTML = "<p>Could not load news.</p>";
        }
    }
    
    loadNews();
});
