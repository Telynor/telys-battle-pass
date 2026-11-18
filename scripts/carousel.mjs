const itemReference = value => /^(?:Item\.|Compendium\.|Actor\.)/.test(value);

export async function carouselEntries(config, resolveItem) {
  return Promise.all(config.art.map(async art => {
    const saved = config.featuredRewards?.find(entry => entry.art === art || (!entry.art && entry.uuid === art));
    const reference = itemReference(art) ? art : saved?.uuid;
    const item = reference ? await resolveItem(reference) : null;
    const sources = [...new Set([itemReference(art) ? '' : art, item?.img].filter(Boolean))];
    return {sources, name: item?.name || saved?.name || 'Featured Light Cone'};
  }));
}

function loadImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    const timeout = setTimeout(() => finish(false), 8000);
    const finish = success => {
      clearTimeout(timeout);
      image.onload = image.onerror = null;
      resolve(success);
    };
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = src;
  });
}

/** Changes only the preview image. The reward board keeps its position and focus. */
export function startCarousel(container, entries, seconds) {
  const image = container.querySelector('img');
  const status = container.querySelector('[data-carousel-status]');
  let stopped = false, timer, animation, index = 0;
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const cache = new Map();
  const ready = entry => {
    if (!cache.has(entry)) cache.set(entry, (async () => {
      for (const src of entry.sources) if (await loadImage(src)) return src;
      return null;
    })());
    return cache.get(entry);
  };
  async function fade(from, to) {
    if (reduced || !image.animate) return;
    animation = image.animate([{opacity: from}, {opacity: to}], {duration: 300, fill: 'forwards', easing: 'ease-in-out'});
    await animation.finished.catch(() => {});
  }
  async function show() {
    // Broken entries are skipped, including old Item UUIDs pasted into image fields.
    for (let attempts = 0; attempts < entries.length && !stopped; attempts++) {
      const entry = entries[index % entries.length];
      index++;
      const src = await ready(entry);
      if (stopped) return;
      if (!src) continue;
      if (!image.hidden) await fade(1, 0);
      if (stopped) return;
      image.src = src;
      image.alt = entry.name;
      image.hidden = false;
      status.hidden = true;
      await fade(0, 1);
      if (!stopped && entries.length > 1) timer = setTimeout(show, seconds * 1000);
      return;
    }
    if (!stopped) {
      image.hidden = true;
      status.hidden = false;
      status.textContent = 'Preview images unavailable. Check the image paths in Configure.';
    }
  }
  show();
  return () => {stopped = true; clearTimeout(timer); animation?.cancel();};
}
