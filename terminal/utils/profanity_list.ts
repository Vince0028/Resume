export const PROFANITY_LIST = [
    // English
    "fuck", "shit", "bitch", "ass", "asshole", "bastard", "damn", "cunt", "dick", "pussy",
    "cock", "sucker", "motherfucker", "fucker", "nigger", "nigga", "fag", "faggot", "slut", "whore",
    "douche", "dumbass", "retard", "idiot", "stupid", "moron", "imbecile", "sex", "porn", "xxx",
    "nude", "naked", "boobs", "tits", "penis", "vagina", "anal", "oral", "blowjob", "handjob",
    "cum", "sperm", "orgasm", "masturbate", "rape", "molest", "pedophile", "incest", "beastiality",
    "goddamn", "hell", "crap", "bullshit", "prick", "twat", "wanker", "bollocks", "bugger",
    "chink", "gook", "spic", "kike", "wetback", "tranny", "shemale", "dyke", "lesbo", "homo",
    "fatso", "lardass", "scum", "trash", "filth", "pig", "cow", "dog", "snake", "rat",
    "loser", "failure", "disappointment", "ugly", "freak", "monster", "demon", "devil", "satan",
    "kill", "murder", "suicide", "die", "death", "dead", "blood", "gore", "violence", "abuse",
    "drug", "cocaine", "heroin", "meth", "weed", "marijuana", "high", "stoned", "drunk", "wasted",
    "bomb", "terrorist", "isis", "nazi", "hitler", "kkk", "slave", "slavery", "racist", "bigot",

    // Tagalog
    "gago", "tanga", "inutil", "bobo", "putangina", "putang", "inanet", "puke", "pepek", "kiki",
    "titi", "burat", "oten", "bayag", "kantot", "iyot", "jakol", "himas", "salsal", "lolo",
    "tarantado", "giba", "siraulo", "baliw", "buwisit", "leche", "lintik", "hindot", "punyeta",
    "ulol", "unggoy", "baboy", "hayop", "demonyo", "hudas", "balimbing", "sipsip", "plastik",
    "bading", "bakla", "tomboy", "tibibo", "silahis", "binabae", "shokla", "fok",
    "pokpok", "puta", "walker", "kalandian", "malandi", "higad", "makati", "libog", "manyak",
    "bastos", "walanghiya", "kapal", "kupal", "epal", "tanga", "engot", "gunggong", "hangal",
    "mangmang", "abnoy", "mongoloid", "spastic", "ngongo", "nguso", "ngiwi", "pangit", "chaka",
    "gurang", "thunders", "laos", "tanders", "gurangers", "badjao", "ita", "negra", "negro",
    "bisaya", "probinsyano", "inday", "boy", "katulong", "chimay", "alipin", "dukha", "pulubi",
    "patay", "mamatay", "pagpatay", "baril", "saksak", "holdup", "magnanakaw", "snatcher", "adik",
    "shabu", "marijuana", "damo", "bato", "rugby", "lasing", "lasinggero", "sugarol", "sabungero",
    "manloloko", "scammer", "budol", "tigas", "ulo", "matigas", "pasaway", "suwail", "salbahe",
    "demonyo", "satanas", "impyerno", "hudas", "barumbado", "basag", "ulo", "basagulero", "warfreak",
    "eskandalo", "chismis", "chismosa", "pakialamera", "epal", "bida", "bidabida", "pabida",
    "putang ina mo", "ina mo", "gaga", "punyeta", "tae", "potek", "letse", "hayop", "lintik",
    "utot", "peepee", "walang hiya", "pakyu", "pakshet", "tangina", "tang ina", "boba",
    "buang", "putragis", "batugan", "putik", "sira ulo", "syet", "shet", "kupal", "hudas",
    "burat", "ungas", "hinayupak", "pucha", "pesteng yawa", "supot", "animal",
    "kainin mo tae ko", "anak ng tokwa", "tokwa", "gunggong"
];

export const filterProfanity = (text: string): string => {
    let filteredText = text;
    PROFANITY_LIST.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });
    return filteredText;
};
