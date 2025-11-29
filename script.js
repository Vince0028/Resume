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

// Projects Carousel Logic (infinite loop via cloning)

(function () {
	const track = document.getElementById('projectsTrack');
	const prevBtn = document.getElementById('projectsPrevBtn');
	const nextBtn = document.getElementById('projectsNextBtn');
	if (!track || !prevBtn || !nextBtn) return;

	// store original slides (to rebuild on resize)
	const originalSlides = Array.from(track.children).map(n => n.cloneNode(true));
	let slides = [];
	let visibleCount = 1;
	let currentIndex = 0; // index into `slides`

	function buildLoop() {
		// clear track
		track.innerHTML = '';
		// measure using a temporary clone appended to body to get widths if necessary
		const container = document.querySelector('.projects-carousel-track-container');
		const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;

		// ensure we have at least one original slide
		if (!originalSlides.length) return;

		// append originals temporarily to measure slide width
		const temp = originalSlides[0].cloneNode(true);
		temp.style.visibility = 'hidden';
		temp.style.position = 'absolute';
		// Ensure it's not scaled for measurement, or use offsetWidth
		document.body.appendChild(temp);
		const slideWidth = temp.offsetWidth; // Use offsetWidth for unscaled width
		document.body.removeChild(temp);

		const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
		visibleCount = Math.max(1, Math.floor(containerWidth / (slideWidth + gap)));

		// clones: prepend last `visibleCount`, then originals, then first `visibleCount`
		const prefix = originalSlides.slice(-visibleCount).map(n => n.cloneNode(true));
		const middle = originalSlides.map(n => n.cloneNode(true));
		const suffix = originalSlides.slice(0, visibleCount).map(n => n.cloneNode(true));

		prefix.forEach(n => track.appendChild(n));
		middle.forEach(n => track.appendChild(n));
		suffix.forEach(n => track.appendChild(n));

		slides = Array.from(track.children);

		// start at the first original (after prefix)
		currentIndex = visibleCount;
		// jump to position without transition
		track.style.transition = 'none';
		updateCarousel();
		// allow transition for subsequent moves
		requestAnimationFrame(() => { track.style.transition = ''; });
	}

	function updateCarousel() {
		if (!slides.length) return;
		const container = document.querySelector('.projects-carousel-track-container');
		const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;
		const slideWidth = slides[0].offsetWidth; // Use offsetWidth
		const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
		// Calculate translate so that the center visible slide is centered in the container
		const centerOffset = Math.floor(visibleCount / 2);
		const centerIndex = currentIndex + centerOffset;
		const translateForCenter = (slideWidth + gap) * centerIndex - (containerWidth - slideWidth) / 2;
		track.style.transform = `translateX(-${translateForCenter}px)`;

		// highlight center active slide (directly target the visible slide)
		// We calculate the center based on the viewport, which corresponds to centerIndex
		// However, we need to be careful if visibleCount is different from what's actually visible on screen
		// But assuming visibleCount is calculated based on container width, centerIndex should be the middle one.

		const visibleSlidesOnScreen = Math.floor(containerWidth / (slideWidth + gap));
		// We want the slide that is physically in the middle of the screen
		// The translation aligns `slides[centerIndex]` to the center.
		// So `slides[centerIndex]` is the one we want to highlight.

		slides.forEach(s => s.classList.remove('active'));
		if (slides[centerIndex]) {
			slides[centerIndex].classList.add('active');
		}
	}

	function onTransitionEnd() {
		// if we've moved into suffix clones, jump back to the matching original
		if (currentIndex >= slides.length - visibleCount) {
			track.style.transition = 'none';
			// Preserve the offset into the suffix
			currentIndex -= originalSlides.length;
			updateCarousel();
			requestAnimationFrame(() => { track.style.transition = ''; });
		}
		// if we've moved into prefix clones at the start, jump to the matching original at the end
		if (currentIndex < visibleCount) {
			track.style.transition = 'none';
			// Preserve the offset into the prefix
			currentIndex += originalSlides.length;
			updateCarousel();
			requestAnimationFrame(() => { track.style.transition = ''; });
		}
	}

	nextBtn.addEventListener('click', () => {
		if (!slides.length) return;
		currentIndex++;
		updateCarousel();
	});

	prevBtn.addEventListener('click', () => {
		if (!slides.length) return;
		currentIndex--;
		updateCarousel();
	});

	track.addEventListener('transitionend', onTransitionEnd);

	// rebuild on resize to recalculate visibleCount and clones
	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			buildLoop();
		}, 120);
	});

	// initial build
	window.addEventListener('load', () => { setTimeout(buildLoop, 80); });
	buildLoop();

})();
