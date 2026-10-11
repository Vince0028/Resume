(function () {
    try {
        const path = location.pathname || '/';
        const query = location.search || '';
        if (query.includes('resume=1')) {
            location.replace('../ui-resume/frontend/dist/index.html');
            return;
        }
        if (!path.includes('/terminal')) {
            location.replace('simple_portfolio.html');
        }
    } catch (e) { }
})();
