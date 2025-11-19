// Initialize GitHub contributions calendar
(function() {
  // Replace 'Vince0028' with your GitHub username if different
  const username = 'Vince0028';
  
  // Wait for DOM and library to be ready
  if (typeof GitHubCalendar !== 'undefined') {
    try {
      GitHubCalendar("#github-calendar", username, {
        responsive: true,
        tooltips: true,
        global_stats: false,
        summary_text: ''
      });
      
      // Apply theme-based styling
      const applyCalendarTheme = () => {
        const calendar = document.getElementById('github-calendar');
        if (!calendar) return;
        
        if (document.body.classList.contains('light-mode')) {
          calendar.style.setProperty('--color-calendar-graph-day-bg', '#ebedf0');
          calendar.style.setProperty('--color-calendar-graph-day-border', 'rgba(27,31,35,0.06)');
          calendar.style.setProperty('--color-calendar-graph-day-L1-bg', '#9be9a8');
          calendar.style.setProperty('--color-calendar-graph-day-L2-bg', '#40c463');
          calendar.style.setProperty('--color-calendar-graph-day-L3-bg', '#30a14e');
          calendar.style.setProperty('--color-calendar-graph-day-L4-bg', '#216e39');
        } else {
          calendar.style.setProperty('--color-calendar-graph-day-bg', '#161b22');
          calendar.style.setProperty('--color-calendar-graph-day-border', 'rgba(27,31,35,0.06)');
          calendar.style.setProperty('--color-calendar-graph-day-L1-bg', '#0e4429');
          calendar.style.setProperty('--color-calendar-graph-day-L2-bg', '#006d32');
          calendar.style.setProperty('--color-calendar-graph-day-L3-bg', '#26a641');
          calendar.style.setProperty('--color-calendar-graph-day-L4-bg', '#39d353');
        }
      };
      
      // Apply theme initially and on theme toggle
      setTimeout(applyCalendarTheme, 500);
      
      // Listen for theme changes
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          setTimeout(applyCalendarTheme, 100);
        });
      }
      
    } catch (error) {
      console.error('Error loading GitHub calendar:', error);
      const calendarEl = document.getElementById('github-calendar');
      if (calendarEl) {
        calendarEl.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center;">Unable to load contributions</p>';
      }
    }
  } else {
    console.error('GitHubCalendar library not loaded');
  }
})();
