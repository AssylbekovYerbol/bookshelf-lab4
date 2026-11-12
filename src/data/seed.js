import { GENRES } from '../constants';

// Small seeded PRNG so the initial data is identical for every visitor.
function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Mara', 'Elias', 'Nadia', 'Tomas', 'Iris', 'Callum', 'Yuki', 'Amara', 'Lucas', 'Sofia',
  'Rafael', 'Hana', 'Oscar', 'Leila', 'Daniel', 'Freya', 'Marek', 'Aigerim', 'Victor', 'Noor',
];
const LAST_NAMES = [
  'Voss', 'Hartley', 'Okafor', 'Lindqvist', 'Moreau', 'Brandt', 'Tanaka', 'Delgado', 'Novak', 'Ashford',
  'Kowalski', 'Serikov', 'Fontaine', 'Ibarra', 'Whitlock', 'Haddad', 'Petrov', 'Calloway', 'Sato', 'Reyes',
];

// Titles are invented: "The {adj} {noun}" style templates per genre.
const TITLE_PARTS = {
  Fantasy: {
    adj: ['Silver', 'Forgotten', 'Hollow', 'Crimson', 'Ember', 'Wandering', 'Frozen', 'Gilded', 'Midnight', 'Ancient'],
    noun: ['Crown', 'Oath', 'Forest', 'Dragon', 'Kingdom', 'Prophecy', 'Throne', 'Tower', 'Rune', 'Wolf'],
    make: (a, n) => `The ${a} ${n}`,
  },
  'Science Fiction': {
    adj: ['Orbital', 'Silent', 'Binary', 'Quantum', 'Distant', 'Last', 'Neon', 'Synthetic', 'Drifting', 'Lunar'],
    noun: ['Colony', 'Signal', 'Horizon', 'Archive', 'Protocol', 'Voyage', 'Engine', 'Paradox', 'Station', 'Dawn'],
    make: (a, n) => `${a} ${n}`,
  },
  Mystery: {
    adj: ['Vanishing', 'Quiet', 'Broken', 'Midnight', 'Locked', 'Hidden', 'Paper', 'Last', 'Silent', 'Crooked'],
    noun: ['Witness', 'Letter', 'Alibi', 'Lighthouse', 'Garden', 'Clue', 'Key', 'Ledger', 'Window', 'Verdict'],
    make: (a, n) => `The ${a} ${n}`,
  },
  Romance: {
    adj: ['Summer', 'Borrowed', 'Second', 'Unwritten', 'Golden', 'Winter', 'Secret', 'Gentle', 'Late', 'Open'],
    noun: ['Promise', 'Letters', 'Chance', 'Harbor', 'Waltz', 'Season', 'Heart', 'Evening', 'Café', 'Postcard'],
    make: (a, n) => `${a} ${n}`,
  },
  History: {
    adj: ['Iron', 'Silk', 'Bronze', 'Salt', 'Imperial', 'Lost', 'Northern', 'River', 'Golden', 'Medieval'],
    noun: ['Empires', 'Roads', 'Merchants', 'Frontiers', 'Revolts', 'Cities', 'Voices', 'Maps', 'Treaties', 'Harvests'],
    make: (a, n) => `${n} of the ${a} Age`,
  },
  Science: {
    adj: ['Hidden', 'Living', 'Quantum', 'Deep', 'Restless', 'Invisible', 'Fragile', 'Cosmic', 'Tiny', 'Wild'],
    noun: ['Patterns', 'Oceans', 'Code', 'Forces', 'Cells', 'Atoms', 'Climate', 'Brains', 'Stars', 'Rhythms'],
    make: (a, n) => `The ${a} ${n}`,
  },
  Biography: {
    adj: FIRST_NAMES,
    noun: ['Letters', 'Motion', 'Colour', 'Numbers', 'Sound', 'Words', 'Stone', 'Light'],
    make: (a, n, rand) => `${a} ${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}: A Life in ${n}`,
  },
  Technology: {
    adj: ['Practical', 'Modern', 'Scalable', 'Clean', 'Resilient', 'Pragmatic', 'Reactive', 'Distributed', 'Secure', 'Lean'],
    noun: ['Web Design', 'Systems', 'Interfaces', 'Algorithms', 'Data Pipelines', 'Architecture', 'APIs', 'Testing', 'Databases', 'Software'],
    make: (a, n) => `${a} ${n}`,
  },
};

const BLURBS = {
  Fantasy: [
    'A reluctant heir must unite rival kingdoms before an ancient magic fades for good.',
    'Old promises, borrowed power and a map that keeps changing its mind.',
    'When the last dragon egg hatches, three families go to war to claim it.',
    'A young cartographer discovers that the borders of the world are alive.',
  ],
  'Science Fiction': [
    'A crew on the edge of the solar system receives a message from their own future.',
    "The colony's AI has been honest for fifty years, until tonight.",
    'Two engineers race to repair a station that is slowly forgetting its own purpose.',
    'First contact arrives as a spreadsheet, and nobody can agree what it means.',
  ],
  Mystery: [
    'A retired detective receives a letter from a case she thought was closed.',
    'Every guest at the lighthouse had a reason to want the keeper gone.',
    'The only witness remembers everything except the one thing that matters.',
    'A small-town archivist notices the same signature in three unrelated files.',
  ],
  Romance: [
    'Two rivals share a rented cottage for one summer and one very bad plan.',
    'Letters addressed to the wrong person lead to the right one.',
    'A pastry chef and a restaurant critic call a truce that nobody believes.',
    'They only had a weekend in Lisbon. They made it last for years.',
  ],
  History: [
    'A clear, narrative account of how ordinary people shaped the course of empires.',
    'Drawing on letters, ledgers and archaeology to rebuild a vanished world.',
    'Trade routes, treaties and the quiet decisions that redrew the map.',
    'A fresh look at a turning point that textbooks usually compress into a paragraph.',
  ],
  Science: [
    'Explains the latest research without the jargon, and with plenty of curiosity.',
    'What we know, what we suspect, and what still keeps researchers awake at night.',
    'A guided tour from the smallest particles to the largest structures we can measure.',
    'Short chapters, vivid examples and experiments you can try at home.',
  ],
  Biography: [
    'An intimate portrait built from diaries, interviews and previously unseen archives.',
    'The private doubts behind a very public career.',
    'From a modest start to lasting influence, told with candour and humour.',
    'A life examined through its friendships, rivalries and unfinished projects.',
  ],
  Technology: [
    'Patterns and trade-offs for building software that is still pleasant to maintain in five years.',
    'Hands-on chapters with real-world examples, from first prototype to production.',
    'A practical guide to keeping systems fast, secure and understandable.',
    'What the documentation leaves out, collected from years of incident reports.',
  ],
};

const CLOSERS = [
  'A favourite among our regular readers.',
  'Recommended by the library staff.',
  'Often requested, rarely on the shelf.',
  'A quiet bestseller since its first printing.',
];

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

function pickStatus(rand) {
  const r = rand();
  if (r < 0.6) return 'available';
  if (r < 0.85) return 'borrowed';
  return 'reserved';
}

/** Generates `count` deterministic book records (default 120 = 15 per genre). */
export function generateBooks(count = 120) {
  const rand = mulberry32(2026);
  const perGenre = Math.ceil(count / GENRES.length);
  const drafts = [];

  for (const genre of GENRES) {
    const parts = TITLE_PARTS[genre];
    const titles = new Set();
    while (titles.size < perGenre) {
      titles.add(parts.make(pick(rand, parts.adj), pick(rand, parts.noun), rand));
    }
    for (const title of titles) {
      drafts.push({
        title,
        author: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
        genre,
        year: 1950 + Math.floor(rand() * 76),
        pages: 160 + Math.floor(rand() * 560),
        rating: Math.round((2.8 + rand() * 2.1) * 10) / 10,
        status: pickStatus(rand),
        description: `${pick(rand, BLURBS[genre])} ${pick(rand, CLOSERS)}`,
        favorite: rand() < 0.1,
      });
    }
  }

  // Fisher–Yates shuffle so genres are mixed in the default order.
  for (let i = drafts.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [drafts[i], drafts[j]] = [drafts[j], drafts[i]];
  }

  const base = Date.UTC(2026, 8, 1);
  const day = 24 * 60 * 60 * 1000;
  return drafts.slice(0, count).map((draft, index) => ({
    id: index + 1,
    ...draft,
    createdAt: new Date(base - index * day).toISOString(),
  }));
}
