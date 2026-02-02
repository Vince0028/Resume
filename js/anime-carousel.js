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

    const femaleNames = ['Ai', 'Crimson', 'Delta', 'Frieren', 'Guita', 'Ichika', 'Komi', 'Mahiru', 'Masha', 'Milim', 'Mio', 'Nazuna', 'Shalltear', 'Shikimori', 'Waguri', 'Yoshiko'];
    const favoriteNames = ['Koenji', 'Masha'];

    const track = document.getElementById('animeTrack');
    const prevBtn = document.getElementById('animePrevBtn');
    const nextBtn = document.getElementById('animeNextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    let currentIndex = 0;


    characters.forEach(char => {
        const slide = document.createElement('div');
        slide.className = 'anime-slide';

        const name = char.replace('.png', '');


        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'anime-content-wrapper';

        const img = document.createElement('img');
        img.src = `../Images/anime_characters/${char}`;
        img.alt = name;
        img.className = 'anime-figurine';


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


    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }, 3000);


    setTimeout(updateCarousel, 100);
    window.addEventListener('resize', updateCarousel);



    const viewAllBtns = document.querySelectorAll('.view-all-header-btn, #viewAllAnimeBtn');
    const modal = document.getElementById('animeModal');
    const closeBtn = document.getElementById('closeAnimeModal');
    const modalGrid = document.getElementById('animeGrid');

    if (modal && closeBtn && modalGrid) {

        const openModal = () => {
            modal.style.display = 'flex';

            const modalContent = document.querySelector('.anime-modal-content');
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
            document.body.style.overflow = 'hidden';
            const fab = document.getElementById('floatingActions');
            if (fab) fab.classList.add('hidden');


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
                    }, 300);
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

                lightbox.offsetHeight;
                lightbox.classList.add('active');
            };


            if (modalGrid.children.length === 0) {

                const createGridItem = (char) => {
                    const gridItem = document.createElement('div');
                    gridItem.className = 'anime-grid-item';

                    const name = char.replace('.png', '');

                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.position = 'relative';
                    imgWrapper.style.width = '100%';
                    imgWrapper.style.cursor = 'zoom-in';

                    const img = document.createElement('img');
                    img.src = `../Images/anime_characters/${char}`;
                    img.alt = name;


                    imgWrapper.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showLightbox(`../Images/anime_characters/${char}`);
                    });

                    imgWrapper.appendChild(img);

                    const label = document.createElement('div');
                    label.textContent = name;

                    gridItem.appendChild(imgWrapper);
                    gridItem.appendChild(label);


                    if (favoriteNames.includes(name)) {
                        const favLabel = document.createElement('div');
                        favLabel.className = 'favorite-label-text';
                        favLabel.innerHTML = '<i class="bi bi-star-fill"></i> FAVORITE';
                        gridItem.appendChild(favLabel);

                        // Apply Electric Border
                        if (window.ElectricBorder) {
                            // Use setTimeout to ensure DOM is ready/dimensions are calculable
                            setTimeout(() => {
                                new ElectricBorder(gridItem, {
                                    color: '#6366f1',
                                    speed: 1,
                                    borderRadius: 16 // Match card border radius if known
                                });
                            }, 100);
                        }
                    }

                    return gridItem;
                };


                const females = characters.filter(c => femaleNames.includes(c.replace('.png', '')));
                const males = characters.filter(c => !femaleNames.includes(c.replace('.png', '')));


                const femaleHeader = document.createElement('h3');
                femaleHeader.className = 'anime-section-title';
                femaleHeader.textContent = 'Female';
                femaleHeader.style.color = '#fff';
                femaleHeader.style.marginTop = '1rem';
                femaleHeader.style.marginBottom = '1rem';
                femaleHeader.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                femaleHeader.style.paddingBottom = '0.5rem';

                const femaleGrid = document.createElement('div');
                femaleGrid.className = 'anime-grid';

                females.forEach(char => {
                    femaleGrid.appendChild(createGridItem(char));
                });

                modalGrid.appendChild(femaleHeader);
                modalGrid.appendChild(femaleGrid);


                const maleHeader = document.createElement('h3');
                maleHeader.className = 'anime-section-title';
                maleHeader.textContent = 'Male';
                maleHeader.style.color = '#fff';
                maleHeader.style.marginTop = '2rem';
                maleHeader.style.marginBottom = '1rem';
                maleHeader.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                maleHeader.style.paddingBottom = '0.5rem';

                const maleGrid = document.createElement('div');
                maleGrid.className = 'anime-grid';

                males.forEach(char => {
                    maleGrid.appendChild(createGridItem(char));
                });

                modalGrid.appendChild(maleHeader);
                modalGrid.appendChild(maleGrid);
            }




            const allGridItems = modalGrid.querySelectorAll('.anime-grid-item');
            allGridItems.forEach(item => {
                item.classList.remove('visible');
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px) scale(0.9)';
                item.style.transition = 'none';
            });


            void modalGrid.offsetHeight;


            setTimeout(() => {
                let delayCounter = 0;
                allGridItems.forEach((item) => {
                    const rect = item.getBoundingClientRect();

                    if (rect.top < window.innerHeight - 20) {
                        setTimeout(() => {
                            item.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0) scale(1)';
                            item.classList.add('visible');
                        }, delayCounter * 60);
                        delayCounter++;
                    }

                });



                setTimeout(() => {
                    const modalContent = document.querySelector('.anime-modal-content');
                    if (modalContent) {
                        modalContent.onscroll = () => {
                            const gridItems = modalGrid.querySelectorAll('.anime-grid-item');
                            gridItems.forEach(item => {

                                if (item.style.opacity === '0') {
                                    const rect = item.getBoundingClientRect();

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
                }, 500);
            }, 100);


        };

        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            const fab = document.getElementById('floatingActions');
            if (fab) fab.classList.remove('hidden');


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
