// Fetch and display GitHub contributions
document.addEventListener('DOMContentLoaded', async function() {
  const username = 'Vince0028';
  const calendarEl = document.getElementById('github-calendar');
  
  if (!calendarEl) return;
  
  try {
    // Fetch contribution data from GitHub API
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
    const data = await response.json();
    
    if (!data || !data.contributions) {
      throw new Error('No data received');
    }
    
    const contributions = data.contributions;
    const totalContributions = data.total[Object.keys(data.total)[0]];
    
    // Build the calendar HTML
    let html = `<div class="contrib-header">${totalContributions.toLocaleString()} contributions in the last year</div>`;
    html += `<div class="contrib-calendar">`;
    
    // Group contributions by week
    const weeks = [];
    let currentWeek = [];
    const monthLabels = [];
    const monthPositions = new Map();
    
    contributions.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // Track the first occurrence of each month
      if (!monthPositions.has(monthYear) && dayOfWeek === 0) {
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        monthPositions.set(monthYear, { month: monthName, weekIndex: weeks.length });
      }
      
      if (index === contributions.length - 1) {
        weeks.push(currentWeek);
      }
    });
    
    // Convert month positions to array
    monthPositions.forEach(value => {
      monthLabels.push(value);
    });
    
    // Build the calendar HTML
    let html = `<div class="contrib-header">${totalContributions.toLocaleString()} contributions in the last year</div>`;
    html += `<div class="contrib-calendar">`;
    
    // Month labels
    html += `<div class="contrib-months">`;
    monthLabels.forEach((m) => {
      const left = m.weekIndex * 14.5;
      html += `<span style="left: ${left}px">${m.month}</span>`;
    });
    html += `</div>`;
    
    // Day labels
    html += `<div class="contrib-days">`;
    html += `<span style="grid-row: 2;">Mon</span>`;
    html += `<span style="grid-row: 4;">Wed</span>`;
    html += `<span style="grid-row: 6;">Fri</span>`;
    html += `</div>`;
    
    // Contribution grid
    html += `<div class="contrib-grid">`;
    weeks.forEach(week => {
      html += `<div class="contrib-week">`;
      
      // Create all 7 days (Sunday=0 to Saturday=6)
      for (let i = 0; i < 7; i++) {
        const day = week.find(d => new Date(d.date).getDay() === i);
        if (day) {
          const level = day.count === 0 ? 0 : day.count < 3 ? 1 : day.count < 6 ? 2 : day.count < 10 ? 3 : 4;
          const date = new Date(day.date);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          html += `<div class="contrib-day level-${level}" data-count="${day.count}" data-date="${dateStr}" title="${day.count} contribution${day.count !== 1 ? 's' : ''} on ${dateStr}"></div>`;
        } else {
          html += `<div class="contrib-day empty"></div>`;
        }
      }
      html += `</div>`;
    });
    html += `</div>`;
    
    // Legend
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
    
  } catch (error) {
    console.error('Error loading GitHub contributions:', error);
    calendarEl.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Unable to load contributions</p>`;
  }
});
