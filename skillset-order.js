(function () {
  const c2 = document.getElementById('carouselRight2');
  if (!c2) return;
  requestAnimationFrame(() => {
    const nodes = Array.from(c2.children);
    if (nodes.length === 0) return;
    c2.innerHTML = '';
    nodes.reverse().forEach(n => c2.appendChild(n));
  });
})();

