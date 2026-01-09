document.addEventListener('DOMContentLoaded', async function () {
  const username = 'Vince0028';
  const calendarEl = document.getElementById('github-calendar');
  if (!calendarEl) return;

  const currentYear = new Date().getFullYear();
  let selectedYear = 'last';

  function renderSkeleton() {
    calendarEl.innerHTML = `
      <div class="contrib-header">Loading contributions...</div>
      <div class="contrib-calendar skeleton-loading"></div>
    `;
  }

  function renderYearFilter(activeYear) {
    const years = [];
    
    for (let y = currentYear; y >= 2023; y--) {
      years.push(y);
    }

    let buttonsHtml = '<div class="contrib-years">';

    
    buttonsHtml += `<button class="year-btn ${activeYear === 'last' ? 'active' : ''}" data-year="last">Last Year</button>`;

    years.forEach(year => {
      buttonsHtml += `<button class="year-btn ${activeYear === year.toString() ? 'active' : ''}" data-year="${year}">${year}</button>`;
    });
    buttonsHtml += '</div>';
    return buttonsHtml;
  }

  function renderCalendar(data, year) {
    if (!data || !data.contributions) return;

    
    const contributions = [...data.contributions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const totalContributions = data.total ? data.total[year === 'last' ? 'lastYear' : year] || data.total[Object.keys(data.total)[0]] : 0;

    const wrapperEl = calendarEl.closest('.github-calendar-wrapper');
    const wrapperStyles = wrapperEl ? getComputedStyle(wrapperEl) : null;
    const cellSize = wrapperStyles ? parseFloat(wrapperStyles.getPropertyValue('--contrib-cell-size')) : NaN;
    const cellGap = wrapperStyles ? parseFloat(wrapperStyles.getPropertyValue('--contrib-cell-gap')) : NaN;
    const cellStep = wrapperStyles ? parseFloat(wrapperStyles.getPropertyValue('--contrib-cell-step')) : NaN;
    const offsetLeft = wrapperStyles ? parseFloat(wrapperStyles.getPropertyValue('--contrib-offset')) : NaN;
    const weekStep = !Number.isNaN(cellStep)
      ? cellStep
      : (!Number.isNaN(cellSize) && !Number.isNaN(cellGap) ? cellSize + cellGap : 14.5);
    const monthOffset = Number.isNaN(offsetLeft) ? 40 : offsetLeft;

    const weeks = [];
    let week = [];
    contributions.forEach((d, idx) => {
      const dow = new Date(d.date).getDay();
      week[dow] = d;
      if (dow === 6 || idx === contributions.length - 1) {
        weeks.push(week.slice());
        week = [];
      }
    });

    let html = renderYearFilter(year.toString());

    html += `<div class="contrib-header">
                ${(totalContributions || 0).toLocaleString()} contributions 
                ${year === 'last' ? 'in the last year' : `in ${year}`}
             </div>`;

    html += `<div class="contrib-calendar">`;
    html += `<div class="contrib-months">`;
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
      const yearVal = parseInt(k.split('-')[0], 10);
      const month = parseInt(k.split('-')[1], 10);
      const label = new Date(yearVal, month, 1).toLocaleDateString('en-US', { month: 'short' });
      const left = monthOffset + i * weekStep;
      html += `<span style="left:${left}px">${label}</span>`;
    });
    html += `</div>`;

    html += `<div class="contrib-days">`;
    html += `<span style="grid-row: 2;">Mon</span>`;
    html += `<span style="grid-row: 4;">Wed</span>`;
    html += `<span style="grid-row: 6;">Fri</span>`;
    html += `</div>`;

    html += `<div class="contrib-grid">`;

    let maxContribution = 0;
    contributions.forEach(d => {
      if (d.count > maxContribution) maxContribution = d.count;
    });

    const levelThresholds = [0];
    if (maxContribution > 0) {
      levelThresholds.push(Math.ceil(maxContribution * 0.25));
      levelThresholds.push(Math.ceil(maxContribution * 0.5));
      levelThresholds.push(Math.ceil(maxContribution * 0.75));
    }

    weeks.forEach(w => {
      html += `<div class="contrib-week">`;
      for (let i = 0; i < 7; i++) {
        const day = w[i];
        if (!day) { html += `<div class="contrib-day empty"></div>`; continue; }
        const c = day.count || 0;
        let level = 0;
        if (c > 0) {
          if (c >= levelThresholds[3]) level = 4;
          else if (c >= levelThresholds[2]) level = 3;
          else if (c >= levelThresholds[1]) level = 2;
          else level = 1;
        }
        const dt = new Date(day.date);
        const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        html += `<div class="contrib-day level-${level}" data-count="${c}" data-date="${dateStr}" title="${c} contribution${c !== 1 ? 's' : ''} on ${dateStr}"></div>`;
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

    
    calendarEl.querySelectorAll('.year-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const year = e.target.getAttribute('data-year');
        if (year !== selectedYear) {
          fetchData(year);
        }
      });
    });
  }

  async function fetchData(year) {
    selectedYear = year;
    const cacheKey = `gh_contribs_${username}_${year}`;

    
    if (calendarEl.querySelector('.contrib-grid')) {
      calendarEl.querySelector('.contrib-grid').style.opacity = '0.5';
    }

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.ts && Date.now() - parsed.ts < 24 * 60 * 60 * 1000 && parsed.data) {
          renderCalendar(parsed.data, year);
          return;
        }
      }

      const resp = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=${year}`);
      if (!resp.ok) throw new Error('Network error');
      const data = await resp.json();

      renderCalendar(data, year);
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));

    } catch (err) {
      console.error('Error fetching contributions:', err);
      if (calendarEl.querySelector('.contrib-header')) {
        calendarEl.querySelector('.contrib-header').textContent = 'Error loading data';
        calendarEl.querySelector('.contrib-header').style.color = '#ff6b6b';
      }
    }
  }

  
  fetchData('last');
});


