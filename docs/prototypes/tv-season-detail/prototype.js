const episodes = [
  {
    number: 1,
    title: "When You're Lost in the Darkness",
    airDate: 'Jan 15, 2023',
    runtime: '81 min',
    rating: '8.3',
    votes: '11k ratings',
    image: 'https://image.tmdb.org/t/p/w780/83vFYTHtCqWwaDtZluSU8bmnFYG.jpg',
    overview:
      'Twenty years after a fungal outbreak ravages the planet, hardened survivor Joel is tasked with smuggling Ellie out of an oppressive quarantine zone.',
  },
  {
    number: 2,
    title: 'Infected',
    airDate: 'Jan 22, 2023',
    runtime: '53 min',
    rating: '8.4',
    votes: '10k ratings',
    image: 'https://image.tmdb.org/t/p/w780/k8atjbd5gAsntuhbPnFpvnvo0qn.jpg',
    overview:
      'After escaping the quarantine zone, Joel and Tess clash over Ellie’s fate while navigating the ruins of a long-abandoned Boston.',
  },
  {
    number: 3,
    title: 'Long, Long Time',
    airDate: 'Jan 29, 2023',
    runtime: '76 min',
    rating: '8.8',
    votes: '14k ratings',
    image: 'https://image.tmdb.org/t/p/w780/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    overview:
      'When a stranger approaches his compound, survivalist Bill forges an unlikely connection. Later, Joel and Ellie seek guidance from an old friend.',
  },
  {
    number: 4,
    title: 'Please Hold to My Hand',
    airDate: 'Feb 5, 2023',
    runtime: '45 min',
    rating: '8.2',
    votes: '9k ratings',
    image: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    overview:
      'After abandoning their truck in Kansas City, Joel and Ellie attempt to escape without drawing the attention of a rebel leader and her search party.',
  },
  {
    number: 5,
    title: 'Endure and Survive',
    airDate: 'Feb 10, 2023',
    runtime: '59 min',
    rating: '8.6',
    votes: '9k ratings',
    image: 'https://image.tmdb.org/t/p/w780/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    overview:
      'While attempting to evade the rebels, Joel and Ellie cross paths with the most wanted man in Kansas City. Kathleen continues her hunt.',
  },
  {
    number: 6,
    title: 'Kin',
    airDate: 'Feb 19, 2023',
    runtime: '59 min',
    rating: '8.1',
    votes: '8k ratings',
    image: 'https://image.tmdb.org/t/p/w780/tLelKoPNiyJCSEtQTz1FGv4TLGc.jpg',
    overview:
      'After ignoring the advice of locals, Joel and Ellie descend deeper into dangerous territory in search of the Fireflies—and Tommy.',
  },
  {
    number: 7,
    title: 'Left Behind',
    airDate: 'Feb 26, 2023',
    runtime: '56 min',
    rating: '7.7',
    votes: '8k ratings',
    image: 'https://image.tmdb.org/t/p/w780/bVZRMlpjTAO2pJK6v90buFgVbSW.jpg',
    overview:
      'As Joel fights to survive, Ellie looks back on the night that changed everything and the friend who gave her a reason to keep going.',
  },
  {
    number: 8,
    title: 'When We Are in Need',
    airDate: 'Mar 5, 2023',
    runtime: '51 min',
    rating: '8.7',
    votes: '9k ratings',
    image: 'https://image.tmdb.org/t/p/w780/5BHuvQ6p9kfc091Z8RiFNhCwL4b.jpg',
    overview:
      'Ellie crosses paths with a vengeful group of survivors—and draws the attention of its leader. A weakened Joel faces a new threat.',
  },
  {
    number: 9,
    title: 'Look for the Light',
    airDate: 'Mar 12, 2023',
    runtime: '43 min',
    rating: '8.8',
    votes: '10k ratings',
    image: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    overview:
      'After being pursued by Infected, a pregnant Anna places her trust in a lifelong friend. Joel and Ellie near the end of their journey.',
  },
];

const escapeHtml = value =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const image = episode => `
  <div class="episode-image">
    <img src="${episode.image}" alt="Still from episode ${episode.number}, ${escapeHtml(episode.title)}" loading="lazy" />
  </div>`;

const meta = episode => `
  <div class="episode-meta">
    <span>${episode.airDate}</span><span class="meta-dot" aria-hidden="true"></span><span>${episode.runtime}</span>
  </div>`;

const rating = episode => `
  <span class="rating" aria-label="Rated ${episode.rating} out of 10">
    <span class="rating-star" aria-hidden="true">★</span>
    <span class="rating-value">${episode.rating}</span><span aria-hidden="true">/10</span>
  </span>`;

const renderCinematic = () => {
  const list = document.querySelector('[data-episode-list]');
  list.innerHTML = episodes
    .map(
      episode => `
        <li class="episode-item">
          ${image(episode)}
          <div class="episode-copy">
            <span class="episode-number">Episode ${String(episode.number).padStart(2, '0')}</span>
            <div class="episode-title-row">
              <h2 class="episode-title">${escapeHtml(episode.title)}</h2>
              ${rating(episode)}
            </div>
            ${meta(episode)}
            <p class="episode-overview">${escapeHtml(episode.overview)}</p>
          </div>
        </li>`,
    )
    .join('');
};

const renderLedger = () => {
  const list = document.querySelector('[data-episode-list]');
  list.innerHTML = episodes
    .map(
      episode => `
        <li class="episode-item">
          <span class="episode-index">${String(episode.number).padStart(2, '0')}</span>
          ${image(episode)}
          <div class="episode-content">
            <span class="episode-number">S1 · E${episode.number}</span>
            <h2 class="episode-title">${escapeHtml(episode.title)}</h2>
            <p class="episode-overview">${escapeHtml(episode.overview)}</p>
          </div>
          <time class="air-date" datetime="2023">${episode.airDate}</time>
          ${rating(episode)}
        </li>`,
    )
    .join('');
};

const renderSpotlight = () => {
  const spotlight = document.querySelector('[data-spotlight]');
  const filmstrip = document.querySelector('[data-filmstrip]');

  const selectEpisode = episode => {
    spotlight.innerHTML = `
      <div class="spotlight-image">
        <img src="${episode.image}" alt="Still from episode ${episode.number}, ${escapeHtml(episode.title)}" />
        <div class="spotlight-caption">
          <span class="episode-number">Episode ${String(episode.number).padStart(2, '0')}</span>
          <h2 class="spotlight-title">${escapeHtml(episode.title)}</h2>
          ${meta(episode)}
        </div>
      </div>
      <div class="spotlight-panel">
        ${rating(episode)}
        <span class="episode-number">${episode.votes}</span>
        <p class="episode-overview">${escapeHtml(episode.overview)}</p>
      </div>`;

    filmstrip.querySelectorAll('button').forEach(button => {
      button.setAttribute(
        'aria-current',
        String(Number(button.dataset.episode) === episode.number),
      );
    });
  };

  filmstrip.innerHTML = episodes
    .map(
      episode => `
        <button class="filmstrip-card" type="button" data-episode="${episode.number}" aria-current="false">
          ${image(episode)}
          <span class="episode-number">Episode ${String(episode.number).padStart(2, '0')}</span>
          <span class="episode-title">${escapeHtml(episode.title)}</span>
        </button>`,
    )
    .join('');

  filmstrip.addEventListener('click', event => {
    const button = event.target.closest('[data-episode]');
    if (button == null) return;
    const episode = episodes.find(item => item.number === Number(button.dataset.episode));
    if (episode != null) selectEpisode(episode);
  });

  selectEpisode(episodes[0]);
};

const variant = document.body.dataset.variant;
if (variant === 'a') renderCinematic();
if (variant === 'b') renderLedger();
if (variant === 'c') renderSpotlight();
