document.addEventListener('DOMContentLoaded', function () {
    async function loadNews() {
        try {
            // Change to your backend API domain if needed
            const res = await fetch('http://tacsimstudios.atwebpages.com/data.php/news');
            if (!res.ok) throw new Error('Network response was not ok');
            const news = await res.json();
            news.sort((a, b) => new Date(a.date) - new Date(b.date));
            const featured = document.getElementById('featured-news');
            const container = document.getElementById('news-list');
            if (!container) return;

            if (!news || news.length === 0) {
                if (featured) featured.innerHTML = "";
                container.innerHTML = "<p>No news available.</p>";
                return;
            }

           
            if (featured && news.length > 0) {
                const top = news[news.length - 1]; 
                featured.innerHTML = `
                    <article class="featured-article">
                        <span class="featured-badge">BREAKING</span>
                        <h2 class="featured-title">${top.title}</h2>
                        <div class="featured-meta">
                            ${top.date ? `<span>📅 ${top.date}</span>` : ""}
                            ${top.author ? `<span>👤 ${top.author}</span>` : ""}
                            ${top.tags && top.tags.length ? `<span>🏷️ ${top.tags.join(', ')}</span>` : ""}
                        </div>
                        <p class="featured-excerpt">${top.excerpt || top.content || ""}</p>
                    </article>
                `;
            }

            // Render the rest as regular news
            const rest = news.slice(0, news.length - 1).reverse();
            container.innerHTML = rest.map(item => `
                <article class="news-card">
                    ${item.category ? `<span class="news-category ${item.category}">${item.category.toUpperCase()}</span>` : ""}
                    <h3 class="news-title">${item.title}</h3>
                    <div class="news-meta">
                        ${item.date ? `<span>📅 ${item.date}</span>` : ""}
                        ${item.author ? `<span>👤 ${item.author}</span>` : ""}
                        ${item.tags && item.tags.length ? `<span>🏷️ ${item.tags.join(', ')}</span>` : ""}
                    </div>
                    <p class="news-excerpt">${item.excerpt || item.content || ""}</p>
                </article>
            `).join('');
        } catch (err) {
            const featured = document.getElementById('featured-news');
            const container = document.getElementById('news-list');
            if (featured) featured.innerHTML = "";
            if (container) {
                container.innerHTML = "<p>Could not load news.</p>";
            }
            console.error('Error fetching news:', err);
        }
    }
    loadNews();
});
