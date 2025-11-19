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
      
      // Apply theme-based styling with enhanced colors
      const applyCalendarTheme = () => {
        const calendar = document.getElementById('github-calendar');
        if (!calendar) return;
        
        const svg = calendar.querySelector('svg');
        if (svg) {
          // Ensure proper sizing
          svg.style.width = '100%';
          svg.style.height = 'auto';
        }
        
        if (document.body.classList.contains('light-mode')) {
          // Light mode colors - matching GitHub's light theme
          calendar.style.setProperty('--color-calendar-graph-day-bg', '#ebedf0');
          calendar.style.setProperty('--color-calendar-graph-day-border', 'rgba(27,31,35,0.06)');
          calendar.style.setProperty('--color-calendar-graph-day-L1-bg', '#9be9a8');
          calendar.style.setProperty('--color-calendar-graph-day-L2-bg', '#40c463');
          calendar.style.setProperty('--color-calendar-graph-day-L3-bg', '#30a14e');
          calendar.style.setProperty('--color-calendar-graph-day-L4-bg', '#216e39');
        } else {
          // Dark mode colors - enhanced for better visibility
          calendar.style.setProperty('--color-calendar-graph-day-bg', '#1a1f3a');
          calendar.style.setProperty('--color-calendar-graph-day-border', 'rgba(99,102,241,0.1)');
          calendar.style.setProperty('--color-calendar-graph-day-L1-bg', '#0e4429');
          calendar.style.setProperty('--color-calendar-graph-day-L2-bg', '#006d32');
          calendar.style.setProperty('--color-calendar-graph-day-L3-bg', '#26a641');
          calendar.style.setProperty('--color-calendar-graph-day-L4-bg', '#39d353');
        }
      };
      
      // Apply theme initially with delay to ensure library is ready
      setTimeout(applyCalendarTheme, 800);
      
      // Listen for theme changes
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          setTimeout(applyCalendarTheme, 150);
        });
      }
      
    } catch (error) {
      console.error('Error loading GitHub calendar:', error);
      const calendarEl = document.getElementById('github-calendar');
      if (calendarEl) {
        calendarEl.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center; padding: 2rem;">Unable to load GitHub contributions. Please check your internet connection.</p>';
      }
    }
  } else {
    console.error('GitHubCalendar library not loaded');
    setTimeout(() => {
      const calendarEl = document.getElementById('github-calendar');
      if (calendarEl && calendarEl.textContent.includes('Loading')) {
        calendarEl.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center; padding: 2rem;">GitHub calendar library failed to load.</p>';
      }
    }, 3000);
  }
})();
