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
          title: "Enna Satham Indha Neram",
          movie: "Punnagai Mannan",
          audioUrl: "/packs/tamil-party/audio/enna-satham-indha-neram.m4a",
          accept: [
            "enna satham indha neram",
            "enna satham intha neram",
            "enna satham",
          ],
        },
        {
          id: "sp-2",
          title: "Ilaya Nila",
          movie: "Payanangal Mudivathillai",
          audioUrl: "/packs/tamil-party/audio/ilaya-nila.m4a",
          accept: ["ilaya nila", "ilaya nila pozhuthu"],
        },
        {
          id: "sp-3",
          title: "Raja Raja Chozhan",
          movie: "Rettai Vaal Kuruvi",
          audioUrl: "/packs/tamil-party/audio/raja-raja-chozhan.m4a",
          accept: ["raja raja chozhan", "raja raja cholan"],
        },
        {
          id: "sp-4",
          title: "Panivizhum",
          movie: "Ninaivellam Nithya",
          audioUrl: "/packs/tamil-party/audio/panivizhum.opus",
          accept: ["panivizhum", "pani vizhum", "panivizhum iravu"],
        },
        {
          id: "sp-5",
          title: "Pudhucheri Kacheri",
          movie: "Duet",
          audioUrl: "/packs/tamil-party/audio/pudhucheri-kacheri.opus",
          accept: [
            "pudhucheri kacheri",
            "puducherry kacheri",
            "pudhucherry kacheri",
          ],
        },
        {
          id: "sp-6",
          title: "Meenamma",
          movie: "Rajakumaran",
          audioUrl: "/packs/tamil-party/audio/meenamma.opus",
          accept: ["meenamma", "meenama"],
        },
        {
          id: "sp-7",
          title: "Andhi Mazhai",
          movie: "Nayakan",
          audioUrl: "/packs/tamil-party/audio/andhi-mazhai.opus",
          accept: ["andhi mazhai", "andhi mazhai megam"],
        },
        {
          id: "sp-8",
          title: "Pudhu Vellai Mazhai",
          movie: "Roja",
          audioUrl: "/packs/tamil-party/audio/pudhu-vellai-mazhai.opus",
          accept: ["pudhu vellai mazhai", "pudhu vellai mazhai"],
        },
        {
          id: "sp-9",
          title: "Mandram Vantha",
          movie: "Mouna Ragam",
          audioUrl: "/packs/tamil-party/audio/mandram-vantha.opus",
          accept: ["mandram vantha", "mandram vandha", "mandram vantha thendralukku"],
        },
        {
          id: "sp-10",
          title: "Sundari",
          movie: "Thalapathi",
          audioUrl: "/packs/tamil-party/audio/sundari.opus",
          accept: ["sundari", "sundari kannal", "sundari kannal oru seithi"],
        },
      ],
    },
    "tamil-charades": {
      rules: { seconds: 60, pointsCorrect: 15 },
      movies: [
        {
          id: "m-1",
          title: "Kottai Mariamman",
          year: 2001,
          accept: ["kottai mariamman", "kottaimariamman"],
        },
        {
          id: "m-2",
          title: "Mounaragam",
          year: 1986,
          accept: ["mounaragam", "mouna ragam", "mouna raagam"],
        },
        {
          id: "m-3",
          title: "Amaidhipadai",
          year: 1994,
          accept: ["amaidhipadai", "amaithi padai", "amaithipadai"],
        },
        {
          id: "m-4",
          title: "Kadhalikka Neramillai",
          year: 1964,
          accept: ["kadhalikka neramillai", "kadhalika neramillai", "kathalikka neramillai"],
        },
        {
          id: "m-5",
          title: "Sangamam",
          year: 1999,
          accept: ["sangamam"],
        },
        {
          id: "m-6",
          title: "Sattam Oru Iruttarai",
          year: 1981,
          accept: ["sattam oru iruttarai", "sattam oru irutarai"],
        },
        {
          id: "m-7",
          title: "Aboorva Sagotharargal",
          year: 1989,
          accept: [
            "aboorva sagotharargal",
            "apoorva sagodharargal",
            "apoorva sagotharargal",
            "appu raja",
          ],
        },
        {
          id: "m-8",
          title: "Gentleman",
          year: 1993,
          accept: ["gentleman"],
        },
        {
          id: "m-9",
          title: "Mullum Malarum",
          year: 1978,
          accept: ["mullum malarum"],
        },
        {
          id: "m-10",
          title: "Nerukku Ner",
          year: 1997,
          accept: ["nerukku ner"],
        },
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
