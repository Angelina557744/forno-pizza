(function () {
  const filterBtns = document.querySelectorAll('[data-menu-filters] .filter-btn');
  const rows = document.querySelectorAll('[data-tags]');
  const groups = document.querySelectorAll('[data-category]');
  const emptyMsg = document.querySelector('[data-menu-empty]');

  if (!filterBtns.length) return;

  function applyFilter(filter) {
    let visibleCount = 0;

    rows.forEach(row => {
      const tags = row.dataset.tags || '';
      const match = !filter || tags.split(' ').includes(filter);
      row.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    groups.forEach(group => {
      const visibleRows = group.querySelectorAll('[data-tags]:not([style*="display: none"])');
      group.style.display = visibleRows.length ? '' : 'none';
    });

    if (emptyMsg) emptyMsg.hidden = visibleCount > 0;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter || '');
    });
  });
})();