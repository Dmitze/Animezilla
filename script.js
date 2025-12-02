// ====== DROPDOWN NAVIGATION ======

const dropdownNavigations = document.querySelectorAll('.dropdown-navigation');

dropdownNavigations.forEach(dropdown => {
    const trigger = dropdown.querySelector('.trigger-button');
    const panel = dropdown.querySelector('.dropdown-panel');
    
    if (!trigger || !panel) return;
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close other dropdowns
        dropdownNavigations.forEach(otherDropdown => {
            if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove('active');
            }
        });
        
        // Toggle current dropdown
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking on an item
    const items = panel.querySelectorAll('.dropdown-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    });
});

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    dropdownNavigations.forEach(dropdown => {
        dropdown.classList.remove('active');
    });
});

// ====== SEARCH INPUT ======

const searchInput = document.querySelector('.search-input');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        console.log('Search query:', query);
        // Implement search functionality here
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            console.log('Search submitted:', query);
            // Implement search submission here
        }
    });
}

// ====== NOTIFICATION BUTTON ======

const notificationButton = document.querySelector('.notification-button');

if (notificationButton) {
    notificationButton.addEventListener('click', () => {
        console.log('Notification clicked');
        // Implement notification panel here
    });
}

// ====== ANIME CARDS ======

const animeCards = document.querySelectorAll('.anime-card, .popular-anime-card');

animeCards.forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('.anime-title, .popular-title');
        if (title) {
            console.log('Card clicked:', title.textContent);
            // Implement modal or detail view here
        }
    });
    
    card.addEventListener('mouseenter', () => {
        card.style.cursor = 'pointer';
    });
});

// ====== BUTTONS ======

const primaryButtons = document.querySelectorAll('.button-primary');
const secondaryButtons = document.querySelectorAll('.button-secondary');

primaryButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('Primary button clicked:', button.textContent);
        // Implement action here
    });
});

secondaryButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('Secondary button clicked:', button.textContent);
        // Implement action here
    });
});

// ====== MODAL (DETAIL VIEW) ======

function openAnimeModal(animeData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const content = `
        <div class="modal-detail-view">
            <button class="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#B3B3B3" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            
            <div class="modal-header">
                <div class="poster-image">
                    <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1A1A1A 0%, #242424 100%); display: flex; align-items: center; justify-content: center; color: #808080;">Poster</div>
                </div>
                <div class="content-area">
                    <h1 class="modal-title">${animeData.title}</h1>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Статус</span>
                            <span class="value">Вийшло</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Дата випуску</span>
                            <span class="value">2023</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Епізодів</span>
                            <span class="value">24</span>
                        </div>
                    </div>
                </div>
                
                <div class="view-count-badge-modal">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="color: #FFFFFF;">
                        <path d="M8 2C4.5 2 1.5 5 1.5 8s3 6 6.5 6 6.5-3 6.5-6-3-6-6.5-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
                    </svg>
                    <span>1.2K</span>
                </div>
            </div>
            
            <div class="description-block">
                <p>${animeData.description || 'Детальний опис аніме буде тут...'}</p>
            </div>
            
            <div class="genre-tags">
                ${['Романтика', 'Екшн', 'Драма'].map(genre => `
                    <a href="#" class="tag">${genre}</a>
                `).join('')}
            </div>
            
            <div class="add-to-list-button">
                <button class="button-primary">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4 9h-3v3h-2v-3H8v-2h3V6h2v3h3v2z"/>
                    </svg>
                    <span>Додати до</span>
                    <svg class="chevron-icon" width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div class="dropdown-menu" style="display: none;">
                    <a href="#" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="7" stroke="#808080" stroke-width="1.5"/>
                            <path d="M9 5v8M5 9h8" stroke="#808080" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <span>Дивлюсь</span>
                    </a>
                    <a href="#" class="dropdown-item">
                        <span>Заплановано</span>
                    </a>
                    <a href="#" class="dropdown-item">
                        <span>Переглянуто</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    // Add styles for modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
    `;
    
    const modalView = modal.querySelector('.modal-detail-view');
    modalView.style.cssText = `
        background: #1A1A1A;
        border-radius: 16px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        position: relative;
    `;
    
    // Modal close button
    const closeButton = modal.querySelector('.modal-close');
    closeButton.style.cssText = `
        position: absolute;
        top: 24px;
        right: 24px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    `;
    
    closeButton.addEventListener('click', () => {
        modal.remove();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add to list dropdown
    const addButton = modal.querySelector('.button-primary');
    const dropdownMenu = modal.querySelector('.dropdown-menu');
    const chevronIcon = modal.querySelector('.chevron-icon');
    
    if (addButton && dropdownMenu) {
        addButton.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'flex' : 'none';
            dropdownMenu.style.cssText = `
                display: ${dropdownMenu.style.display === 'none' ? 'none' : 'flex'};
                flex-direction: column;
                gap: 8px;
                background: #1A1A1A;
                border: 1px solid #2A2A2A;
                border-radius: 8px;
                margin-top: 8px;
                padding: 8px 0;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
                overflow: hidden;
            `;
            chevronIcon.style.transform = dropdownMenu.style.display === 'none' ? 'rotate(0deg)' : 'rotate(180deg)';
        });
        
        const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.style.cssText = `
                padding: 12px 16px;
                color: #B3B3B3;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.background = '#242424';
                item.style.color = '#FFFFFF';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
                item.style.color = '#B3B3B3';
            });
        });
    }
}

// Open modal on card click
animeCards.forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('.anime-title, .popular-title');
        if (title) {
            openAnimeModal({
                title: title.textContent,
                description: 'Це захопливе аніме розповідає про пригоди у фантастичному світі, де головний персонаж повинен подолати численні перешкоди для досягнення мети.'
            });
        }
    });
});

// ====== SMOOTH SCROLL ======

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ====== ANIMATION ON SCROLL ======

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Observe all cards and sections
document.querySelectorAll('.anime-card, .popular-anime-card, .community-card').forEach(el => {
    observer.observe(el);
});

// ====== CONSOLE MESSAGES ======

console.log('%cAnimezilla', 'font-size: 24px; font-weight: bold; color: #00D9C0;');
console.log('%cУкраїнський аніме-хаб', 'font-size: 14px; color: #B3B3B3;');
console.log('%cДобро пожалувати на наш сайт! 🎌', 'font-size: 14px; color: #FFFFFF;');
