const seasons = [
  {
    number: 1,
    year: 2021,
    ratings: [7.3, 7.7, 7.6, 8.5, 7.4, 7.5, 7.8, 6.5],
    titles: ['Leavetaking', "Shadow's Waiting", 'A Place of Safety', 'The Dragon Reborn', 'Blood Calls Blood', 'The Flame of Tar Valon', 'The Dark Along the Ways', 'The Eye of the World'],
  },
  {
    number: 2,
    year: 2023,
    ratings: [7.1, 7.4, 8.0, 7.9, 8.2, 8.6, 8.2, 8.9],
    titles: ['A Taste of Solitude', 'Strangers and Friends', 'What Might Be', 'Daughter of the Night', 'Damane', 'Eyes Without Pity', 'Daes Dae’Mar', 'What Was Meant to Be'],
  },
  {
    number: 3,
    year: 2025,
    ratings: [8.5, 8.4, 8.6, 8.8, 8.1, 8.7, 8.4, 8.9],
    titles: ['To Race the Shadow', 'A Question of Crimson', 'Seeds of Shadow', 'The Road to the Spear', 'Tel’aran’rhiod', 'The Shadow in the Night', 'Goldeneyes', 'He Who Comes with the Dawn'],
  },
];

const specials = {
  number: 0,
  year: 2021,
  ratings: [7.8, null],
  titles: ['Origins: The Breaking of the World', 'Behind the Warder Bond'],
};

const categories = [
  { name: 'Awesome', minimum: 9, className: 'quality-awesome', color: '#128957' },
  { name: 'Great', minimum: 8, className: 'quality-great', color: '#24b56e' },
  { name: 'Good', minimum: 7, className: 'quality-good', color: '#e6b936' },
  { name: 'Regular', minimum: 6, className: 'quality-regular', color: '#e88d20' },
  { name: 'Bad', minimum: 5, className: 'quality-bad', color: '#cf514a' },
  { name: 'Garbage', minimum: 0, className: 'quality-garbage', color: '#78558d' },
];

const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const getCategory = rating => categories.find(category => rating >= category.minimum);
const showAverage = average(seasons.flatMap(season => season.ratings));

const renderLegend = () => {
  document.querySelectorAll('[data-quality-legend]').forEach(legend => {
    legend.innerHTML = categories
      .map(category => `<li><span class="legend-swatch" style="background:${category.color}"></span>${category.name}</li>`)
      .join('');
  });
};

const renderMatrix = () => {
  const matrix = document.querySelector('[data-rating-matrix]');
  const inspector = document.querySelector('[data-matrix-inspector]');
  const specialsToggle = document.querySelector('[data-specials-toggle]');
  if (matrix == null || inspector == null) return;

  let visibleSeasons = seasons;

  const inspect = (seasonNumber, episodeNumber) => {
    const season = visibleSeasons.find(item => item.number === seasonNumber);
    const rating = season.ratings[episodeNumber - 1];
    const title = season.titles[episodeNumber - 1];
    const ratedEpisodes = season.ratings.filter(value => value != null);
    const seasonAverage = average(ratedEpisodes);
    inspector.innerHTML = `
      <span class="episode-number">${seasonNumber === 0 ? 'Specials' : `Season ${seasonNumber}`} · Episode ${episodeNumber}</span>
      <p class="inspector-rating">${rating.toFixed(1)}</p>
      <h2 class="inspector-title">${title}</h2>
      <p class="inspector-copy">${getCategory(rating).name} · ${rating >= seasonAverage ? 'Above' : 'Below'} the season average by ${Math.abs(rating - seasonAverage).toFixed(1)} points.</p>
      <div class="season-shift">
        <div class="shift-stat"><strong>${seasonAverage.toFixed(1)}</strong><span>Season avg.</span></div>
        <div class="shift-stat"><strong>${Math.max(...ratedEpisodes).toFixed(1)}</strong><span>Season high</span></div>
        <div class="shift-stat"><strong>${season.year}</strong><span>Released</span></div>
      </div>
      <a class="inspector-link" href="../tv-season-detail/variant-b-ledger.html#episode-${episodeNumber}">View in Season →</a>`;
    matrix.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.season) === seasonNumber && Number(button.dataset.episode) === episodeNumber));
    });
  };

  const drawMatrix = showSpecials => {
    visibleSeasons = showSpecials ? [specials, ...seasons] : seasons;
    const episodeCount = Math.max(...visibleSeasons.map(season => season.titles.length));
    const cells = ['<span class="matrix-corner" aria-hidden="true"></span>'];
    matrix.style.setProperty('--matrix-seasons', String(visibleSeasons.length));
    visibleSeasons.forEach(season => cells.push(`<span class="matrix-season">${season.number === 0 ? 'Specials' : `Season ${season.number}`}</span>`));

    for (let episodeIndex = 0; episodeIndex < episodeCount; episodeIndex += 1) {
      cells.push(`<span class="matrix-episode">E${String(episodeIndex + 1).padStart(2, '0')}</span>`);
      visibleSeasons.forEach(season => {
        if (episodeIndex >= season.titles.length) {
          cells.push('<span class="rating-cell quality-missing" aria-label="No episode at this position">—</span>');
          return;
        }
        const rating = season.ratings[episodeIndex];
        if (rating == null) {
          cells.push('<span class="rating-cell quality-missing" aria-label="Episode not rated">?</span>');
          return;
        }
        const category = getCategory(rating);
        cells.push(`<button class="rating-cell ${category.className}" type="button" data-season="${season.number}" data-episode="${episodeIndex + 1}" aria-pressed="false" aria-label="${season.number === 0 ? 'Specials' : `Season ${season.number}`}, episode ${episodeIndex + 1}, rated ${rating.toFixed(1)}">${rating.toFixed(1)}</button>`);
      });
    }
    matrix.innerHTML = cells.join('');
    inspect(3, 8);
  };

  matrix.addEventListener('click', event => {
    const cell = event.target.closest('button[data-season]');
    if (cell == null) return;
    inspect(Number(cell.dataset.season), Number(cell.dataset.episode));
  });
  specialsToggle?.addEventListener('change', event => drawMatrix(event.target.checked));
  drawMatrix(false);
};

const renderScorecards = () => {
  const grid = document.querySelector('[data-scorecards]');
  const verdict = document.querySelector('[data-show-verdict]');
  if (grid == null || verdict == null) return;

  grid.innerHTML = seasons
    .map(season => {
      const seasonAverage = average(season.ratings);
      const best = Math.max(...season.ratings);
      const worst = Math.min(...season.ratings);
      const categoryCounts = categories.map(category => ({
        ...category,
        count: season.ratings.filter(rating => getCategory(rating).name === category.name).length,
      }));
      return `
        <article class="season-card">
          <header class="season-card-header">
            <div><span class="episode-number">${season.year} · ${season.ratings.length} episodes</span><h2>Season ${season.number}</h2></div>
            <span class="season-average" aria-label="Season average ${seasonAverage.toFixed(1)}">${seasonAverage.toFixed(1)}</span>
          </header>
          <div class="distribution" aria-label="Rating distribution">${categoryCounts.filter(item => item.count > 0).map(item => `<span style="flex:${item.count};background:${item.color}" title="${item.name}: ${item.count}"></span>`).join('')}</div>
          <div class="mini-grid">${season.ratings.map((rating, index) => `<button class="mini-cell ${getCategory(rating).className}" type="button" aria-label="Season ${season.number}, episode ${index + 1}, rated ${rating.toFixed(1)}" title="E${index + 1} · ${season.titles[index]}">${rating.toFixed(1)}</button>`).join('')}</div>
          <div class="season-facts"><div class="season-fact"><span>Peak</span><strong>${best.toFixed(1)} · E${season.ratings.indexOf(best) + 1}</strong></div><div class="season-fact"><span>Low</span><strong>${worst.toFixed(1)} · E${season.ratings.indexOf(worst) + 1}</strong></div></div>
        </article>`;
    })
    .join('');

  const averages = seasons.map(season => average(season.ratings));
  const bestSeasonIndex = averages.indexOf(Math.max(...averages));
  verdict.innerHTML = `<div><span class="episode-number">Series average</span><div class="verdict-score">${showAverage.toFixed(1)}</div></div><div class="verdict-copy"><h2>Quality rises season over season</h2><p>Season ${seasons[bestSeasonIndex].number} is the strongest at ${averages[bestSeasonIndex].toFixed(1)}, up ${(averages[bestSeasonIndex] - averages[0]).toFixed(1)} points from the first season. The latest run also has the tightest episode range.</p></div>`;
};

const renderTrajectory = () => {
  const chart = document.querySelector('[data-trajectory]');
  const summary = document.querySelector('[data-trajectory-summary]');
  const toggles = document.querySelector('[data-season-toggles]');
  if (chart == null || summary == null || toggles == null) return;

  const width = 900;
  const height = 390;
  const padding = { top: 28, right: 24, bottom: 50, left: 48 };
  const x = episode => padding.left + ((episode - 1) / 7) * (width - padding.left - padding.right);
  const y = rating => padding.top + ((10 - rating) / 5) * (height - padding.top - padding.bottom);
  const colors = ['#f5a524', '#8fb3c4', '#24b56e'];

  const gridLines = [5, 6, 7, 8, 9, 10]
    .map(value => `<line class="chart-grid-line" x1="${padding.left}" x2="${width - padding.right}" y1="${y(value)}" y2="${y(value)}"/><text class="chart-label" x="${padding.left - 15}" y="${y(value) + 4}" text-anchor="middle">${value}</text>`)
    .join('');
  const xLabels = Array.from({ length: 8 }, (_, index) => `<text class="chart-label" x="${x(index + 1)}" y="${height - 18}" text-anchor="middle">E${index + 1}</text>`).join('');
  const lines = seasons
    .map((season, seasonIndex) => {
      const points = season.ratings.map((rating, index) => `${x(index + 1)},${y(rating)}`).join(' ');
      const dots = season.ratings.map((rating, index) => `<circle class="chart-point" cx="${x(index + 1)}" cy="${y(rating)}" r="6" fill="${colors[seasonIndex]}"><title>Season ${season.number}, episode ${index + 1}: ${rating.toFixed(1)}</title></circle>`).join('');
      return `<g data-series="${season.number}"><polyline class="chart-line" points="${points}" stroke="${colors[seasonIndex]}"/>${dots}</g>`;
    })
    .join('');
  chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  chart.innerHTML = `${gridLines}${xLabels}${lines}`;

  toggles.innerHTML = seasons.map((season, index) => `<label class="season-toggle"><input type="checkbox" value="${season.number}" checked/><span><i class="line-dot" style="background:${colors[index]}"></i>Season ${season.number}</span></label>`).join('');
  toggles.addEventListener('change', event => {
    const input = event.target.closest('input');
    if (input == null) return;
    const series = chart.querySelector(`[data-series="${input.value}"]`);
    if (series != null) series.style.display = input.checked ? '' : 'none';
  });

  const seasonAverages = seasons.map(season => average(season.ratings));
  const allRatings = seasons.flatMap(season => season.ratings);
  const best = Math.max(...allRatings);
  summary.innerHTML = `
    <div class="trajectory-stat"><span>Series average</span><strong>${showAverage.toFixed(1)}</strong></div>
    <div class="trajectory-stat"><span>Best episode</span><strong>${best.toFixed(1)} · S${seasons.find(season => season.ratings.includes(best)).number}</strong></div>
    <div class="trajectory-stat"><span>Strongest season</span><strong>S${seasonAverages.indexOf(Math.max(...seasonAverages)) + 1} · ${Math.max(...seasonAverages).toFixed(1)}</strong></div>
    <div class="trajectory-stat"><span>Direction</span><strong>Improving ↗</strong></div>`;
};

renderLegend();
renderMatrix();
renderScorecards();
renderTrajectory();
