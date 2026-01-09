function loadPrompts() {
    document.getElementById('prompts-modal').style.display = 'block';
    const content = document.getElementById('prompts-content');

    if (typeof PROMPTS_DATA !== 'undefined' && PROMPTS_DATA.includes('[PASTE HERE]') === false) {
        content.textContent = PROMPTS_DATA;
    } else {
        content.innerHTML = '<span style="color: #ef4444">Error: Prompts not found.</span><br><br>' +
            'Please open <strong>prompts.js</strong> and paste your 7,000 lines of history inside the backticks.';
    }
}
