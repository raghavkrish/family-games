/** Local rebus photos under public/packs/tamil-party/tent-kottai/{movies|songs}/{slug}/ */
export function tentImages(
  kind: "movies" | "songs",
  slug: string,
  count = 6,
): string[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `/packs/tamil-party/tent-kottai/${kind}/${slug}/${n}.jpg`;
  });
}

export type TentPuzzle = {
  id: string;
  category: string;
  imageUrls: string[];
  answer: string;
  accept: string[];
  emojiClues?: string[];
};

export type TentSection = {
  rules: { pointsCorrect: number; seconds?: number };
  puzzles: TentPuzzle[];
};

export type Pack = {
  id: string;
  title: string;
  locale: string;
  games: {
    "tent-kottai": {
      movies: TentSection;
      songs: TentSection;
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
  title: "Kollywood Games Night Pack",
  locale: "ta-IN",
  games: {
    "tent-kottai": {
      movies: {
        rules: { pointsCorrect: 10 },
        puzzles: [
          {
            id: "tkm-1",
            category: "Movie",
            imageUrls: tentImages("movies", "annamalai", 5),
            answer: "Annamalai",
            accept: ["annamalai", "anna malai", "annamalai movie"],
          },
          {
            id: "tkm-2",
            category: "Movie",
            imageUrls: tentImages("movies", "vasoolraja-mbbs", 5),
            answer: "Vasool Raja MBBS",
            accept: [
              "vasool raja mbbs",
              "vasoolraja mbbs",
              "vasool raja",
              "vasoolraja",
              "vasool raja m.b.b.s",
            ],
          },
          {
            id: "tkm-3",
            category: "Movie",
            imageUrls: tentImages("movies", "yaavarum-nalam", 5),
            answer: "Yaavarum Nalam",
            accept: [
              "yaavarum nalam",
              "yavarum nalam",
              "13b",
              "13 b",
            ],
          },
          {
            id: "tkm-4",
            category: "Movie",
            imageUrls: tentImages("movies", "aayirathil-oruvan", 5),
            answer: "Aayirathil Oruvan",
            accept: [
              "aayirathil oruvan",
              "ayirathil oruvan",
              "aayirathiloruvan",
            ],
          },
          {
            id: "tkm-5",
            category: "Movie",
            imageUrls: tentImages("movies", "anniyan", 5),
            answer: "Anniyan",
            accept: ["anniyan", "anian", "aparichithan"],
          },
          {
            id: "tkm-6",
            category: "Movie",
            imageUrls: tentImages("movies", "jeans", 5),
            answer: "Jeans",
            accept: ["jeans"],
          },
          {
            id: "tkm-7",
            category: "Movie",
            imageUrls: tentImages("movies", "mudhalvan", 5),
            answer: "Mudhalvan",
            accept: ["mudhalvan", "mudalvan", "muthalvan"],
          },
          {
            id: "tkm-8",
            category: "Movie",
            imageUrls: tentImages("movies", "nanban", 5),
            answer: "Nanban",
            accept: ["nanban", "3 idiots", "three idiots"],
          },
          {
            id: "tkm-9",
            category: "Movie",
            imageUrls: tentImages("movies", "thozha", 5),
            answer: "Thozha",
            accept: ["thozha", "thoza", "thozha movie"],
          },
          {
            id: "tkm-10",
            category: "Movie",
            imageUrls: tentImages("movies", "vaaranam-aayiram", 5),
            answer: "Vaaranam Aayiram",
            accept: [
              "vaaranam aayiram",
              "varanam ayiram",
              "vaaranam ayiram",
              "varanam aayiram",
            ],
          },
        ],
      },
      songs: {
        rules: { pointsCorrect: 10 },
        puzzles: [
          {
            id: "tks-1",
            category: "Song",
            imageUrls: tentImages("songs", "aadaludan-paadalai-kettu", 6),
            answer: "Aadaludan Paadalai Kettu",
            accept: [
              "aadaludan paadalai kettu",
              "adaludan padalai kettu",
              "aadaludan paadalai",
            ],
          },
          {
            id: "tks-2",
            category: "Song",
            imageUrls: tentImages("songs", "chikku-bukku-rayile", 5),
            answer: "Chikku Bukku Rayile",
            accept: [
              "chikku bukku rayile",
              "chikku bukku",
              "chicku bukku rayile",
              "chikkubukku rayile",
            ],
          },
          {
            id: "tks-3",
            category: "Song",
            imageUrls: tentImages("songs", "kaatre-en-vaasal", 6),
            answer: "Kaatre En Vaasal",
            accept: [
              "kaatre en vaasal",
              "katre en vasal",
              "kaatre en vasal",
              "katre en vaasal",
            ],
          },
          {
            id: "tks-4",
            category: "Song",
            imageUrls: tentImages("songs", "megam-karukuthu-mazha-vara-paakuthu", 6),
            answer: "Megam Karukuthu Mazhai Vara Paakuthu",
            accept: [
              "megam karukuthu mazhai vara paakuthu",
              "megam karukuthu mazha vara paakuthu",
              "megam karukuthu",
              "megham karukuthu",
            ],
          },
          {
            id: "tks-5",
            category: "Song",
            imageUrls: tentImages("songs", "muthu-mani-maalai", 6),
            answer: "Muthu Mani Maalai",
            accept: [
              "muthu mani maalai",
              "muthu mani malai",
              "muthumani maalai",
            ],
          },
          {
            id: "tks-6",
            category: "Song",
            imageUrls: tentImages("songs", "naan-autokaaran", 5),
            answer: "Naan Autokaaran",
            accept: [
              "naan autokaaran",
              "nan autokaran",
              "naan auto kaaran",
              "naan autokaran",
              "autokaaran",
            ],
          },
          {
            id: "tks-7",
            category: "Song",
            imageUrls: tentImages("songs", "sangeetha-megam", 5),
            answer: "Sangeetha Megam",
            accept: [
              "sangeetha megam",
              "sangeetha megham",
              "sangita megam",
              "sangeetha megham",
            ],
          },
          {
            id: "tks-8",
            category: "Song",
            imageUrls: tentImages("songs", "sundar-neeyum", 6),
            answer: "Sundari Neeyum Sundaran Naanum",
            accept: [
              "sundari neeyum sundaran naanum",
              "sundari neeyum",
              "sundar neeyum",
              "sundari neeyum sundaran nanum",
            ],
          },
          {
            id: "tks-9",
            category: "Song",
            imageUrls: tentImages("songs", "uppu-karuvaadu", 5),
            answer: "Uppu Karuvadu",
            accept: [
              "uppu karuvadu",
              "uppu karuvaadu",
              "uppu karuvadu song",
            ],
          },
          {
            id: "tks-10",
            category: "Song",
            imageUrls: tentImages("songs", "vaa-kanna", 6),
            answer: "Vaa Kanna Vaa",
            accept: [
              "vaa kanna vaa",
              "vaa kanna",
              "va kanna va",
              "vaa kanha vaa",
            ],
          },
        ],
      },
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

export function tentSection(
  pack: Pack,
  gameId: "tent-kottai-movies" | "tent-kottai-songs",
): TentSection {
  return gameId === "tent-kottai-movies"
    ? pack.games["tent-kottai"].movies
    : pack.games["tent-kottai"].songs;
}
