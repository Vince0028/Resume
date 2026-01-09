(function () {
    try {
        const path = location.pathname || '/';
        const query = location.search || '';
        if (!path.includes('/terminal') && !query.includes('resume=1')) {
            location.replace('simple_portfolio.html');
        }
    } catch (e) { }
})();
