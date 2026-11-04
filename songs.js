// Real Polyphonic Songs & Rhymes Database for Talking Angela
// Each song includes real polyphonic musical steps (Bass, Chords, Beats, Lead) + Lyrics

const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, B3 = 246.94;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

const ANGELA_SONGS = [
    {
        id: 'amra_sobai_raja',
        title: '👑 আমরা সবাই রাজা (Amra Sobai Raja)',
        category: 'জনপ্রিয় বাংলা গান (Popular Bangla)',
        bpm: 120,
        lyrics: [
            "আমরা সবাই রাজা আমাদের এই রাজার রাজত্বে,",
            "নইলে মোদের রাজার সনে মিলব কী সত্ত্বে?",
            "আমরা যা খুশি তাই করি,",
            "তবু তাঁর খুশিতেই চরি,",
            "আমরা নই বাঁধা নই দাসের রাজার ত্রাসে—",
            "আমরা সবাই রাজা!"
        ],
        steps: [
            { duration: 1, bass: C3, chord: [E4, G4], lead: C4, beat: 'kick', line: "আমরা সবাই রাজা আমাদের এই..." },
            { duration: 1, bass: G3, chord: [D4, G4], lead: E4, beat: 'snare', line: "আমরা সবাই রাজা আমাদের এই..." },
            { duration: 1, bass: A3, chord: [C4, E4], lead: G4, beat: 'kick', line: "...রাজার রাজত্বে!" },
            { duration: 1, bass: F3, chord: [A3, C4], lead: A4, beat: 'snare', line: "...রাজার রাজত্বে!" },
            { duration: 1, bass: C3, chord: [E4, G4], lead: G4, beat: 'kick', line: "নইলে মোদের রাজার সনে..." },
            { duration: 1, bass: G3, chord: [D4, G4], lead: E4, beat: 'snare', line: "...মিলব কী সত্ত্বে?" },
            { duration: 1, bass: F3, chord: [A3, C4], lead: D4, beat: 'kick', line: "আমরা যা খুশি তাই করি..." },
            { duration: 1, bass: C3, chord: [E4, G4], lead: C4, beat: 'snare', line: "আমরা সবাই রাজা!" }
        ]
    },
    {
        id: 'hattima_tim',
        title: '🥚 হাট্টিমা টিম টিম (Hattima Tim Tim)',
        category: 'জনপ্রিয় বাংলা ছড়া (Bangla Rhyme)',
        bpm: 125,
        lyrics: [
            "হাট্টিমা টিম টিম, তারা মাঠে পাড়ে ডিম,",
            "তাদের খাড়া দুটো শিং,",
            "তারা হাট্টিমা টিম টিম!",
            "গাছে তাদের বাস নয়, থাকে তারা মাঠে,",
            "শিং নেড়ে তারা ডিম পাড়ে ঘাটে!"
        ],
        steps: [
            { duration: 0.9, bass: G3, chord: [B3, D4], lead: G4, beat: 'kick', line: "হাট্টিমা টিম টিম..." },
            { duration: 0.9, bass: G3, chord: [B3, D4], lead: B4, beat: 'snare', line: "...তারা মাঠে পাড়ে ডিম!" },
            { duration: 0.9, bass: C3, chord: [E4, G4], lead: C5, beat: 'kick', line: "তাদের খাড়া দুটো শিং..." },
            { duration: 0.9, bass: D3, chord: [F4, A4], lead: A4, beat: 'snare', line: "...তারা হাট্টিমা টিম টিম!" },
            { duration: 0.9, bass: G3, chord: [B3, D4], lead: G4, beat: 'kick', line: "গাছে তাদের বাস নয়..." },
            { duration: 0.9, bass: E3, chord: [G4, B4], lead: E4, beat: 'snare', line: "...থাকে তারা মাঠে!" }
        ]
    },
    {
        id: 'ata_gache',
        title: '🦜 আতা গাছে তোতা পাখি (Ata Gache Tota Pakhi)',
        category: 'জনপ্রিয় বাংলা ছড়া (Bangla Rhyme)',
        bpm: 115,
        lyrics: [
            "আতা গাছে তোতা পাখি,",
            "ডালিম গাছে মৌ,",
            "এত ডাকি তবু কথা",
            "কও না কেন বউ?",
            "মিষ্টি করে হেসে দাও,",
            "আমায় একটু আদর দাও!"
        ],
        steps: [
            { duration: 1, bass: F3, chord: [A3, C4], lead: C4, beat: 'kick', line: "আতা গাছে তোতা পাখি..." },
            { duration: 1, bass: C3, chord: [E4, G4], lead: E4, beat: 'snare', line: "...ডালিম গাছে মৌ!" },
            { duration: 1, bass: D3, chord: [F4, A4], lead: F4, beat: 'kick', line: "এত ডাকি তবু কথা..." },
            { duration: 1, bass: G3, chord: [B3, D4], lead: G4, beat: 'snare', line: "...কও না কেন বউ?" },
            { duration: 1, bass: C3, chord: [E4, G4], lead: C5, beat: 'kick', line: "মিষ্টি করে হেসে দাও..." },
            { duration: 1, bass: F3, chord: [A3, C4], lead: A4, beat: 'snare', line: "আমায় একটু আদর দাও! 💖" }
        ]
    },
    {
        id: 'chad_utheche',
        title: '🌙 চাঁদ উঠেছে ফুল ফুটেছে (Chad Utheche)',
        category: 'জনপ্রিয় বাংলা ছড়া (Bangla Rhyme)',
        bpm: 110,
        lyrics: [
            "চাঁদ উঠেছে ফুল ফুটেছে,",
            "কদম তলায় কে?",
            "হাতি নাচছে ঘোড়া নাচছে,",
            "সোনামণির বে!",
            "ঘুম পাড়ানি মাসি পিসি,",
            "মোদের বাড়ি যেয়ো!"
        ],
        steps: [
            { duration: 1, bass: C3, chord: [E4, G4], lead: G4, beat: 'kick', line: "চাঁদ উঠেছে ফুল ফুটেছে..." },
            { duration: 1, bass: A3, chord: [C4, E4], lead: A4, beat: 'snare', line: "...কদম তলায় কে?" },
            { duration: 1, bass: F3, chord: [A3, C4], lead: F4, beat: 'kick', line: "হাতি নাচছে ঘোড়া নাচছে..." },
            { duration: 1, bass: G3, chord: [B3, D4], lead: G4, beat: 'snare', line: "...সোনামণির বে!" },
            { duration: 1, bass: C3, chord: [E4, G4], lead: C5, beat: 'kick', line: "ঘুম পাড়ানি মাসি পিসি..." },
            { duration: 1, bass: G3, chord: [D4, G4], lead: C4, beat: 'snare', line: "মোদের বাড়ি যেয়ো! 🌙" }
        ]
    },
    {
        id: 'baby_shark',
        title: '🦈 Baby Shark Doo Doo (Theme Hit)',
        category: 'English Popular Song',
        bpm: 135,
        lyrics: [
            "Baby shark, doo doo doo doo doo doo!",
            "Baby shark, doo doo doo doo doo doo!",
            "Baby shark, doo doo doo doo doo doo!",
            "Baby shark! 🦈",
            "Mommy shark, doo doo doo doo doo doo!",
            "Daddy shark, doo doo doo doo doo doo!"
        ],
        steps: [
            { duration: 0.8, bass: D3, chord: [F4, A4], lead: D4, beat: 'kick', line: "Baby shark doo doo..." },
            { duration: 0.8, bass: D3, chord: [F4, A4], lead: E4, beat: 'snare', line: "...doo doo doo doo!" },
            { duration: 0.8, bass: G3, chord: [B3, D4], lead: G4, beat: 'kick', line: "Baby shark doo doo..." },
            { duration: 0.8, bass: G3, chord: [B3, D4], lead: G4, beat: 'snare', line: "Baby Shark! 🦈" },
            { duration: 0.8, bass: D3, chord: [F4, A4], lead: D4, beat: 'kick', line: "Mommy shark doo doo..." },
            { duration: 0.8, bass: G3, chord: [B3, D4], lead: G4, beat: 'snare', line: "Daddy shark! ✨" }
        ]
    },
    {
        id: 'twinkle',
        title: '⭐ Twinkle Twinkle Little Star (Lullaby)',
        category: 'English Classic Song',
        bpm: 95,
        lyrics: [
            "Twinkle, twinkle, little star,",
            "How I wonder what you are!",
            "Up above the world so high,",
            "Like a diamond in the sky.",
            "Twinkle, twinkle, little star,",
            "How I wonder what you are!"
        ],
        steps: [
            { duration: 1.2, bass: C3, chord: [E4, G4], lead: C4, beat: 'kick', line: "Twinkle, twinkle, little star..." },
            { duration: 1.2, bass: C3, chord: [E4, G4], lead: G4, beat: null, line: "Twinkle, twinkle, little star..." },
            { duration: 1.2, bass: F3, chord: [A3, C4], lead: A4, beat: 'kick', line: "How I wonder what you are..." },
            { duration: 1.2, bass: C3, chord: [E4, G4], lead: G4, beat: null, line: "How I wonder what you are!" },
            { duration: 1.2, bass: F3, chord: [A3, C4], lead: F4, beat: 'kick', line: "Up above the world so high..." },
            { duration: 1.2, bass: C3, chord: [E4, G4], lead: E4, beat: null, line: "Like a diamond in the sky ⭐" }
        ]
    },
    {
        id: 'frozen_letitgo',
        title: '❄️ Let It Go - Frozen Theme Melody',
        category: 'Disney Theme Melody',
        bpm: 120,
        lyrics: [
            "The snow glows white on the mountain tonight,",
            "Not a footprint to be seen...",
            "Let it go, let it go!",
            "Can't hold it back anymore!",
            "Let it go, let it go!",
            "Turn away and slam the door!"
        ],
        steps: [
            { duration: 1, bass: A3, chord: [C4, E4], lead: E4, beat: 'kick', line: "The snow glows white on the mountain..." },
            { duration: 1, bass: F3, chord: [A3, C4], lead: F4, beat: 'snare', line: "...not a footprint to be seen!" },
            { duration: 1, bass: C3, chord: [E4, G4], lead: G4, beat: 'kick', line: "Let it go, let it go! ❄️" },
            { duration: 1, bass: G3, chord: [B3, D4], lead: D5, beat: 'snare', line: "Can't hold it back anymore!" },
            { duration: 1, bass: A3, chord: [C4, E4], lead: C5, beat: 'kick', line: "Let it go! ❄️✨" }
        ]
    }
];

window.ANGELA_SONGS = ANGELA_SONGS;
