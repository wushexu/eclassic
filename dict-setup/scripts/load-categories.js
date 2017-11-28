const {loadCategory} = require('../lib/load-category');


let wordPattern = /^[a-zA-Z][a-zA-Z -]+$/;

let loadSettings = {
    junior: {
        file: 'junior.txt',
        categories: {junior: 1},
        skipCondition: null,
        extractWord: (line) => {
            let word = line.split('\t')[0];
            word = word.trim();
            if (!/^[a-zA-Z][a-zA-Z -]*$/.test(word)) {
                return null;
            }
            return word;
        }
    },
    senior: {
        file: 'senior.txt',
        categories: {junior: 2},
        skipCondition: (categories) => categories.junior === 1,
        extractWord: (line) => {
            line = line.trimLeft();
            let word = line.split(' ')[0];
            if (!wordPattern.test(word)) {
                return null;
            }
            return word;
        }

    },
    cet4: {
        file: 'cet4.csv',
        categories: {cet4: true},
        skipCondition: (categories) => categories.junior,
        extractWord: (line) => {
            let word = line.split(',')[0];
            if (!wordPattern.test(word)) {
                return null;
            }
            return word;
        }
    },
    cet6: {
        file: 'cet6.txt',
        categories: {cet6: true},
        skipCondition: (categories) => categories.junior || categories.cet4,
        extractWord: (line) => {
            let word = line.split(' ')[0];
            if (!wordPattern.test(word)) {
                return null;
            }
            return word;
        }
    },
    gre: {
        file: 'gre.txt',
        categories: {gre: true},
        skipCondition: null,
        extractWord: (line) => {
            if (!wordPattern.test(line)) {
                return null;
            }
            return line;
        }
    },
    yasi: {
        file: 'yasi.txt',
        categories: {yasi: true},
        skipCondition: null,
        extractWord: (line) => {
            if (!/^\d+ [a-zA-Z]+$/.test(line)) {
                return null;
            }
            return line.split(' ')[1];
        }
    }
};

for (let level = 1; level <= 5; level++) {
    loadSettings['haici' + level] = {
        file: `hc2w-${level}.txt`,
        categories: {haici: level},
        skipCondition: null,
        extractWord: (line) => {
            if (!wordPattern.test(line)) {
                return null;
            }
            return line;
        }
    }
}


loadCategory(loadSettings.haici5);
