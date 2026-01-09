(function () {
  const c2 = document.getElementById('carouselRight2');
  const c3 = document.getElementById('carouselRight3');
  if (!c2) return;
  requestAnimationFrame(() => {
    const nodes2 = Array.from(c2.children);
    if (nodes2.length === 0) return;
    c2.innerHTML = '';
    nodes2.reverse().forEach(n => c2.appendChild(n));
  });
  if (c3) {
    requestAnimationFrame(() => {
      const nodes3 = Array.from(c3.children);
      if (nodes3.length === 0) return;
      c3.innerHTML = '';
      nodes3.reverse().forEach(n => c3.appendChild(n));
    });
  }
})();

