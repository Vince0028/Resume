document.addEventListener('DOMContentLoaded', () => {
    const characters = [
        'Ai.png',
        'Akira.png',
        'Andy.png',
        'Aqua.png',
        'Bachira.png',
        'Ban.png',
        'Crimson.png',
        'Delta.png',
        'Denji.png',
        'Enjin.png',
        'Frieren.png',
        'Gabimaru.png',
        'Gintoki.png',
        'Guita.png',
        'Ichika.png',
        'Kazuma.png',
        'Keyaru.png',
        'Koenji.png',
        'Komi.png',
        'Mahiru.png',
        'Mash.png',
        'Masha.png',
        'Milim.png',
        'Mio.png',
        'Nazuna.png',
        'Nostradamus.png',
        'Rudeus.png',
        'Saiki.png',
        'Shalltear.png',
        'Shikimori.png',
        'Sun_Raku.png',
        'Takemichi.png',
        'Tobi.png',
        'Twice.png',
        'Waguri.png',
        'Wein.png',
        'Yoshiko.png',
        'Yoshitake.png',
        'Zenitsu.png'
    ];

    const femaleNames = ['Ai', 'Crimson', 'Delta', 'Frieren', 'Guita', 'Ichika', 'Komi', 'Mahiru', 'Masha', 'Milim', 'Mio', 'Nazuna', 'Shalltear', 'Shikimori', 'Waguri', 'Yoshiko']; // Female characters
    const favoriteNames = ['Koenji', 'Masha']; // Favorite characters

    const track = document.getElementById('animeTrack');
    const prevBtn = document.getElementById('animePrevBtn');
    const nextBtn = document.getElementById('animeNextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    let currentIndex = 0;

    // Render characters for CAROUSEL
    characters.forEach(char => {
        const slide = document.createElement('div');
        slide.className = 'anime-slide';

        const name = char.replace('.png', '');

        // Wrapper for content
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'anime-content-wrapper';

        const img = document.createElement('img');
        img.src = `../Images/anime_characters/${char}`;
        img.alt = name;
        img.className = 'anime-figurine';

        // Name Label
        const nameLabel = document.createElement('div');
        nameLabel.className = 'anime-name';
        nameLabel.textContent = name;

        contentWrapper.appendChild(img);
        contentWrapper.appendChild(nameLabel);
        slide.appendChild(contentWrapper);
        track.appendChild(slide);
    });

    const slides = track.getElementsByClassName('anime-slide');
    const totalSlides = slides.length;

    function updateCarousel() {
        if (slides.length === 0) return;
        const slideWidth = slides[0].clientWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    });

    // Auto-play
    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }, 3000);

    // Initial update
    setTimeout(updateCarousel, 100);
    window.addEventListener('resize', updateCarousel);


    // -- View All Modal Logic --
    const viewAllBtns = document.querySelectorAll('.view-all-header-btn, #viewAllAnimeBtn');
    const modal = document.getElementById('animeModal');
    const closeBtn = document.getElementById('closeAnimeModal');
    const modalGrid = document.getElementById('animeGrid'); // This is now a generic container

    if (modal && closeBtn && modalGrid) {

        const openModal = () => {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Lock scroll
            const fab = document.getElementById('floatingActions');
            if (fab) fab.classList.add('hidden'); // Hide FABs

            // -- Lightbox Setup --
            let lightbox = document.getElementById('animeLightbox');
            if (!lightbox) {
                lightbox = document.createElement('div');
                lightbox.className = 'lightbox-overlay';
                lightbox.id = 'animeLightbox';
                lightbox.innerHTML = `
                        <span class="lightbox-close">&times;</span>
                        <img class="lightbox-image" src="" alt="Zoomed Figurine">
                    `;
                document.body.appendChild(lightbox);

                const closeLightbox = () => {
                    lightbox.classList.remove('active');
                    setTimeout(() => {
                        if (lightbox.style.display !== 'none') lightbox.style.display = 'none';
                    }, 300); // Wait for transition
                };

                lightbox.addEventListener('click', (e) => {
                    if (e.target !== lightbox.querySelector('.lightbox-image')) {
                        closeLightbox();
                    }
                });
            }

            const showLightbox = (src) => {
                const img = lightbox.querySelector('.lightbox-image');
                img.src = src;
                lightbox.style.display = 'flex';
                // Force reflow
                lightbox.offsetHeight;
                lightbox.classList.add('active');
            };

            // Populate only if empty
            if (modalGrid.children.length === 0) {
                // Helper to create grid items
                const createGridItem = (char) => {
                    const gridItem = document.createElement('div');
                    gridItem.className = 'anime-grid-item';

                    const name = char.replace('.png', '');

                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.position = 'relative';
                    imgWrapper.style.width = '100%';
                    imgWrapper.style.cursor = 'zoom-in'; // Pointer cue

                    const img = document.createElement('img');
                    img.src = `../Images/anime_characters/${char}`;
                    img.alt = name;

                    // Click to Zoom
                    imgWrapper.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showLightbox(`../Images/anime_characters/${char}`);
                    });

                    imgWrapper.appendChild(img);

                    const label = document.createElement('div');
                    label.textContent = name;

                    gridItem.appendChild(imgWrapper);
                    gridItem.appendChild(label);

                    // Favorite Label below name
                    if (favoriteNames.includes(name)) {
                        const favLabel = document.createElement('div');
                        favLabel.className = 'favorite-label-text';
                        favLabel.innerHTML = '<i class="bi bi-star-fill"></i> FAVORITE';
                        gridItem.appendChild(favLabel);
                    }

                    return gridItem;
                };

                // Filter characters (assuming filenames match expectations)
                const females = characters.filter(c => femaleNames.includes(c.replace('.png', '')));
                const males = characters.filter(c => !femaleNames.includes(c.replace('.png', '')));

                // -- FEMALE SECTION --
                const femaleHeader = document.createElement('h3');
                femaleHeader.className = 'anime-section-title';
                femaleHeader.textContent = 'Female';
                femaleHeader.style.color = '#fff';
                femaleHeader.style.marginTop = '1rem';
                femaleHeader.style.marginBottom = '1rem';
                femaleHeader.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                femaleHeader.style.paddingBottom = '0.5rem';

                const femaleGrid = document.createElement('div');
                femaleGrid.className = 'anime-grid'; // Re-use the grid style

                females.forEach(char => {
                    femaleGrid.appendChild(createGridItem(char));
                });

                modalGrid.appendChild(femaleHeader);
                modalGrid.appendChild(femaleGrid);

                // -- MALE SECTION --
                const maleHeader = document.createElement('h3');
                maleHeader.className = 'anime-section-title';
                maleHeader.textContent = 'Male';
                maleHeader.style.color = '#fff';
                maleHeader.style.marginTop = '2rem';
                maleHeader.style.marginBottom = '1rem';
                maleHeader.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                maleHeader.style.paddingBottom = '0.5rem';

                const maleGrid = document.createElement('div');
                maleGrid.className = 'anime-grid'; // Re-use the grid style

                males.forEach(char => {
                    maleGrid.appendChild(createGridItem(char));
                });

                modalGrid.appendChild(maleHeader);
                modalGrid.appendChild(maleGrid);
            }

            // --- RELIABLE ANIMATION SEQUENCE ---

            // 1. Force start state (HIDDEN) instantly via inline styles
            const allGridItems = modalGrid.querySelectorAll('.anime-grid-item');
            allGridItems.forEach(item => {
                item.classList.remove('visible');
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px) scale(0.9)';
                item.style.transition = 'none';
            });

            // 2. Force a browser reflow 
            void modalGrid.offsetHeight;

            // 3. Trigger staggered reveal ONLY for items initially in view
            setTimeout(() => {
                let delayCounter = 0;
                allGridItems.forEach((item) => {
                    const rect = item.getBoundingClientRect();
                    // VISIBILITY CHECK: Only animate if top is within viewport + buffer
                    if (rect.top < window.innerHeight - 20) {
                        setTimeout(() => {
                            item.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0) scale(1)';
                            item.classList.add('visible');
                        }, delayCounter * 60); // 60ms delay
                        delayCounter++;
                    }
                    // Else: Item stays hidden (opacity: 0)
                });

                // 4. Attach scroll listener AFTER initial reveal is set up
                // This prevents instant triggering during open
                setTimeout(() => {
                    const modalContent = document.querySelector('.anime-modal-content');
                    if (modalContent) {
                        modalContent.onscroll = () => {
                            const gridItems = modalGrid.querySelectorAll('.anime-grid-item');
                            gridItems.forEach(item => {
                                // Start animation for hidden items when they scroll into view
                                if (item.style.opacity === '0') {
                                    const rect = item.getBoundingClientRect();
                                    // Check if entered viewport
                                    if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
                                        item.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                                        item.style.opacity = '1';
                                        item.style.transform = 'translateY(0) scale(1)';
                                        item.classList.add('visible');
                                    }
                                }
                            });
                        };
                    }
                }, 500); // 0.5s delay before enabling scroll detection
            }, 100); // 100ms initial wait for layout

            /* REMOVED OLD SCROLL BLOCK */
        };

        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Unlock scroll
            const fab = document.getElementById('floatingActions');
            if (fab) fab.classList.remove('hidden'); // Show FABs

            // Reset reveal animation for next open
            const allGridItems = modalGrid.querySelectorAll('.anime-grid-item');
            allGridItems.forEach(item => item.classList.remove('visible'));
        };

        viewAllBtns.forEach(btn => btn.addEventListener('click', openModal));
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});
