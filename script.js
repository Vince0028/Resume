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
let vantaNetEffect = null; let vantaRingsEffect = null; const savedTheme = localStorage.getItem('theme'); const isLightMode = savedTheme === 'light'; const initialBgColor = isLightMode ? 0xf8fafc : 0x0a0e27; document.addEventListener('DOMContentLoaded', function () { if (window.VANTA && window.VANTA.NET) { vantaNetEffect = VANTA.NET({ el: "#vanta-bg", mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00, color: 0x6366f1, backgroundColor: initialBgColor, points: 10, maxDistance: 20, spacing: 15, showDots: true }); } if (window.VANTA && window.VANTA.RINGS) { vantaRingsEffect = VANTA.RINGS({ el: "#hero-vanta-bg", mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00, color: 0x6366f1, backgroundColor: initialBgColor, backgroundAlpha: 1 }); } }); const skills = [{ name: 'JavaScript', src: 'Images/javascript.png' }, { name: 'Python', src: 'Images/python.png' }, { name: 'HTML', src: 'Images/html.png' }, { name: 'Java', src: 'Images/java.png' }, { name: 'SQL', src: 'Images/sql.png' }, { name: 'CSS', src: 'Images/css.png' }]; console.log('Skills array loaded', skills.length); function populateRightCarousel(elementId, skillsArray) { const carousel = document.getElementById(elementId); if (!carousel) { console.error('Carousel element not found:', elementId); return; } const multiplied = []; for (let i = 0; i < 6; i++) { multiplied.push(...skillsArray); } console.log('Populating carousel', elementId, 'with', multiplied.length, 'items'); multiplied.forEach(skill => { const card = document.createElement('div'); card.className = 'skill-card-right'; const img = document.createElement('img'); img.src = skill.src; img.alt = skill.name; img.className = 'skill-icon-right'; img.onload = function () { console.log('Loaded:', skill.name); }; img.onerror = function () { console.error('Failed to load image:', skill.src); }; const nameDiv = document.createElement('div'); nameDiv.className = 'skill-name-right'; nameDiv.textContent = skill.name; card.appendChild(img); card.appendChild(nameDiv); carousel.appendChild(card); }); console.log('Total cards in', elementId, ':', carousel.children.length); } populateRightCarousel('carouselRight1', skills); populateRightCarousel('carouselRight2', skills); const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; const currentDateElement = document.getElementById('currentDate'); if (currentDateElement) { currentDateElement.textContent = new Date().toLocaleDateString('en-US', options); } const themeToggle = document.getElementById('themeToggle'); const body = document.body; if (isLightMode) { body.classList.add('light-mode'); themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i><span>Dark Mode</span>'; } themeToggle.addEventListener('click', () => { body.classList.toggle('light-mode'); if (body.classList.contains('light-mode')) { themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i><span>Dark Mode</span>'; localStorage.setItem('theme', 'light'); if (vantaNetEffect) { vantaNetEffect.setOptions({ color: 0x6366f1, backgroundColor: 0xf8fafc }); } if (vantaRingsEffect) { vantaRingsEffect.setOptions({ color: 0x6366f1, backgroundColor: 0xf8fafc }); } } else { themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i><span>Light Mode</span>'; localStorage.setItem('theme', 'dark'); if (vantaNetEffect) { vantaNetEffect.setOptions({ color: 0x6366f1, backgroundColor: 0x0a0e27 }); } if (vantaRingsEffect) { vantaRingsEffect.setOptions({ color: 0x6366f1, backgroundColor: 0x0a0e27 }); } } }); const mobileToggle = document.getElementById('mobileToggle'); const sidebar = document.getElementById('sidebar'); mobileToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); if (sidebar.classList.contains('active')) { document.body.style.overflow = 'hidden'; document.body.classList.add('sidebar-open'); } else { document.body.style.overflow = ''; document.body.classList.remove('sidebar-open'); } }); const navLinks = document.querySelectorAll('.nav-item-custom'); navLinks.forEach(link => { link.addEventListener('click', () => { if (window.innerWidth <= 991) { sidebar.classList.remove('active'); document.body.style.overflow = ''; document.body.classList.remove('sidebar-open'); } }); }); document.querySelectorAll('a[href^="#"]').forEach(anchor => { anchor.addEventListener('click', function (e) { e.preventDefault(); const target = document.querySelector(this.getAttribute('href')); if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }); }); document.querySelectorAll('.expertise-header').forEach(header => { header.addEventListener('click', function () { const dropdown = this.parentElement; const wasOpen = dropdown.classList.contains('open'); document.querySelectorAll('.expertise-dropdown').forEach(d => { d.classList.remove('open'); }); if (!wasOpen) { dropdown.classList.add('open'); } }); }); const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }; const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } }); }, observerOptions); document.querySelectorAll('.fade-in').forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; observer.observe(el); }); const mobileObserverOptions = { threshold: 0.1, rootMargin: '0px' }; const mobileObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting && window.innerWidth <= 991) { entry.target.classList.add('mobile-visible'); console.log('Right sidebar visible on mobile'); mobileObserver.unobserve(entry.target); } }); }, mobileObserverOptions); const rightSidebar = document.querySelector('.right-sidebar'); if (rightSidebar) { console.log('Right sidebar found, observing...'); mobileObserver.observe(rightSidebar); setTimeout(() => { if (window.innerWidth <= 991 && !rightSidebar.classList.contains('mobile-visible')) { console.log('Fallback trigger for mobile sidebar'); rightSidebar.classList.add('mobile-visible'); } }, 1000); } const projectObserver = new IntersectionObserver((entries) => { entries.forEach((entry, index) => { if (entry.isIntersecting) { setTimeout(() => { entry.target.classList.add('project-visible'); }, index * 150); projectObserver.unobserve(entry.target); } }); }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }); document.querySelectorAll('.expertise-item').forEach(item => { projectObserver.observe(item); });



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


		if (!originalSlides.length) return;


		const temp = originalSlides[0].cloneNode(true);
		temp.style.visibility = 'hidden';
		temp.style.position = 'absolute';

		document.body.appendChild(temp);
		const slideWidth = temp.offsetWidth;
		document.body.removeChild(temp);

		const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
		visibleCount = Math.max(1, Math.floor(containerWidth / (slideWidth + gap)));



		bufferSize = Math.max(visibleCount * 3, 5);



		const prefix = [];
		for (let i = 0; i < bufferSize; i++) {
			prefix.unshift(originalSlides[originalSlides.length - 1 - (i % originalSlides.length)].cloneNode(true));
		}

		const middle = originalSlides.map(n => n.cloneNode(true));

		const suffix = [];
		for (let i = 0; i < bufferSize; i++) {
			suffix.push(originalSlides[i % originalSlides.length].cloneNode(true));
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
		visibleCount = Math.max(1, Math.floor((containerWidth + gap) / (slideWidth + gap)));
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
		const move = (slideWidth + gap) * current;
		track.style.transform = `translateX(-${move}px)`;

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


	calcSizes();
	buildDots();
	update();
	resetAutoplay();
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
		input.focus();
		
		// Show formal greeting on first open
		if (!hasGreeted) {
			hasGreeted = true;
			appendMessage("Kamusta? I'm Vince Alobin, a second-year BSIT student at Asia Pacific College. Thank you for visiting my portfolio. How may I assist you today?", 'bot');
		}
	}

	function closePopup() {
		popup.classList.remove('open');
		popup.setAttribute('aria-hidden', 'true');
	}

	openBtn.addEventListener('click', openPopup);
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
		messagesEl.scrollTop = messagesEl.scrollHeight;
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
		messagesEl.scrollTop = messagesEl.scrollHeight;
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
			return; // cooldown UI already running
		}

		if (isWaitingForResponse) return;


		appendMessage(val, 'user');
		input.value = '';
		lastMessageTime = Date.now();
		isWaitingForResponse = true;
		startCooldown();


		showTypingIndicator();


		const reply = await callChatAPI(val);


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
