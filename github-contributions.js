// GitHub contributions renderer with lightweight skeleton, caching, and timeout
document.addEventListener('DOMContentLoaded', async function() {
  const username = 'Vince0028';
  const calendarEl = document.getElementById('github-calendar');
  if (!calendarEl) return;

  // Fast skeleton so UI feels instant
  function renderSkeleton() {
    const skeleton = `
      <div class="contrib-header">Loading contributions...</div>
      <div class="contrib-calendar">
        <div class="contrib-months"></div>
        <div class="contrib-days">
          <span style="grid-row: 2;">Mon</span>
          <span style="grid-row: 4;">Wed</span>
          <span style="grid-row: 6;">Fri</span>
        </div>
        <div class="contrib-grid">${'<div class="contrib-week">' + '<div class="contrib-day empty"></div>'.repeat(7) + '</div>'.repeat(26)}</div>
        <div class="contrib-legend">
          <span>Less</span>
          <div class="contrib-day level-0"></div>
          <div class="contrib-day level-1"></div>
          <div class="contrib-day level-2"></div>
          <div class="contrib-day level-3"></div>
          <div class="contrib-day level-4"></div>
          <span>More</span>
        </div>
      </div>
    `;
    calendarEl.innerHTML = skeleton;
  }

  // Try to load from cache (valid for 24 hours)
  const cacheKey = 'gh_contribs_' + username;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.ts && Date.now() - parsed.ts < 24*60*60*1000 && parsed.html) {
        calendarEl.innerHTML = parsed.html;
        return; // cached render is good enough for now
      }
    }
  } catch (e) { /* ignore storage errors */ }

  renderSkeleton();

  // Fetch with timeout and cache result
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const resp = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error('Network error');
    const data = await resp.json();
    if (!data || !data.contributions) throw new Error('No data');

    const contributions = data.contributions.slice();
    const totalContributions = data.total ? data.total[Object.keys(data.total)[0]] : 0;

    // Append future empty days until end of year to keep grid full
    const lastDate = new Date(contributions[contributions.length - 1].date);
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    let currentDate = new Date(lastDate);
    currentDate.setDate(currentDate.getDate() + 1);
    while (currentDate <= endOfYear) {
      contributions.push({ date: currentDate.toISOString().split('T')[0], count: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Build weeks (each week is an array of days starting Sunday)
    const weeks = [];
    let week = [];
    contributions.forEach((d, idx) => {
      const dt = new Date(d.date);
      const dow = dt.getDay();
      week[dow] = d; // place by day index
      if (dow === 6 || idx === contributions.length - 1) {
        // finalize week
        weeks.push(week.slice());
        week = [];
      }
    });

    // Build html
    let html = `<div class="contrib-header">${(totalContributions||0).toLocaleString()} contributions in the last year</div>`;
    html += `<div class="contrib-calendar">`;
    html += `<div class="contrib-months">`;
    // naive month labels at week positions
    const monthPositions = {};
    weeks.forEach((w, i) => {
      for (let j = 0; j < 7; j++) {
        const day = w[j];
        if (day) {
          const dt = new Date(day.date);
          const key = `${dt.getFullYear()}-${dt.getMonth()}`;
          if (!(key in monthPositions)) monthPositions[key] = i;
        }
      }
    });
    Object.keys(monthPositions).forEach(k => {
      const i = monthPositions[k];
      const year = parseInt(k.split('-')[0],10);
      const month = parseInt(k.split('-')[1],10);
      const label = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' });
      const left = i * 14.5;
      html += `<span style="left:${left}px">${label}</span>`;
    });
    html += `</div>`;

    html += `<div class="contrib-days">`;
    html += `<span style="grid-row: 2;">Mon</span>`;
    html += `<span style="grid-row: 4;">Wed</span>`;
    html += `<span style="grid-row: 6;">Fri</span>`;
    html += `</div>`;

    html += `<div class="contrib-grid">`;
    weeks.forEach(w => {
      html += `<div class="contrib-week">`;
      for (let i = 0; i < 7; i++) {
        const day = w[i];
        if (!day) { html += `<div class="contrib-day empty"></div>`; continue; }
        const c = day.count || 0;
        const level = c === 0 ? 0 : c < 3 ? 1 : c < 6 ? 2 : c < 10 ? 3 : 4;
        const dt = new Date(day.date);
        const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        html += `<div class="contrib-day level-${level}" data-count="${c}" data-date="${dateStr}" title="${c} contribution${c!==1?'s':''} on ${dateStr}"></div>`;
      }
      html += `</div>`;
    });
    html += `</div>`;

    html += `<div class="contrib-legend">`;
    html += `<span>Less</span>`;
    html += `<div class="contrib-day level-0"></div>`;
    html += `<div class="contrib-day level-1"></div>`;
    html += `<div class="contrib-day level-2"></div>`;
    html += `<div class="contrib-day level-3"></div>`;
    html += `<div class="contrib-day level-4"></div>`;
    html += `<span>More</span>`;
    html += `</div>`;

    html += `</div>`;

    calendarEl.innerHTML = html;

    // Cache rendered HTML for 24 hours
    try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), html })); } catch(e){}

  } catch (err) {
    clearTimeout(timeout);
    console.error('Error loading GitHub contributions:', err);
    // Keep skeleton but show a subtle message
    calendarEl.querySelector('.contrib-header').textContent = 'Contributions unavailable';
  }
});
