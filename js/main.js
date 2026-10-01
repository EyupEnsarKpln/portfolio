document.addEventListener('DOMContentLoaded', () => {
    // --- Security Sanitization Helpers ---
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, (match) => {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return escapeMap[match];
        });
    }

    function safeUrl(url) {
        if (typeof url !== 'string') return '#';
        const trimmed = url.trim();
        if (trimmed.startsWith('#') || (trimmed.startsWith('/') && !trimmed.startsWith('//'))) {
            return trimmed;
        }
        try {
            const parsed = new URL(trimmed);
            if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
                return trimmed;
            }
        } catch (e) {
            if (/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
                return trimmed;
            }
        }
        return '#';
    }

    function sanitizeId(id) {
        if (typeof id !== 'string') return '';
        return id.replace(/[^a-zA-Z0-9\-_]/g, '');
    }

    // --- Data Injection (CMS Functionality) ---
    if (typeof portfolioData !== 'undefined') {
        // Update Title and Personal info if elements exist (e.g. on index.html)
        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        if (heroTitle) {
            document.title = `${portfolioData.personal.name} | Portfolyo`;
            heroTitle.textContent = portfolioData.personal.name;
            heroTitle.setAttribute('data-text', portfolioData.personal.name);
        }
        if (heroSubtitle) {
            heroSubtitle.textContent = portfolioData.personal.bio;
        }

        const contactEmail = document.getElementById('contact-email');
        if (contactEmail) {
            contactEmail.href = safeUrl(`mailto:${portfolioData.personal.email}`);
        }

        // Populate Socials
        const socialsContainer = document.getElementById('social-links');
        if (portfolioData.personal.socials && socialsContainer) {
            socialsContainer.innerHTML = ''; // Clear existing
            const icons = {
                instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
                youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>',
                discord: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.03.03.03.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.02.02.05.03.07.02c1.71-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"></path></svg>',
                linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
                huggingface: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.4446 11.5059c0 1.1021 0.1673 2.1585 0.4847 3.1563 -0.0378 -0.0028 -0.0691 -0.0058 -0.1058 -0.0058 -0.4209 0 -0.8015 0.16 -1.0704 0.4512 -0.3454 0.3737 -0.4984 0.8335 -0.4316 1.293a1.576 1.576 0 0 0 0.2148 0.5978c-0.2319 0.1864 -0.4018 0.4456 -0.4844 0.7578 -0.0646 0.2448 -0.131 0.7543 0.2149 1.2794a1.4552 1.4552 0 0 0 -0.0625 0.1055c-0.208 0.3923 -0.2207 0.8372 -0.0371 1.25 0.2783 0.6258 0.9696 1.1175 2.3126 1.6467 0.8356 0.3292 1.5988 0.5411 1.6056 0.543 1.1046 0.2847 2.104 0.4277 2.969 0.4277 1.4173 0 2.4754 -0.3849 3.1525 -1.1446 1.538 0.2651 2.791 0.1403 3.592 0.006 0.6773 0.7555 1.7332 1.1387 3.1467 1.1387 0.8649 0 1.8643 -0.143 2.969 -0.4278 0.0068 -0.0019 0.77 -0.2138 1.6056 -0.543 1.343 -0.5292 2.0343 -1.0208 2.3126 -1.6466 0.1836 -0.4129 0.171 -0.8577 -0.037 -1.25a1.4685 1.4685 0 0 0 -0.0626 -0.1056c0.346 -0.525 0.2795 -1.0346 0.2149 -1.2793 -0.0826 -0.3122 -0.2525 -0.5714 -0.4844 -0.7579 0.11 -0.1816 0.1831 -0.3788 0.2148 -0.5977 0.0669 -0.4595 -0.0862 -0.9193 -0.4316 -1.293 -0.2688 -0.2913 -0.6495 -0.4513 -1.0704 -0.4513 -0.0209 0 -0.0376 0.0008 -0.0588 0.0018 0.3162 -0.9966 0.4846 -2.0518 0.4846 -3.1523 0 -5.807 -4.7362 -10.5144 -10.5789 -10.5144 -5.8426 0 -10.5788 4.7073 -10.5788 10.5144Zm10.5788 -9.4831c5.2727 0 9.5476 4.246 9.5476 9.483a9.4201 9.4201 0 0 1 -0.2696 2.2365c-0.0039 -0.0047 -0.0079 -0.011 -0.0117 -0.0156 -0.274 -0.3255 -0.6679 -0.5059 -1.1075 -0.5059 -0.352 0 -0.714 0.1155 -1.0763 0.3438 -0.2403 0.1517 -0.5058 0.422 -0.7793 0.7598 -0.2534 -0.3492 -0.608 -0.5832 -1.0137 -0.6465a1.5174 1.5174 0 0 0 -0.2344 -0.0176c-0.9263 0 -1.4828 0.7993 -1.6935 1.5177 -0.1046 0.2426 -0.6065 1.3482 -1.3614 2.0978 -1.1681 1.1601 -1.4458 2.3534 -0.8396 3.6382 -0.843 0.1029 -1.5836 0.0927 -2.365 -0.006 0.5906 -1.212 0.3626 -2.4388 -0.8426 -3.6322 -0.755 -0.7496 -1.2568 -1.8552 -1.3614 -2.0978 -0.2107 -0.7184 -0.7673 -1.5177 -1.6935 -1.5177 -0.078 0 -0.1568 0.0054 -0.2344 0.0176 -0.4057 0.0633 -0.7604 0.2973 -1.0137 0.6465 -0.2735 -0.3379 -0.539 -0.6081 -0.7794 -0.7598 -0.3622 -0.2283 -0.7243 -0.3438 -1.0762 -0.3438 -0.4266 0 -0.8094 0.171 -1.0821 0.4786a9.4208 9.4208 0 0 1 -0.2598 -2.1936c0 -5.237 4.2749 -9.483 9.5475 -9.483zM8.6443 7.0036c-0.4838 0.0043 -0.9503 0.2667 -1.1934 0.7227 -0.3536 0.6633 -0.1006 1.4873 0.5645 1.84 0.351 0.1862 0.4883 -0.5261 0.836 -0.6485 0.3107 -0.1095 0.841 0.399 1.0078 0.086 0.3536 -0.6634 0.1025 -1.4874 -0.5625 -1.84a1.3659 1.3659 0 0 0 -0.6524 -0.1602Zm6.8403 0c-0.2199 -0.002 -0.4426 0.05 -0.6504 0.1602 -0.665 0.3526 -0.9181 1.1766 -0.5645 1.84 0.1669 0.313 0.6971 -0.1955 1.0079 -0.086 0.3476 0.1224 0.4867 0.8347 0.838 0.6485 0.6649 -0.3527 0.916 -1.1767 0.5624 -1.84 -0.243 -0.456 -0.7096 -0.7184 -1.1934 -0.7227Zm-9.7565 1.418a0.8768 0.8768 0 0 0 -0.877 0.877c0 0.4846 0.3925 0.877 0.877 0.877a0.8768 0.8768 0 0 0 0.877 -0.877 0.8768 0.8768 0 0 0 -0.877 -0.877zm12.6434 0c-0.4845 0 -0.879 0.3925 -0.879 0.877 0 0.4846 0.3945 0.877 0.879 0.877a0.8768 0.8768 0 0 0 0.877 -0.877 0.8768 0.8768 0 0 0 -0.877 -0.877zM8.7927 11.459c-0.179 -0.003 -0.2793 0.1107 -0.2793 0.416 0 0.8097 0.3874 2.125 1.4279 2.924 0.207 -0.7123 1.3453 -1.2832 1.5079 -1.2012 0.2315 0.1167 0.2191 0.4417 0.6074 0.7266 0.3884 -0.285 0.374 -0.6098 0.6056 -0.7266 0.1627 -0.082 1.3009 0.4889 1.5079 1.2012 1.0404 -0.799 1.4278 -2.1144 1.4278 -2.924 0 -1.2212 -1.583 0.6402 -3.5413 0.6485 -1.4686 -0.0061 -2.7266 -1.0558 -3.2639 -1.0645zM4.312 14.4768c0.5792 0.365 1.6964 2.2751 2.1056 3.0177 0.1371 0.2488 0.371 0.3536 0.582 0.3536 0.4188 0 0.7465 -0.4138 0.0391 -0.9395 -1.0636 -0.791 -0.6914 -2.0846 -0.1836 -2.1642a0.4302 0.4302 0 0 1 0.0664 -0.004c0.4616 0 0.666 0.7892 0.666 0.7892s0.5959 1.4898 1.6213 2.508c0.942 0.9356 1.062 1.703 0.4961 2.6661 -0.0164 -0.004 -0.0159 0.0236 -0.1484 0.2149 -0.1853 0.2673 -0.4322 0.4688 -0.7188 0.6152 -0.5062 0.2269 -1.1397 0.2696 -1.7833 0.2696 -1.037 0 -2.1017 -0.1824 -2.6975 -0.336 -0.0293 -0.0075 -3.6505 -0.9567 -3.1916 -1.8224 0.0771 -0.1454 0.2033 -0.2031 0.3633 -0.2031 0.6463 0 1.823 0.9551 2.3283 0.9551 0.113 0 0.196 -0.0865 0.2285 -0.2031 0.2249 -0.8045 -3.2787 -1.0522 -2.9846 -2.1642 0.0519 -0.1967 0.193 -0.2757 0.3907 -0.2754 0.854 0 2.7704 1.4923 3.172 1.4923 0.0307 0 0.0525 -0.0085 0.0645 -0.0274 0.2012 -0.3227 0.1096 -0.5865 -1.3087 -1.4395 -1.4182 -0.8533 -2.4315 -1.329 -1.8653 -1.9416 0.0651 -0.0707 0.1574 -0.1015 0.2695 -0.1015 0.8611 0.0002 2.8948 1.84 2.8948 1.84s0.5487 0.5683 0.8809 0.5683c0.0762 0 0.1416 -0.0315 0.1855 -0.1054 0.2355 -0.3946 -2.1858 -2.2183 -2.3224 -2.971 -0.0926 -0.51 0.0641 -0.7676 0.3555 -0.7676 -0.0006 0.008 0.1701 -0.0285 0.4942 0.1759zm16.2257 0.5918c-0.1366 0.7526 -2.5579 2.5764 -2.3224 2.9709 0.044 0.074 0.1092 0.1055 0.1855 0.1055 0.3321 0 0.881 -0.5684 0.881 -0.5684s2.0336 -1.8397 2.8947 -1.84c0.1121 0 0.2044 0.0308 0.2695 0.1016 0.5662 0.6125 -0.447 1.0882 -1.8653 1.9415 -1.4183 0.853 -1.51 1.1168 -1.3087 1.4396 0.012 0.0188 0.0337 0.0273 0.0644 0.0273 0.4016 0 2.3181 -1.4923 3.1721 -1.4923 0.1977 -0.0002 0.3388 0.0787 0.3907 0.2754 0.294 1.112 -3.2095 1.3597 -2.9846 2.1642 0.0325 0.1166 0.1156 0.2032 0.2285 0.2032 0.5054 0 1.682 -0.9552 2.3283 -0.9552 0.16 0 0.2862 0.0577 0.3633 0.2032 0.459 0.8656 -3.1623 1.8149 -3.1916 1.8224 -0.5958 0.1535 -1.6605 0.336 -2.6975 0.336 -0.6351 0 -1.261 -0.0409 -1.7638 -0.2599 -0.2949 -0.1472 -0.5488 -0.3516 -0.7383 -0.625 -0.0411 -0.0682 -0.1026 -0.1476 -0.1426 -0.205 -0.5726 -0.9679 -0.455 -1.7371 0.4903 -2.676 1.0254 -1.0182 1.6212 -2.508 1.6212 -2.508s0.2044 -0.7891 0.666 -0.7891a0.4318 0.4318 0 0 1 0.0665 0.0039c0.5078 0.0796 0.88 1.3732 -0.1836 2.1642 -0.7074 0.5257 -0.3797 0.9395 0.039 0.9395 0.211 0 0.445 -0.1047 0.5821 -0.3535 0.4092 -0.7426 1.5264 -2.6527 2.1056 -3.0178 0.5588 -0.3524 0.99 -0.1816 0.8497 0.5918z" fill="currentColor"></path></svg>'
            };
            for (const [platform, url] of Object.entries(portfolioData.personal.socials)) {
                if (url && icons[platform]) {
                    const safePlatform = escapeHtml(platform);
                    const safeLink = safeUrl(url);
                    socialsContainer.innerHTML += `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="social-icon ${safePlatform}" title="${safePlatform}">${icons[platform]}</a>`;
                }
            }
        }

        // Populate Gallery
        const galleryGrid = document.getElementById('gallery-grid');
        if (galleryGrid) {
            galleryGrid.innerHTML = ''; // Clear existing
            portfolioData.gallery.forEach(item => {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                div.setAttribute('data-id', escapeHtml(item.id));

                // Auto detect types
                let actualType = item.type;
                let youtubeId = item.youtubeId;
                let sunoId = null;
                let targetUrl = item.url || item.instagramUrl || item.audioUrl;

                if (targetUrl) {
                    if (targetUrl.includes('instagram.com/p/') || targetUrl.includes('instagram.com/reel/')) {
                        actualType = 'instagram';
                    } else if (targetUrl.includes('youtube.com/watch') || targetUrl.includes('youtu.be/')) {
                        actualType = 'youtube';
                        const match = targetUrl.match(/[?&]v=([^&]+)/) || targetUrl.match(/youtu\.be\/([^?]+)/);
                        if (match) youtubeId = match[1];
                    }
                }

                if (item.audioUrl && item.audioUrl.includes('suno.com')) {
                    const sunoMatch = item.audioUrl.match(/suno\.com\/s\/([^?/]+)/) || item.audioUrl.match(/suno\.com\/song\/([^?/]+)/);
                    if (sunoMatch) sunoId = sunoMatch[1];
                }

                item._actualType = actualType;
                item._youtubeId = youtubeId;
                item._sunoId = sunoId;
                item._targetUrl = targetUrl;

                const safeTitle = escapeHtml(item.title);
                const safeDesc = escapeHtml(item.description);
                const safeCoverUrl = safeUrl(item.coverUrl);
                const safeTargetUrl = safeUrl(targetUrl);
                const safeYoutubeId = sanitizeId(youtubeId);

                let mediaHtml = '';
                if (actualType === 'album') {
                    mediaHtml = `<img src="${safeCoverUrl}" alt="${safeTitle}" loading="lazy">
                                 <div class="album-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> Albüm (${item.items ? item.items.length : 0})</div>`;
                } else if (actualType === 'image') {
                    mediaHtml = `<img src="${safeTargetUrl}" alt="${safeTitle}" loading="lazy">`;
                } else if (actualType === 'video') {
                    mediaHtml = `<video src="${safeTargetUrl}" muted loop playsinline autoplay></video>`;
                } else if (actualType === 'youtube') {
                    mediaHtml = `<img src="https://img.youtube.com/vi/${safeYoutubeId}/maxresdefault.jpg" alt="${safeTitle}" loading="lazy">
                                 <div class="media-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent-1)" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>`;
                } else if (actualType === 'music') {
                    mediaHtml = `<img src="${safeCoverUrl}" alt="${safeTitle}" loading="lazy">
                                 <div class="media-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>`;
                } else if (actualType === 'instagram') {
                    const thumb = item.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop';
                    const safeThumb = safeUrl(thumb);
                    mediaHtml = `<img src="${safeThumb}" alt="${safeTitle}" loading="lazy">
                                 <div class="media-icon insta-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e6683c" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></div>`;
                }

                div.innerHTML = `
                    <div class="gallery-template">
                        <div class="tech-corner corner-tl"></div>
                        <div class="tech-corner corner-tr"></div>
                        <div class="tech-corner corner-bl"></div>
                        <div class="tech-corner corner-br"></div>
                        <div class="media-container">
                            ${mediaHtml}
                        </div>
                        <div class="item-overlay">
                            <div class="overlay-content">
                                <h3>${safeTitle}</h3>
                                <p>${safeDesc}</p>
                                <div class="view-details">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                                    <span>İncele</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                div.addEventListener('click', () => openModal(item));
                galleryGrid.appendChild(div);
            });
        }

        // Populate Projects with screenshot previews
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = ''; // Clear existing
            portfolioData.projects.forEach(project => {
                const div = document.createElement('div');
                div.className = 'project-card';

                const safeTitle = escapeHtml(project.title);
                const safeDesc = escapeHtml(project.description);
                const previewLink = `preview.html?id=${sanitizeId(project.id)}`;
                const safeLink = safeUrl(project.link);
                const techTags = project.tech.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
                const safeScreenshot = safeUrl(project.screenshot || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800");

                div.innerHTML = `
                    <div class="project-img-container">
                        <img src="${safeScreenshot}" alt="${safeTitle}" loading="lazy">
                        <div class="project-img-overlay">
                            <span class="preview-btn-label">Canlı Ön İzleme</span>
                        </div>
                    </div>
                    <div class="project-content">
                        <div class="project-title-row">
                            <h3>${safeTitle}</h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </div>
                        <div class="project-tech">
                            ${techTags}
                        </div>
                        <p>${safeDesc}</p>
                        <div class="project-actions">
                            <a href="${previewLink}" class="project-btn-primary">Ön İzleme</a>
                            <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="project-btn-secondary">GitHub</a>
                        </div>
                    </div>
                `;
                projectsGrid.appendChild(div);
            });
        }
    }

    // --- Navigation & Page Transition Shutter ---
    const navLinks = document.querySelectorAll('.nav-links a, .nav-logo');
    const shutter = document.querySelector('.page-shutter');

    // Highlight current page active link
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        // Check if page matches href
        if (href === page || (page === 'index.html' && href === '/') || (page === '' && href === 'index.html')) {
            link.classList.add('active');
        }

        // Intercept navigation for smooth exit animations
        link.addEventListener('click', (e) => {
            const targetUrl = link.getAttribute('href');
            // Make sure we only intercept local valid html links (not anchors, external URLs, mailto, etc.)
            if (targetUrl && !targetUrl.startsWith('#') && targetUrl !== '#' && !targetUrl.startsWith('mailto:') && !targetUrl.startsWith('http') && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                playExitTransition(() => {
                    window.location.href = targetUrl;
                });
            }
        });
    });

    // Remove active state of shutter on load to reveal page
    if (shutter) {
        shutter.classList.remove('active');
    }

    function playExitTransition(callback) {
        if (shutter) {
            shutter.classList.add('active');
            setTimeout(callback, 500); // Duration matches CSS transition
        } else {
            callback();
        }
    }

    // Scroll Progress logic (if scroll progress bar exists)
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = requestAnimationFrame(() => {
                    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
                    scrollProgress.style.width = scrolled + '%';
                    scrollTimeout = null;
                });
            }
        });
    }

    // --- Typewriter/Scramble reveal effect on titles ---
    function scrambleText(element, delay = 0) {
        if (!element) return;
        const originalText = element.getAttribute('data-text') || element.textContent;
        element.setAttribute('data-text', originalText);
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+{}[]|';
        let frame = 0;
        const duration = 20; // total animation frames
        
        setTimeout(() => {
            element.style.opacity = '1';
            const interval = setInterval(() => {
                let currentText = '';
                for (let i = 0; i < originalText.length; i++) {
                    if (originalText[i] === ' ') {
                        currentText += ' ';
                    } else if (i < (frame / duration) * originalText.length) {
                        currentText += originalText[i];
                    } else {
                        currentText += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                element.textContent = currentText;
                frame++;
                if (frame > duration) {
                    element.textContent = originalText;
                    clearInterval(interval);
                }
            }, 30);
        }, delay);
    }

    // Trigger Scramble Revealer on Header Titles
    const secHeaderTitle = document.querySelector('.section-header h2');
    if (secHeaderTitle) {
        secHeaderTitle.style.opacity = '0';
        scrambleText(secHeaderTitle, 200);
    }
    const mainHeroTitle = document.getElementById('hero-title');
    if (mainHeroTitle) {
        mainHeroTitle.style.opacity = '0';
        scrambleText(mainHeroTitle, 350);
    }

    // --- Card Staggered Entrance Animation ---
    function initStaggerAnimations() {
        const animatedCards = document.querySelectorAll('.gallery-item, .project-card');
        animatedCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.95)';
            card.style.transition = 'opacity 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, 250 + index * 80);
        });
    }

    // --- Project Preview Controller (Only runs on preview.html) ---
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer && typeof portfolioData !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const project = portfolioData.projects.find(p => p.id === projectId);

        if (project) {
            document.title = `${project.title} | Canlı Ön İzleme`;
            
            const prevTitle = document.getElementById('preview-title');
            const prevDesc = document.getElementById('preview-desc');
            const prevTech = document.getElementById('preview-tech');
            const prevIframe = document.getElementById('preview-iframe');
            const directLink = document.getElementById('preview-direct-link');
            
            if (prevTitle) prevTitle.textContent = project.title;
            if (prevDesc) prevDesc.textContent = project.description;
            if (prevTech) {
                prevTech.innerHTML = project.tech.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
            }
            if (prevIframe) {
                prevIframe.src = project.previewUrl || project.link;
            }
            if (directLink) {
                directLink.href = safeUrl(project.link);
            }

            // Device switch buttons
            const deviceBtns = document.querySelectorAll('.device-btn');
            const iframeWrapper = document.getElementById('iframe-wrapper');
            deviceBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    deviceBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const device = btn.getAttribute('data-device');
                    if (iframeWrapper) {
                        iframeWrapper.className = `iframe-wrapper ${device}`;
                    }
                });
            });
        } else {
            // Project not found, go back
            window.location.href = 'projects.html';
        }
    }

    // --- Modal Logic (Gallery Item Zoom & Navigation) ---
    const modal = document.getElementById('media-modal');
    const modalContent = document.getElementById('modal-content');
    const modalCaption = document.getElementById('modal-caption');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');

    let currentAlbum = null;
    let currentAlbumIndex = 0;

    // Zoom Variables
    let zoomLevel = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let currentZoomImg = null;

    function resetZoom() {
        zoomLevel = 1;
        currentX = 0;
        currentY = 0;
        if (currentZoomImg) {
            currentZoomImg.style.transform = `translate(0px, 0px) scale(1)`;
            currentZoomImg.style.cursor = 'zoom-in';
            currentZoomImg.style.transition = 'transform 0.15s ease-out';
        }
    }

    function initZoom(imgElement) {
        currentZoomImg = imgElement;
        resetZoom();
    }

    function renderAlbumItem() {
        if (!currentAlbum || !currentAlbum.items) return;
        const item = currentAlbum.items[currentAlbumIndex];

        let targetUrl = item.url || item.instagramUrl || item.audioUrl;
        let actualType = item.type;
        let youtubeId = item.youtubeId;
        let sunoId = null;

        if (targetUrl) {
            if (targetUrl.includes('instagram.com/p/') || targetUrl.includes('instagram.com/reel/')) {
                actualType = 'instagram';
            } else if (targetUrl.includes('youtube.com/watch') || targetUrl.includes('youtu.be/')) {
                actualType = 'youtube';
                const match = targetUrl.match(/[?&]v=([^&]+)/) || targetUrl.match(/youtu\.be\/([^?]+)/);
                if (match) youtubeId = match[1];
            }
        }

        if (item.audioUrl && item.audioUrl.includes('suno.com')) {
            const sunoMatch = item.audioUrl.match(/suno\.com\/s\/([^?/]+)/) || item.audioUrl.match(/suno\.com\/song\/([^?/]+)/);
            if (sunoMatch) sunoId = sunoMatch[1];
        }

        const safeTargetUrl = safeUrl(targetUrl);
        const safeYoutubeId = sanitizeId(youtubeId);
        const safeSunoId = sanitizeId(sunoId);
        const safeCoverUrl = safeUrl(item.coverUrl);
        const safeAudioUrl = safeUrl(item.audioUrl);

        if (!modalContent) return;

        if (actualType === 'image') {
            modalContent.innerHTML = `<img src="${safeTargetUrl}" alt="Albüm Öğesi" class="zoomable-img">`;
            initZoom(modalContent.querySelector('.zoomable-img'));
        } else if (actualType === 'video') {
            modalContent.innerHTML = `<video src="${safeTargetUrl}" controls autoplay></video>`;
        } else if (actualType === 'youtube') {
            modalContent.innerHTML = `<div class="iframe-container"><iframe src="https://www.youtube.com/embed/${safeYoutubeId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        } else if (actualType === 'instagram') {
            if (safeTargetUrl !== '#') {
                const cleanUrl = safeTargetUrl.split('?')[0];
                const embedUrl = cleanUrl.endsWith('/') ? cleanUrl + 'embed' : cleanUrl + '/embed';
                modalContent.innerHTML = `<iframe src="${safeUrl(embedUrl)}" width="400" height="500" frameborder="0" scrolling="no" allowtransparency="true" class="instagram-iframe"></iframe>`;
            } else {
                modalContent.innerHTML = '';
            }
        } else if (actualType === 'music') {
            if (safeSunoId) {
                modalContent.innerHTML = `<div class="music-player-container"><img src="${safeCoverUrl || 'https://via.placeholder.com/300'}" class="music-cover" alt="Cover"><iframe src="https://suno.com/embed/${safeSunoId}" width="100%" height="150" frameborder="0" class="suno-embed" allow="autoplay"></iframe></div>`;
            } else {
                modalContent.innerHTML = `<div class="music-player-container"><img src="${safeCoverUrl || 'https://via.placeholder.com/300'}" class="music-cover" alt="Cover"><audio src="${safeAudioUrl}" controls autoplay class="custom-audio"></audio></div>`;
            }
        }

        let captionHtml = `<div class="album-indicator">Albüm Öğesi ${currentAlbumIndex + 1} / ${currentAlbum.items.length}</div>`;
        if (item.description) captionHtml += `<p>${escapeHtml(item.description)}</p>`;
        if (item.prompt) {
            captionHtml += `
                <div class="prompt-box">
                    <div class="prompt-header">
                        <strong>Kullanılan Prompt:</strong>
                        <button class="copy-prompt-btn" data-prompt="${encodeURIComponent(item.prompt)}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Kopyala
                        </button>
                    </div>
                    <code>${escapeHtml(item.prompt)}</code>
                </div>
            `;
        }
        if (modalCaption) modalCaption.innerHTML = captionHtml;

        if (modalPrev) modalPrev.style.display = currentAlbumIndex > 0 ? 'flex' : 'none';
        if (modalNext) modalNext.style.display = currentAlbumIndex < currentAlbum.items.length - 1 ? 'flex' : 'none';
    }

    if (modalPrev) {
        modalPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentAlbumIndex > 0) { currentAlbumIndex--; renderAlbumItem(); }
        });
    }
    if (modalNext) {
        modalNext.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentAlbumIndex < currentAlbum.items.length - 1) { currentAlbumIndex++; renderAlbumItem(); }
        });
    }

    function openModal(item) {
        if (!modal) return;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);

        const type = item._actualType || item.type;
        const youtubeId = item._youtubeId || item.youtubeId;
        const targetUrl = item._targetUrl || item.url;

        currentAlbum = null;
        if (modalPrev) modalPrev.style.display = 'none';
        if (modalNext) modalNext.style.display = 'none';

        const safeTargetUrl = safeUrl(targetUrl);
        const safeYoutubeId = sanitizeId(youtubeId);
        const safeSunoId = sanitizeId(item._sunoId || item.sunoId);
        const safeCoverUrl = safeUrl(item.coverUrl);
        const safeAudioUrl = safeUrl(item.audioUrl);

        if (type === 'album') {
            currentAlbum = item;
            currentAlbumIndex = 0;
            renderAlbumItem();
            return;
        }

        if (!modalContent) return;

        if (type === 'image') {
            modalContent.innerHTML = `<img src="${safeTargetUrl}" alt="${escapeHtml(item.title)}" class="zoomable-img">`;
            initZoom(modalContent.querySelector('.zoomable-img'));
        } else if (type === 'video') {
            modalContent.innerHTML = `<video src="${safeTargetUrl}" controls autoplay></video>`;
        } else if (type === 'youtube') {
            modalContent.innerHTML = `<div class="iframe-container"><iframe src="https://www.youtube.com/embed/${safeYoutubeId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        } else if (type === 'music') {
            if (safeSunoId) {
                modalContent.innerHTML = `
                    <div class="music-player-container">
                        <img src="${safeCoverUrl}" class="music-cover" alt="Cover">
                        <iframe src="https://suno.com/embed/${safeSunoId}" width="100%" height="150" frameborder="0" class="suno-embed" allow="autoplay"></iframe>
                    </div>
                `;
            } else {
                modalContent.innerHTML = `
                    <div class="music-player-container">
                        <img src="${safeCoverUrl}" class="music-cover" alt="Cover">
                        <audio src="${safeAudioUrl}" controls autoplay class="custom-audio"></audio>
                    </div>
                `;
            }
        } else if (type === 'instagram') {
            if (safeTargetUrl !== '#') {
                const cleanUrl = safeTargetUrl.split('?')[0];
                const embedUrl = cleanUrl.endsWith('/') ? cleanUrl + 'embed' : cleanUrl + '/embed';
                modalContent.innerHTML = `<iframe src="${safeUrl(embedUrl)}" width="400" height="500" frameborder="0" scrolling="no" allowtransparency="true" class="instagram-iframe"></iframe>`;
            } else {
                modalContent.innerHTML = '';
            }
        }

        let captionHtml = `<p>${escapeHtml(item.description)}</p>`;

        if (item.prompt) {
            captionHtml += `
                <div class="prompt-box">
                    <div class="prompt-header">
                        <strong>Kullanılan Prompt:</strong>
                        <button class="copy-prompt-btn" data-prompt="${encodeURIComponent(item.prompt)}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Kopyala
                        </button>
                    </div>
                    <code>${escapeHtml(item.prompt)}</code>
                </div>
            `;
        }

        if (item.instagramLink) {
            const safeIgLink = safeUrl(item.instagramLink);
            captionHtml += `
                <a href="${safeIgLink}" target="_blank" rel="noopener noreferrer" class="instagram-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    Instagram'da Gör
                </a>
            `;
        }

        if (modalCaption) modalCaption.innerHTML = captionHtml;
    }

    if (modalContent) {
        modalContent.addEventListener('wheel', (e) => {
            if (!currentZoomImg) return;
            e.preventDefault();
            const zoomStep = 0.3;
            if (e.deltaY < 0) {
                zoomLevel = Math.min(zoomLevel + zoomStep, 4);
            } else {
                zoomLevel = Math.max(zoomLevel - zoomStep, 1);
            }

            if (zoomLevel === 1) {
                currentX = 0;
                currentY = 0;
                currentZoomImg.style.cursor = 'zoom-in';
            } else {
                currentZoomImg.style.cursor = 'grab';
            }

            currentZoomImg.style.transition = 'transform 0.15s ease-out';
            currentZoomImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomLevel})`;
        });

        modalContent.addEventListener('mousedown', (e) => {
            if (currentZoomImg && zoomLevel > 1 && e.target === currentZoomImg) {
                e.preventDefault();
                isDragging = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                currentZoomImg.style.cursor = 'grabbing';
                currentZoomImg.style.transition = 'none';
            }
        });

        modalContent.addEventListener('dblclick', (e) => {
            if (currentZoomImg && e.target === currentZoomImg) {
                if (zoomLevel > 1) {
                    resetZoom();
                } else {
                    zoomLevel = 2.5;
                    currentZoomImg.style.transition = 'transform 0.3s ease-out';
                    currentZoomImg.style.transform = `translate(0px, 0px) scale(${zoomLevel})`;
                    currentZoomImg.style.cursor = 'grab';
                }
            }
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !currentZoomImg) return;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        currentZoomImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomLevel})`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging && currentZoomImg) {
            isDragging = false;
            currentZoomImg.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
            currentZoomImg.style.transition = 'transform 0.15s ease-out';
        }
    });

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            if (modalContent) modalContent.innerHTML = '';
            currentZoomImg = null;
            zoomLevel = 1;
            currentX = 0;
            currentY = 0;
        }, 300);
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // --- 3D Tilt Effect & Dynamic Shine ---
    function initTiltEffects() {
        document.querySelectorAll('.project-card, .gallery-item').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                el.style.setProperty('--mouseX', `${(x / rect.width) * 100}%`);
                el.style.setProperty('--mouseY', `${(y / rect.height) * 100}%`);
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    // --- Magnetic Elements ---
    document.querySelectorAll('.cyber-button, .social-icon, .nav-logo, .device-btn, .modal-nav-btn').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0px, 0px)';
        });
    });

    // --- Social Particles ---
    document.querySelectorAll('.social-icon').forEach(icon => {
        icon.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.8) {
                const particle = document.createElement('div');
                particle.className = 'social-particle';
                particle.style.left = (e.clientX) + 'px';
                particle.style.top = (e.clientY) + 'px';

                let color = 'white';
                if (icon.classList.contains('instagram')) color = '#e6683c';
                if (icon.classList.contains('discord')) color = '#5865F2';
                if (icon.classList.contains('youtube')) color = '#FF0000';
                if (icon.classList.contains('linkedin')) color = '#0077b5';
                if (icon.classList.contains('huggingface')) color = '#FFD21E';

                particle.style.background = color;
                particle.style.boxShadow = `0 0 10px ${color}`;
                document.body.appendChild(particle);

                const tx = (Math.random() - 0.5) * 60;
                const ty = (Math.random() - 0.5) * 60;
                particle.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
                ], { duration: 800, easing: 'ease-out' }).onfinish = () => particle.remove();
            }
        });
    });

    // --- Custom Context Menu & Safe Hack Mode ---
    const ctxMenu = document.getElementById('cyber-context-menu');
    if (ctxMenu) {
        const ctxCopy = document.getElementById('ctx-copy');
        const ctxCopyImage = document.getElementById('ctx-copy-image');
        const ctxCopyLink = document.getElementById('ctx-copy-link');
        const ctxShare = document.getElementById('ctx-share');
        const ctxHack = document.getElementById('ctx-hack');
        const ctxMail = document.getElementById('ctx-mail');
        const actionStatus = document.createElement('div');
        let contextTarget = { text: '', image: null, link: '' };

        actionStatus.className = 'site-action-status';
        actionStatus.setAttribute('role', 'status');
        actionStatus.setAttribute('aria-live', 'polite');
        document.body.appendChild(actionStatus);

        function announceAction(message) {
            actionStatus.textContent = message;
            actionStatus.classList.add('is-visible');
            clearTimeout(actionStatus.hideTimer);
            actionStatus.hideTimer = setTimeout(() => actionStatus.classList.remove('is-visible'), 2400);
        }

        function closeContextMenu() {
            ctxMenu.style.display = 'none';
            ctxMenu.setAttribute('aria-hidden', 'true');
        }

        function setContextLabel(button, label) {
            if (!button) return;
            const labelNode = Array.from(button.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
            if (labelNode) labelNode.textContent = label;
        }

        async function copyText(text) {
            if (!text) throw new Error('Kopyalanacak içerik bulunamadı.');
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    return;
                } catch (error) {
                    // Continue to the legacy fallback when clipboard permissions are unavailable.
                }
            }
            const helper = document.createElement('textarea');
            helper.value = text;
            helper.setAttribute('readonly', '');
            helper.style.position = 'fixed';
            helper.style.opacity = '0';
            document.body.appendChild(helper);
            helper.select();
            const copied = document.execCommand('copy');
            helper.remove();
            if (!copied) throw new Error('Panoya erişilemedi.');
        }

        async function copyImage(image) {
            if (!image?.src) throw new Error('Kopyalanacak resim bulunamadı.');
            if (navigator.clipboard?.write && window.ClipboardItem && window.isSecureContext) {
                try {
                    const response = await fetch(image.currentSrc || image.src, { mode: 'cors' });
                    if (!response.ok) throw new Error('Resim alınamadı.');
                    const bitmap = await createImageBitmap(await response.blob());
                    const canvas = document.createElement('canvas');
                    canvas.width = bitmap.width;
                    canvas.height = bitmap.height;
                    canvas.getContext('2d').drawImage(bitmap, 0, 0);
                    bitmap.close();
                    const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    if (!pngBlob) throw new Error('Resim dönüştürülemedi.');
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
                    return 'Resim panoya kopyalandı.';
                } catch (error) {
                    await copyText(image.currentSrc || image.src);
                    return 'Resim kopyalanamadı; resim bağlantısı panoya kopyalandı.';
                }
            }
            await copyText(image.currentSrc || image.src);
            return 'Bu tarayıcı resim panosunu desteklemiyor; resim bağlantısı kopyalandı.';
        }

        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
            e.preventDefault();
            const selection = window.getSelection()?.toString().trim() || '';
            const image = e.target.closest('img');
            const link = e.target.closest('a');
            contextTarget = { text: selection, image, link: link?.href || '' };

            setContextLabel(ctxCopy, selection ? 'Seçimi kopyala' : (image ? 'Resim adresini kopyala' : 'Sayfa adresini kopyala'));
            if (ctxCopyImage) ctxCopyImage.hidden = !image;
            if (ctxCopyLink) ctxCopyLink.hidden = !link;
            if (ctxShare) ctxShare.hidden = !(navigator.share || navigator.clipboard);

            ctxMenu.style.display = 'flex';
            ctxMenu.setAttribute('aria-hidden', 'false');
            const bounds = ctxMenu.getBoundingClientRect();
            const x = Math.max(8, Math.min(e.clientX, window.innerWidth - bounds.width - 8));
            const y = Math.max(8, Math.min(e.clientY, window.innerHeight - bounds.height - 8));
            ctxMenu.style.left = `${x}px`;
            ctxMenu.style.top = `${y}px`;
        });

        document.addEventListener('pointerdown', (e) => {
            if (!ctxMenu.contains(e.target)) closeContextMenu();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ctxMenu.style.display === 'flex') closeContextMenu();
        });

        ctxCopy?.addEventListener('click', async () => {
            try {
                await copyText(contextTarget.text || contextTarget.image?.currentSrc || contextTarget.link || window.location.href);
                announceAction(contextTarget.text ? 'Seçili metin panoya kopyalandı.' : 'Bağlantı panoya kopyalandı.');
            } catch (error) {
                announceAction(error.message || 'Kopyalama başarısız oldu.');
            }
            closeContextMenu();
        });

        ctxCopyImage?.addEventListener('click', async () => {
            try {
                announceAction(await copyImage(contextTarget.image));
            } catch (error) {
                announceAction(error.message || 'Resim kopyalanamadı.');
            }
            closeContextMenu();
        });

        ctxCopyLink?.addEventListener('click', async () => {
            try {
                await copyText(contextTarget.link);
                announceAction('Bağlantı panoya kopyalandı.');
            } catch (error) {
                announceAction(error.message || 'Bağlantı kopyalanamadı.');
            }
            closeContextMenu();
        });

        ctxShare?.addEventListener('click', async () => {
            try {
                if (navigator.share) await navigator.share({ title: document.title, url: window.location.href });
                else {
                    await copyText(window.location.href);
                    announceAction('Sayfa bağlantısı panoya kopyalandı.');
                }
            } catch (error) {
                if (error.name !== 'AbortError') announceAction('Paylaşım açılamadı. Bağlantıyı kopyalamayı deneyin.');
            }
            closeContextMenu();
        });

        ctxHack?.addEventListener('click', () => {
            const isHacked = document.documentElement.classList.toggle('hacked-mode');
            ctxHack.setAttribute('aria-pressed', String(isHacked));
            ctxHack.classList.toggle('is-hacked', isHacked);
            setContextLabel(ctxHack, isHacked ? 'Hack modunu kapat' : 'Sistemi Hackle');
            announceAction(isHacked ? 'Görsel hack modu açıldı.' : 'Görsel hack modu kapatıldı.');
            closeContextMenu();
        });

        if (ctxMail && typeof portfolioData !== 'undefined') {
            ctxMail.addEventListener('click', () => {
                const mailHref = safeUrl(`mailto:${portfolioData.personal.email}`);
                if (mailHref !== '#') window.location.href = mailHref;
                closeContextMenu();
            });
        }
    }

    // Event Delegation for Copy Prompt Button
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-prompt-btn');
        if (btn) {
            const text = decodeURIComponent(btn.getAttribute('data-prompt'));
            const originalText = btn.innerHTML;
            copyPromptText(text).then(() => {
                btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ffd5" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopyalandı`;
                btn.style.color = '#00ffd5';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.color = '';
                }, 2000);
            }).catch(() => {
                btn.textContent = 'Kopyalanamadı';
                setTimeout(() => { btn.innerHTML = originalText; }, 2000);
            });
        }
    });

    async function copyPromptText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                return await navigator.clipboard.writeText(text);
            } catch (error) {
                // Continue to the legacy fallback when clipboard permissions are unavailable.
            }
        }
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand('copy');
        helper.remove();
        if (!copied) throw new Error('Panoya erişilemedi.');
    }

    // --- Initialize Auxiliary Listeners & Stagger Reveals ---
    initTiltEffects();
    initStaggerAnimations();
});
