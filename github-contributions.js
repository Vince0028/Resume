// Initialize GitHub contributions calendar
document.addEventListener('DOMContentLoaded', function() {
  const username = 'Vince0028';
  
  if (typeof GitHubCalendar !== 'undefined') {
    try {
      GitHubCalendar("#github-calendar", username, {
        responsive: true,
        tooltips: true
      });
      
      console.log('GitHub calendar loaded successfully');
      
      // Theme handling
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          // Reload calendar on theme change for proper color adaptation
          setTimeout(() => {
            const calendarEl = document.getElementById('github-calendar');
            if (calendarEl) {
              calendarEl.innerHTML = '';
              GitHubCalendar("#github-calendar", username, {
                responsive: true,
                tooltips: true
              });
            }
          }, 150);
        });
      }
      
    } catch (error) {
      console.error('Error loading GitHub calendar:', error);
      const calendarEl = document.getElementById('github-calendar');
      if (calendarEl) {
        calendarEl.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center; padding: 2rem;">Unable to load GitHub contributions.</p>';
      }
    }
  }
});
