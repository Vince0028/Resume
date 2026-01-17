(function () {
	const skillSet = document.getElementById('rightSkillSet');
	const rightSidebarEl = document.querySelector('.right-sidebar');
	const expertiseMain = document.getElementById('expertise');
	if (!skillSet || !rightSidebarEl || !expertiseMain) return;
	const placeholder = document.createElement('div');
	placeholder.id = 'skillSetPlaceholder';
	skillSet.parentNode.insertBefore(placeholder, skillSet);
	function placeForViewport() {
		if (window.innerWidth <= 991) {
			if (skillSet.parentNode !== expertiseMain.parentNode) {
				expertiseMain.parentNode.insertBefore(skillSet, expertiseMain);
			} else {
				expertiseMain.parentNode.insertBefore(skillSet, expertiseMain);
			}
			skillSet.classList.add('as-main-section');
		} else {
			if (placeholder.parentNode) {
				placeholder.parentNode.insertBefore(skillSet, placeholder.nextSibling);
			} else {
				rightSidebarEl.insertBefore(skillSet, rightSidebarEl.firstChild);
			}
			skillSet.classList.remove('as-main-section');
		}
	}
	placeForViewport();
	let resizeTimer = null; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(placeForViewport, 150); });
})();
const certThumb = document.getElementById('nc2CertThumb');
const certOverlay = document.getElementById('certOverlay');
const certClose = document.getElementById('certClose');
function closeCert() {
	if (certOverlay) {
		certOverlay.classList.remove('open');
		document.body.style.overflow = '';
	}
}
if (certThumb && certOverlay && certClose) {
	certThumb.addEventListener('click', () => {
		certOverlay.classList.add('open');
		document.body.style.overflow = 'hidden';
		const frame = document.querySelector('#certOverlay .cert-image-frame');
		frame && frame.classList.add('scroll-enabled');
	});
	certClose.addEventListener('click', closeCert);
	certOverlay.addEventListener('click', e => { if (e.target === certOverlay) { closeCert(); } });
	document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCert(); } });
}
const certImg = document.getElementById('certFullImg');
const imgFrame = certImg ? certImg.parentElement : null;
if (certImg && imgFrame) {
	certImg.addEventListener('click', () => { imgFrame.classList.add('scroll-enabled'); });
	certClose.addEventListener('click', () => { imgFrame.classList.remove('scroll-enabled'); imgFrame.classList.remove('fullscreen'); document.querySelector('#certOverlay .cert-content')?.classList.remove('fullscreen'); });
	certOverlay.addEventListener('click', e => { if (e.target === certOverlay) { imgFrame.classList.remove('scroll-enabled'); imgFrame.classList.remove('fullscreen'); document.querySelector('#certOverlay .cert-content')?.classList.remove('fullscreen'); } });
	document.addEventListener('keydown', e => { if (e.key === 'Escape') { imgFrame.classList.remove('scroll-enabled'); imgFrame.classList.remove('fullscreen'); document.querySelector('#certOverlay .cert-content')?.classList.remove('fullscreen'); } });
	const fsBtn = document.getElementById('certFullscreen');
	const certContent = document.querySelector('#certOverlay .cert-content');
	if (fsBtn && certContent) {
		fsBtn.addEventListener('click', () => {
			certContent.classList.toggle('fullscreen');
			imgFrame.classList.toggle('fullscreen');
			imgFrame.classList.add('scroll-enabled');
		});
	}
}
let vantaNetEffect = null; let vantaRingsEffect = null; const savedTheme = localStorage.getItem('theme'); const isLightMode = savedTheme === 'light'; const initialBgColor = isLightMode ? 0xf8fafc : 0x0a0e27; document.addEventListener('DOMContentLoaded', function () { if (window.VANTA && window.VANTA.NET) { vantaNetEffect = VANTA.NET({ el: "#vanta-bg", mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00, color: 0x6366f1, backgroundColor: initialBgColor, points: 10, maxDistance: 20, spacing: 15, showDots: true }); } if (window.VANTA && window.VANTA.RINGS) { vantaRingsEffect = VANTA.RINGS({ el: "#hero-vanta-bg", mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00, color: 0x6366f1, backgroundColor: initialBgColor, backgroundAlpha: 1 }); } }); const skills = [{ name: 'JavaScript', src: '../Images/javascript.png' }, { name: 'Python', src: '../Images/python.png' }, { name: 'HTML', src: '../Images/html.png' }, { name: 'Java', src: '../Images/java.png' }, { name: 'SQL', src: '../Images/sql.png' }, { name: 'CSS', src: '../Images/css.png' }]; console.log('Skills array loaded', skills.length); function populateRightCarousel(elementId, skillsArray, offset = 0) { const carousel = document.getElementById(elementId); if (!carousel) { console.error('Carousel element not found:', elementId); return; } const multiplied = []; for (let i = 0; i < 9; i++) { multiplied.push(...skillsArray); } console.log('Populating carousel', elementId, 'with', multiplied.length, 'items'); let startIndex = (offset * 2) % multiplied.length; multiplied.forEach((skill, index) => { const actualIndex = (startIndex + index) % multiplied.length; const actualSkill = multiplied[actualIndex]; const card = document.createElement('div'); card.className = 'skill-card-right'; const img = document.createElement('img'); img.src = actualSkill.src; img.alt = actualSkill.name; img.className = 'skill-icon-right'; img.onload = function () { console.log('Loaded:', actualSkill.name); }; img.onerror = function () { console.error('Failed to load image:', actualSkill.src); }; const nameDiv = document.createElement('div'); nameDiv.className = 'skill-name-right'; nameDiv.textContent = actualSkill.name; card.appendChild(img); card.appendChild(nameDiv); carousel.appendChild(card); }); console.log('Total cards in', elementId, ':', carousel.children.length); } populateRightCarousel('carouselRight1', skills, 0); populateRightCarousel('carouselRight2', skills, 1); populateRightCarousel('carouselRight3', skills, 2); const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; const currentDateElement = document.getElementById('currentDate'); if (currentDateElement) { currentDateElement.textContent = new Date().toLocaleDateString('en-US', options); } const themeToggle = document.getElementById('themeToggle'); const body = document.body; if (isLightMode) { body.classList.add('light-mode'); themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i><span>Dark Mode</span>'; } themeToggle.addEventListener('click', () => { body.classList.toggle('light-mode'); if (body.classList.contains('light-mode')) { themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i><span>Dark Mode</span>'; localStorage.setItem('theme', 'light'); if (vantaNetEffect) { vantaNetEffect.setOptions({ color: 0x6366f1, backgroundColor: 0xf8fafc }); } if (vantaRingsEffect) { vantaRingsEffect.setOptions({ color: 0x6366f1, backgroundColor: 0xf8fafc }); } } else { themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i><span>Light Mode</span>'; localStorage.setItem('theme', 'dark'); if (vantaNetEffect) { vantaNetEffect.setOptions({ color: 0x6366f1, backgroundColor: 0x0a0e27 }); } if (vantaRingsEffect) { vantaRingsEffect.setOptions({ color: 0x6366f1, backgroundColor: 0x0a0e27 }); } } }); const mobileToggle = document.getElementById('mobileToggle'); const sidebar = document.getElementById('sidebar'); mobileToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); if (sidebar.classList.contains('active')) { document.body.style.overflow = 'hidden'; document.body.classList.add('sidebar-open'); } else { document.body.style.overflow = ''; document.body.classList.remove('sidebar-open'); } }); const navLinks = document.querySelectorAll('.nav-item-custom'); navLinks.forEach(link => { link.addEventListener('click', () => { if (window.innerWidth <= 991) { sidebar.classList.remove('active'); document.body.style.overflow = ''; document.body.classList.remove('sidebar-open'); } }); }); document.querySelectorAll('a[href^="#"]').forEach(anchor => { anchor.addEventListener('click', function (e) { e.preventDefault(); const target = document.querySelector(this.getAttribute('href')); if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }); }); document.querySelectorAll('.expertise-header').forEach(header => { header.addEventListener('click', function () { const dropdown = this.parentElement; const wasOpen = dropdown.classList.contains('open'); document.querySelectorAll('.expertise-dropdown').forEach(d => { d.classList.remove('open'); }); if (!wasOpen) { dropdown.classList.add('open'); } }); }); const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }; const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } }); }, observerOptions); document.querySelectorAll('.fade-in').forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; observer.observe(el); }); const mobileObserverOptions = { threshold: 0.1, rootMargin: '0px' }; const mobileObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting && window.innerWidth <= 991) { entry.target.classList.add('mobile-visible'); console.log('Right sidebar visible on mobile'); mobileObserver.unobserve(entry.target); } }); }, mobileObserverOptions); const rightSidebar = document.querySelector('.right-sidebar'); if (rightSidebar) { console.log('Right sidebar found, observing...'); mobileObserver.observe(rightSidebar); setTimeout(() => { if (window.innerWidth <= 991 && !rightSidebar.classList.contains('mobile-visible')) { console.log('Fallback trigger for mobile sidebar'); rightSidebar.classList.add('mobile-visible'); } }, 1000); } const projectObserver = new IntersectionObserver((entries) => { entries.forEach((entry, index) => { if (entry.isIntersecting) { setTimeout(() => { entry.target.classList.add('project-visible'); }, index * 150); projectObserver.unobserve(entry.target); } }); }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }); document.querySelectorAll('.expertise-item').forEach(item => { projectObserver.observe(item); });



(function () {
	const track = document.getElementById('projectsTrack');
	const prevBtn = document.getElementById('projectsPrevBtn');
	const nextBtn = document.getElementById('projectsNextBtn');
	if (!track || !prevBtn || !nextBtn) return;


	const originalSlides = Array.from(track.children).map(n => n.cloneNode(true));
	let slides = [];
	let visibleCount = 1;
	let bufferSize = 1;
	let currentIndex = 0;

	function buildLoop() {

		track.innerHTML = '';

		const container = document.querySelector('.projects-carousel-track-container');
		const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;

		let slideWidth = containerWidth * 0.78;
		if (window.innerWidth <= 1200) slideWidth = containerWidth * 0.8;
		if (window.innerWidth <= 992) slideWidth = containerWidth * 0.92;
		if (window.innerWidth <= 768) slideWidth = containerWidth * 0.98;
		slideWidth = Math.min(Math.max(slideWidth, 360), 760);

		const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
		visibleCount = 1;

		bufferSize = 5;

		const createWrapper = (originalNode) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'project-slide-wrapper';
			wrapper.style.width = slideWidth + 'px';
			wrapper.style.minWidth = slideWidth + 'px';
			wrapper.style.display = 'flex';
			wrapper.style.justifyContent = 'center';
			wrapper.style.alignItems = 'center';
			wrapper.style.padding = '0 4px';

			const node = originalNode.cloneNode(true);
			node.style.width = '100%';
			node.style.maxWidth = '820px';
			node.style.margin = '0 auto';

			wrapper.appendChild(node);
			return wrapper;
		};

		const prefix = [];
		for (let i = 0; i < bufferSize; i++) {
			prefix.unshift(createWrapper(originalSlides[originalSlides.length - 1 - (i % originalSlides.length)]));
		}

		const middle = originalSlides.map(n => createWrapper(n));

		const suffix = [];
		for (let i = 0; i < bufferSize; i++) {
			suffix.push(createWrapper(originalSlides[i % originalSlides.length]));
		}

		prefix.forEach(n => track.appendChild(n));
		middle.forEach(n => track.appendChild(n));
		suffix.forEach(n => track.appendChild(n));

		slides = Array.from(track.children);


		currentIndex = bufferSize;

		track.style.transition = 'none';
		updateCarousel();

		requestAnimationFrame(() => { track.style.transition = ''; });
	}

	function updateCarousel() {
		if (!slides.length) return;
		const container = document.querySelector('.projects-carousel-track-container');
		const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;
		const slideWidth = slides[0].offsetWidth;
		const gap = parseFloat(window.getComputedStyle(track).gap) || 0;



		const centerOffset = Math.floor(visibleCount / 2);
		const centerIndex = currentIndex + centerOffset;
		const translateForCenter = (slideWidth + gap) * centerIndex - (containerWidth - slideWidth) / 2;
		track.style.transform = `translateX(-${translateForCenter}px)`;


		slides.forEach(s => s.classList.remove('active'));
		if (slides[centerIndex]) {
			slides[centerIndex].classList.add('active');
		}
	}

	function onTransitionEnd() {

		if (currentIndex >= slides.length - bufferSize) {
			track.style.transition = 'none';

			void track.offsetWidth;





			currentIndex -= originalSlides.length;

			while (currentIndex >= slides.length - bufferSize) {
				currentIndex -= originalSlides.length;
			}

			updateCarousel();
			requestAnimationFrame(() => { track.style.transition = ''; });
		}

		if (currentIndex < bufferSize) {
			track.style.transition = 'none';

			void track.offsetWidth;

			currentIndex += originalSlides.length;

			while (currentIndex < bufferSize) {
				currentIndex += originalSlides.length;
			}

			updateCarousel();
			requestAnimationFrame(() => { track.style.transition = ''; });
		}
	}


	const AUTOPLAY_INTERVAL = 3000;
	let autoplayTimer = null;

	function startAutoplay() {
		stopAutoplay();
		autoplayTimer = setInterval(() => {
			if (!slides.length) return;
			currentIndex++;
			updateCarousel();
		}, AUTOPLAY_INTERVAL);
	}

	function stopAutoplay() {
		if (autoplayTimer) {
			clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
	}

	nextBtn.addEventListener('click', () => {
		if (!slides.length) return;
		currentIndex++;
		updateCarousel();

		startAutoplay();
	});

	prevBtn.addEventListener('click', () => {
		if (!slides.length) return;
		currentIndex--;
		updateCarousel();
		startAutoplay();
	});


	const projectsContainer = document.querySelector('.projects-carousel-track-container');
	if (projectsContainer) {
		projectsContainer.addEventListener('mouseenter', stopAutoplay);
		projectsContainer.addEventListener('mouseleave', () => startAutoplay());
	}



	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let currentTranslate = 0;
	let prevTranslate = 0;
	let animationID = 0;
	let initialTouch = null;

	function getPositionX(event) {
		return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
	}

	function getPositionY(event) {
		return event.type.includes('mouse') ? event.pageY : event.touches[0].clientY;
	}

	function touchStart(event) {
		initialTouch = { x: getPositionX(event), y: getPositionY(event) };
		startX = getPositionX(event);
		startY = getPositionY(event);
		isDragging = false;
		stopAutoplay();
	}

	function touchMove(event) {
		if (!initialTouch) return;

		const currentX = getPositionX(event);
		const currentY = getPositionY(event);
		const diffX = Math.abs(currentX - initialTouch.x);
		const diffY = Math.abs(currentY - initialTouch.y);


		if (diffX > diffY && diffX > 5) {
			if (!isDragging) {
				isDragging = true;
				track.style.cursor = 'grabbing';
			}
			event.preventDefault();
			const currentPosition = getPositionX(event);
			currentTranslate = currentPosition - startX;

			const container = document.querySelector('.projects-carousel-track-container');
			const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;
			const slideWidth = slides[0]?.offsetWidth || 0;
			const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
			const centerOffset = Math.floor(visibleCount / 2);
			const centerIndex = currentIndex + centerOffset;
			const baseTranslate = (slideWidth + gap) * centerIndex - (containerWidth - slideWidth) / 2;

			track.style.transition = 'none';
			track.style.transform = `translateX(-${baseTranslate - currentTranslate}px)`;
		}
	}

	function touchEnd() {
		if (!initialTouch) return;

		if (isDragging) {
			isDragging = false;
			track.style.cursor = 'grab';

			const movedBy = currentTranslate;


			if (movedBy < -50) {
				currentIndex++;
			} else if (movedBy > 50) {
				currentIndex--;
			}

			track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
			updateCarousel();
		}

		prevTranslate = 0;
		currentTranslate = 0;
		initialTouch = null;

		setTimeout(() => startAutoplay(), 100);
	}


	if (projectsContainer) {
		projectsContainer.addEventListener('touchstart', touchStart, { passive: false });
		projectsContainer.addEventListener('touchmove', touchMove, { passive: false });
		projectsContainer.addEventListener('touchend', touchEnd);
		projectsContainer.addEventListener('touchcancel', touchEnd);


		projectsContainer.addEventListener('mousedown', touchStart);
		projectsContainer.addEventListener('mousemove', touchMove);
		projectsContainer.addEventListener('mouseup', touchEnd);
		projectsContainer.addEventListener('mouseleave', touchEnd);
	}


	startAutoplay();

	track.addEventListener('transitionend', onTransitionEnd);


	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			buildLoop();
		}, 120);
	});


	window.addEventListener('load', () => { setTimeout(buildLoop, 80); });
	buildLoop();

})();


(function () {
	const track = document.getElementById('educationTrack');
	const prevBtn = document.getElementById('eduPrevBtn');
	const nextBtn = document.getElementById('eduNextBtn');
	const dotsWrap = document.getElementById('eduDots');
	if (!track || !prevBtn || !nextBtn) return;

	const slides = Array.from(track.children);
	let current = 0;
	let autoplayTimer = null;
	let visibleCount = 1;

	function getGap() {
		const style = window.getComputedStyle(track);
		return parseFloat(style.gap) || 0;
	}

	function calcSizes() {
		const container = document.querySelector('.education-track-container');
		const containerWidth = container ? container.getBoundingClientRect().width : track.offsetWidth;
		const slideWidth = slides[0] ? slides[0].getBoundingClientRect().width : containerWidth;
		const gap = getGap();


		visibleCount = window.innerWidth <= 991 ? 1 : slides.length;

		return { containerWidth, slideWidth, gap };
	}

	function buildDots() {
		if (!dotsWrap) return;
		dotsWrap.innerHTML = '';
		const pages = Math.max(1, slides.length - visibleCount + 1);
		for (let i = 0; i < pages; i++) {
			const d = document.createElement('button');
			d.type = 'button';
			d.className = 'edu-dot';
			d.setAttribute('aria-label', 'Go to page ' + (i + 1));
			d.addEventListener('click', () => { goTo(i); });
			dotsWrap.appendChild(d);
		}
	}

	function update() {
		if (!slides.length) return;
		const { slideWidth, gap } = calcSizes();

		if (visibleCount >= slides.length) {
			track.style.transform = 'translateX(0)';
		} else {
			const move = (slideWidth + gap) * current;
			track.style.transform = `translateX(-${move}px)`;
		}

		const dots = dotsWrap ? Array.from(dotsWrap.children) : [];
		dots.forEach((d, i) => d.classList.toggle('active', i === current));

		slides.forEach(s => s.classList.remove('active'));
		const centerOffset = Math.floor(visibleCount / 2);
		const centerIndex = Math.min(slides.length - 1, current + centerOffset);
		if (slides[centerIndex]) slides[centerIndex].classList.add('active');
	}

	function goTo(i) {
		const pages = Math.max(1, slides.length - visibleCount + 1);
		current = Math.max(0, Math.min(pages - 1, i));
		update();
		resetAutoplay();
	}

	function next() { const pages = Math.max(1, slides.length - visibleCount + 1); goTo((current + 1) % pages); }
	function prev() { const pages = Math.max(1, slides.length - visibleCount + 1); goTo((current - 1 + pages) % pages); }

	prevBtn.addEventListener('click', prev);
	nextBtn.addEventListener('click', next);
	window.addEventListener('resize', () => { setTimeout(() => { calcSizes(); buildDots(); update(); }, 120); });
	document.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); });

	function resetAutoplay() {
		if (autoplayTimer) clearInterval(autoplayTimer);
		autoplayTimer = setInterval(next, 6000);
	}


	const eduContainer = document.querySelector('.education-track-container');
	let touchStartX = 0;
	let touchEndX = 0;
	let isDragging = false;

	const handleSwipe = () => {
		const swipeThreshold = 50;
		const diff = touchStartX - touchEndX;

		if (Math.abs(diff) > swipeThreshold) {
			if (diff > 0) {

				next();
			} else {

				prev();
			}
		}
	};

	if (eduContainer) {
		eduContainer.addEventListener('touchstart', (e) => {
			touchStartX = e.changedTouches[0].screenX;
			isDragging = true;
			if (autoplayTimer) clearInterval(autoplayTimer);
		}, { passive: true });

		eduContainer.addEventListener('touchmove', (e) => {
			if (!isDragging) return;
			touchEndX = e.changedTouches[0].screenX;
		}, { passive: true });

		eduContainer.addEventListener('touchend', () => {
			if (isDragging) {
				handleSwipe();
				isDragging = false;
				resetAutoplay();
			}
		}, { passive: true });
	}

	calcSizes();
	buildDots();
	current = 0;
	update();
	resetAutoplay();
})();


(function () {
	const track = document.querySelector('.movies-track');
	const container = document.querySelector('.movies-track-container');
	if (!track || !container) return;

	const slides = Array.from(track.children);
	let current = 0;
	let visibleCount = 1;
	const MOVIE_TRANSITION = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';

	function getGap() {
		const style = window.getComputedStyle(track);
		return parseFloat(style.gap || style.columnGap) || 0;
	}

	function calcSizes() {
		const containerWidth = container.clientWidth;
		const gap = getGap();
		visibleCount = window.innerWidth <= 991 ? 1 : slides.length;
		const slideWidth = containerWidth;
		return { slideWidth, gap };
	}

	function update() {
		if (!slides.length) return;
		const { slideWidth, gap } = calcSizes();
		if (visibleCount >= slides.length) {
			track.style.transform = 'translateX(0)';
			track.style.transition = '';
			return;
		}
		const move = (slideWidth + gap) * current;
		track.style.transition = MOVIE_TRANSITION;
		track.style.transform = `translateX(-${move}px)`;
		slides.forEach((s, i) => s.classList.toggle('active', i === current));
	}

	function clamp() {
		const pages = Math.max(1, slides.length - visibleCount + 1);
		current = Math.min(Math.max(0, current), pages - 1);
	}

	function next() { const pages = Math.max(1, slides.length - visibleCount + 1); current = (current + 1) % pages; update(); }
	function prev() { const pages = Math.max(1, slides.length - visibleCount + 1); current = (current - 1 + pages) % pages; update(); }

	let isDragging = false;
	let startX = 0;
	let deltaX = 0;

	function onStart(e) {
		if (window.innerWidth > 991) return;
		isDragging = true;
		deltaX = 0;
		startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
	}

	function onMove(e) {
		if (!isDragging) return;
		const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
		deltaX = x - startX;
		const { slideWidth, gap } = calcSizes();
		const move = (slideWidth + gap) * current - deltaX;
		track.style.transition = 'none';
		track.style.transform = `translateX(-${move}px)`;
	}

	function onEnd() {
		if (!isDragging) return;
		track.style.transition = MOVIE_TRANSITION;
		if (deltaX < -50) next();
		else if (deltaX > 50) prev();
		else update();
		isDragging = false;
		deltaX = 0;
	}

	container.addEventListener('touchstart', onStart, { passive: true });
	container.addEventListener('touchmove', onMove, { passive: true });
	container.addEventListener('touchend', onEnd, { passive: true });
	container.addEventListener('touchcancel', onEnd, { passive: true });
	container.addEventListener('mousedown', (e) => { onStart(e); });
	container.addEventListener('mousemove', onMove);
	container.addEventListener('mouseup', onEnd);
	container.addEventListener('mouseleave', onEnd);

	window.addEventListener('resize', () => { clamp(); update(); });
	window.addEventListener('load', () => { clamp(); update(); });
	update();
})();


(function () {
	const openBtn = document.getElementById('openMessengerBtn');
	const closeBtn = document.getElementById('closeMessengerBtn');
	const popup = document.getElementById('messengerPopup');
	const form = document.getElementById('messengerForm');
	const input = document.getElementById('messageInput');
	const messagesEl = document.getElementById('messages');

	if (!openBtn || !popup || !form || !input || !messagesEl) return;

	let isWaitingForResponse = false;
	let lastMessageTime = 0;
	const RATE_LIMIT_MS = 3000;
	let cooldownTimer = null;
	let hasGreeted = false;

	function openPopup() {
		popup.classList.add('open');
		popup.setAttribute('aria-hidden', 'false');
		document.body.classList.add('chat-open'); 
		input.focus();

		if (!hasGreeted) {
			hasGreeted = true;
			appendMessage("Kamusta? I'm Vince Alobin, a second-year BSIT student at Asia Pacific College. Thank you for visiting my portfolio. How may I assist you today?", 'bot');
		}
	}

	function closePopup() {
		popup.classList.remove('open');
		popup.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('chat-open'); 
	}

	openBtn.addEventListener('click', (e) => {
		console.log('=== Chat button clicked ===');
		console.log('Popup element:', popup);
		console.log('Popup classes:', popup.classList.toString());
		console.log('Has open class:', popup.classList.contains('open'));

		if (popup.classList.contains('open')) {
			console.log('Calling closePopup()');
			closePopup();
		} else {
			console.log('Calling openPopup()');
			openPopup();
		}
	});


	const openBtnMobile = document.getElementById('openMessengerBtnMobile');
	if (openBtnMobile) {
		openBtnMobile.addEventListener('click', () => {
			openPopup();

			const sidebar = document.getElementById('sidebar');
			if (sidebar && sidebar.classList.contains('active')) {
				sidebar.classList.remove('active');
				document.body.style.overflow = '';
				document.body.classList.remove('sidebar-open');
			}
		});
	}

	closeBtn && closeBtn.addEventListener('click', closePopup);


	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			closePopup();
		}
	});

	function appendMessage(text, who = 'user') {
		const msg = document.createElement('div');
		msg.className = 'message ' + (who === 'user' ? 'user' : 'bot');

		msg.textContent = text;
		messagesEl.appendChild(msg);
		msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}

	function startCooldown() {
		const endAt = Date.now() + RATE_LIMIT_MS;
		input.disabled = true;
		input.placeholder = 'Please wait 3s...';
		if (cooldownTimer) clearInterval(cooldownTimer);
		cooldownTimer = setInterval(() => {
			const diff = Math.max(0, endAt - Date.now());
			const secs = Math.ceil(diff / 1000);
			input.placeholder = `Please wait ${secs}s...`;
			if (diff <= 0) {
				clearInterval(cooldownTimer);
				cooldownTimer = null;
				input.disabled = false;
				input.placeholder = 'Type a message...';
			}
		}, 200);
	}

	function showTypingIndicator() {
		const indicator = document.createElement('div');
		indicator.className = 'typing-indicator';
		indicator.id = 'typingIndicator';
		indicator.innerHTML = `
				<div class="typing-dot"></div>
				<div class="typing-dot"></div>
				<div class="typing-dot"></div>
			`;
		messagesEl.appendChild(indicator);
		indicator.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}

	function removeTypingIndicator() {
		const indicator = document.getElementById('typingIndicator');
		if (indicator) {
			indicator.remove();
		}
	}

	function collectHistory(max = 12) {
		const items = Array.from(messagesEl.querySelectorAll('.message'));
		const history = items.slice(-max).map(el => ({
			role: el.classList.contains('user') ? 'user' : 'assistant',
			content: el.textContent || ''
		}));
		return history;
	}

	async function callChatAPI(message) {
		try {
			const history = collectHistory(12);
			const response = await fetch('/api/ai-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message, history, provider: 'groq' })
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();
			return data.reply;
		} catch (error) {
			console.error('Chat API Error:', error);
			return "Sorry, I'm having trouble connecting right now. Please try again later.";
		}
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const val = input.value && input.value.trim();
		if (!val) return;


		const now = Date.now();
		if (now - lastMessageTime < RATE_LIMIT_MS) {
			return;
		}

		if (isWaitingForResponse) return;


		appendMessage(val, 'user');
		input.value = '';
		lastMessageTime = Date.now();
		isWaitingForResponse = true;
		startCooldown();


		showTypingIndicator();

		const randomDelay = Math.floor(Math.random() * 3000) + 2000;

		const [reply] = await Promise.all([
			callChatAPI(val),
			new Promise(resolve => setTimeout(resolve, randomDelay))
		]);

		removeTypingIndicator();
		appendMessage(reply, 'bot');
		isWaitingForResponse = false;
	});
})();


(function () {
	const openBtn = document.getElementById('openMessengerBtn');
	if (!openBtn) return;

	openBtn.classList.add('attention');
	setTimeout(() => openBtn.classList.remove('attention'), 7000);
})();
