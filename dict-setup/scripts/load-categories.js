const {loadCategory} = require('../lib/load-category');


let wordPattern = /^[a-zA-Z][a-zA-Z -]+$/;

let wholeLine = (line) => {
    if (!wordPattern.test(line)) {
        return null;
    }
    return line;
};

let loadSettings = {
    junior: {
        file: 'wl-junior-1.txt',
        categories: {junior: 1},
        skipCondition: null,
        extractWord: wholeLine
    },
    senior: {
        file: 'wl-junior-2.txt',
        categories: {junior: 2},
        skipCondition: (categories) => categories.junior === 1,
        extractWord: wholeLine

    },
    cet4: {
        file: 'wl-cet4.txt',
        categories: {cet: 4},
        skipCondition: (categories) => categories.junior,
        extractWord: wholeLine
    },
    cet6: {
        file: 'wl-cet6.txt',
        categories: {cet: 6},
        skipCondition: (categories) => categories.junior || categories.cet === 4,
        extractWord: wholeLine
    },
    gre: {
        file: 'wl-gre.txt',
        categories: {gre: true},
        skipCondition: (categories) => categories.junior,
        extractWord: wholeLine
    },
    yasi: {
        file: 'wl-yasi.txt',
        categories: {yasi: true},
        skipCondition: (categories) => categories.junior,
        extractWord: wholeLine
    },
    pro: {
        file: 'wl-pro.txt',
        categories: {pro: 1},
        skipCondition: (categories) => categories.junior || categories.cet,
        extractWord: wholeLine
    }
};

for (let level = 1; level <= 5; level++) {
    loadSettings['haici' + level] = {
        file: `wl-hc2w-${level}.txt`,
        categories: {haici: level},
        skipCondition: null,
        extractWord: wholeLine
    }
}

let freqFiles = [
    ['coca', 'wl-COCA20000.txt'],
    ['bnc', 'wl-bnc15000.txt'],
    ['anc', 'wl-anc30000.txt']];

for (let [name, file] of freqFiles) {
    loadSettings[name] = {
        file: file,
        categories: lineNo => {
            let rank = parseInt(lineNo / 1000) + 1;
            return {[name]: rank};
        },
        skipCondition: null,
        extractWord: wholeLine
    }
}


// loadCategory(loadSettings.junior);
// loadCategory(loadSettings.senior);
// loadCategory(loadSettings.cet4);
// loadCategory(loadSettings.cet6);
// loadCategory(loadSettings.gre);
// loadCategory(loadSettings.yasi);
// loadCategory(loadSettings.pro);
// loadCategory(loadSettings.haici5);
// loadCategory(loadSettings.haici4);
// loadCategory(loadSettings.haici3);
// loadCategory(loadSettings.haici2);
// loadCategory(loadSettings.haici1);
// loadCategory(loadSettings.coca);
// loadCategory(loadSettings.bnc);
// loadCategory(loadSettings.anc);
