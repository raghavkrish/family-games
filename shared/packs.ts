/** Six local rebus photos under public/packs/tamil-party/tent-kottai/{slug}/ */
function tentImages(slug: string): string[] {
  return [1, 2, 3, 4, 5, 6].map(
    (n) =>
      `/packs/tamil-party/tent-kottai/${slug}/${String(n).padStart(2, "0")}.jpg`,
  );
}

export type Pack = {
  id: string;
  title: string;
  locale: string;
  games: {
    "tent-kottai": {
      rules: { pointsCorrect: number; seconds?: number };
      puzzles: {
        id: string;
        category: string;
        imageUrls: string[];
        answer: string;
        accept: string[];
        emojiClues?: string[];
      }[];
    };
    "sound-party": {
      rules: { pointsCorrect: number };
      tracks: {
        id: string;
        title: string;
        movie?: string;
        audioUrl: string;
        accept: string[];
      }[];
    };
    "tamil-charades": {
      rules: { seconds: number; pointsCorrect: number };
      movies: { id: string; title: string; year?: number; accept: string[] }[];
    };
  };
};

export const TAMIL_PARTY_PACK: Pack = {
  id: "tamil-party",
  title: "Tamil Party Pack",
  locale: "ta-IN",
  games: {
    "tent-kottai": {
      rules: { pointsCorrect: 10 },
      puzzles: [
        {
          id: "tk-1",
          category: "Movie",
          imageUrls: tentImages("lion-king"),
          emojiClues: ["🦁", "👑", "🎵", "🌅", "🦒", "🌍"],
          answer: "The Lion King",
          accept: ["lion king", "the lion king"],
        },
        {
          id: "tk-2",
          category: "Movie",
          imageUrls: tentImages("enthiran"),
          emojiClues: ["🤖", "❤️", "🔬", "🦵", "💥", "🧑‍🎤"],
          answer: "Enthiran",
          accept: ["enthiran", "robot", "endooran"],
        },
        {
          id: "tk-3",
          category: "Song / Movie",
          imageUrls: tentImages("vtv"),
          emojiClues: ["🌧️", "❤️", "🎬", "✈️", "🎸", "🌃"],
          answer: "Vinnaithaandi Varuvaayaa",
          accept: ["vinnaithaandi varuvaayaa", "vtv", "vinnai thandi varuvaya"],
        },
        {
          id: "tk-4",
          category: "Person",
          imageUrls: tentImages("dhanush"),
          emojiClues: ["🏏", "⭐", "🎤", "🕺", "🔥", "🎬"],
          answer: "Dhanush",
          accept: ["dhanush"],
        },
        {
          id: "tk-5",
          category: "Movie",
          imageUrls: tentImages("kaakha"),
          emojiClues: ["👮", "🔥", "🏙️", "🔫", "🚗", "🌙"],
          answer: "Kaakha Kaakha",
          accept: ["kaakha kaakha", "kaka kaka", "kaaka kaaka"],
        },
        {
          id: "tk-6",
          category: "Movie",
          imageUrls: tentImages("nanban"),
          emojiClues: ["🏫", "👦", "📚", "🚲", "😂", "👨‍🎓"],
          answer: "Nanban",
          accept: ["nanban", "3 idiots"],
        },
        {
          id: "tk-7",
          category: "Place",
          imageUrls: tentImages("marina"),
          emojiClues: ["🌊", "🏖️", "🇮🇳", "🌅", "🚶", "📸"],
          answer: "Marina Beach",
          accept: ["marina", "marina beach"],
        },
        {
          id: "tk-8",
          category: "Movie",
          imageUrls: tentImages("dasavatharam"),
          emojiClues: ["🐍", "💎", "🗡️", "🔟", "🎭", "🧬"],
          answer: "Dasavatharam",
          accept: ["dasavatharam", "dasavathaaram"],
        },
        {
          id: "tk-9",
          category: "Movie",
          imageUrls: tentImages("ghilli"),
          emojiClues: ["🐯", "🥊", "🩸", "🏋️", "😤", "🏆"],
          answer: "Ghilli",
          accept: ["ghilli", "gilli"],
        },
        {
          id: "tk-10",
          category: "Movie",
          imageUrls: tentImages("vikram"),
          emojiClues: ["🕶️", "🔫", "🧓", "🚓", "💣", "🕵️"],
          answer: "Vikram",
          accept: ["vikram"],
        },
      ],
    },
    "sound-party": {
      rules: { pointsCorrect: 10 },
      tracks: [
        {
          id: "sp-1",
          title: "Why This Kolaveri Di",
          movie: "3",
          audioUrl: "/packs/tamil-party/audio/placeholder-beep.wav",
          accept: ["why this kolaveri di", "kolaveri", "kolaveri di"],
        },
        {
          id: "sp-2",
          title: "Vaathi Coming",
          movie: "Master",
          audioUrl: "/packs/tamil-party/audio/placeholder-beep.wav",
          accept: ["vaathi coming", "vathi coming", "vaathi"],
        },
        {
          id: "sp-3",
          title: "Arabic Kuthu",
          movie: "Beast",
          audioUrl: "/packs/tamil-party/audio/placeholder-beep.wav",
          accept: ["arabic kuthu", "arabic kuthu"],
        },
        {
          id: "sp-4",
          title: "Rowdy Baby",
          movie: "Maari 2",
          audioUrl: "/packs/tamil-party/audio/placeholder-beep.wav",
          accept: ["rowdy baby"],
        },
        {
          id: "sp-5",
          title: "Enjoy Enjaami",
          movie: "Single",
          audioUrl: "/packs/tamil-party/audio/placeholder-beep.wav",
          accept: ["enjoy enjaami", "enjaami"],
        },
        {
          id: "sp-6",
          title: "Aalaporan Thamizhan",
          movie: "Mersal",
          audioUrl: "/packs/tamil-party/audio/placeholder-beep.wav",
          accept: ["aalaporan thamizhan", "alaporan thamizhan"],
        },
      ],
    },
    "tamil-charades": {
      rules: { seconds: 60, pointsCorrect: 15 },
      movies: [
        { id: "m-1", title: "Baasha", year: 1995, accept: ["baasha", "basha"] },
        { id: "m-2", title: "Anniyan", year: 2005, accept: ["anniyan"] },
        { id: "m-3", title: "Ghilli", year: 2004, accept: ["ghilli", "gilli"] },
        { id: "m-4", title: "Vikram", year: 2022, accept: ["vikram"] },
        { id: "m-5", title: "Jailer", year: 2023, accept: ["jailer"] },
        { id: "m-6", title: "Super Deluxe", year: 2019, accept: ["super deluxe"] },
        { id: "m-7", title: "Kaithi", year: 2019, accept: ["kaithi"] },
        { id: "m-8", title: "Soorarai Pottru", year: 2020, accept: ["soorarai pottru"] },
        { id: "m-9", title: "Ponniyin Selvan", year: 2022, accept: ["ponniyin selvan", "ps1", "ps 1"] },
        { id: "m-10", title: "Leo", year: 2023, accept: ["leo"] },
      ],
    },
  },
};

const PACKS: Record<string, Pack> = {
  [TAMIL_PARTY_PACK.id]: TAMIL_PARTY_PACK,
};

export function getPack(packId: string): Pack {
  return PACKS[packId] ?? TAMIL_PARTY_PACK;
}

export function listPacks(): Pack[] {
  return Object.values(PACKS);
}
