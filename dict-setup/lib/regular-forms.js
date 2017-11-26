function regularPl(word) {
    let len = word.length;
    let last1 = word[len - 1];
    if (last1 === 's' || last1 === 'x') {
        return word + 'es';
    }
    let last2 = word.substr(len - 2);
    if (last2 === 'ch' || last2 === 'sh') {
        return word + 'es';
    }
    if (/[^aeiou]y/.test(last2)) {
        return word.substring(0, len - 1) + 'ies';
    }
    if (last1 === 'o') {
        // if (/[aeiou]/.test(word[len - 2])) {
        //     return word + 's';
        // }
        return word + 'es';
    }
    // if (last1 === 'f' || last2 === 'fe') {
    //     word = word.substring(0, (last1 === 'f') ? len - 1 : len - 2);
    //     return word + 'ves';
    // }
    return word + 's';
}

function regularTPS(word) {
    let len = word.length;
    let last1 = word[len - 1];
    if (last1 === 's' || last1 === 'x' || last1 === 'o') {
        return word + 'es';
    }
    let last2 = word.substr(len - 2);
    if (last2 === 'ch' || last2 === 'sh') {
        return word + 'es';
    }
    if (/[^aeiou]y/.test(last2)) {
        return word.substring(0, len - 1) + 'ies';
    }
    return word + 's';
}

function regularPast(word) {
    let len = word.length;
    let last1 = word[len - 1];
    if (last1 === 'e') {
        return word + 'd';
    }
    let last2 = word.substr(len - 2);
    if (/[^aeiou]y/.test(last2)) {
        return word.substring(0, len - 1) + 'ied';
    }
    // if (last1 === 'x') {
    //     return word + 'ed';
    // }
    // if (last1 === 'l' && /[aeiou][aeiou]l$/.test(word)) {
    //     return word + 'ed';
    // }
    // if (/[aeiou][^aeiou]$/.test(word)) {
    //     // if 重读
    //     return word + last1 + 'ed';
    // }
    return word + 'ed';
}


function regularPresentP(word) {
    let len = word.length;
    let last1 = word[len - 1];
    if (last1 === 'e') {
        return word.substring(0, len - 1) + 'ing';
    }
    // if (/[aeiou][^aeiou]$/.test(word)) {
    //     // if 重读
    //     return word + last1 + 'ing';
    // }

    return word + 'ing';
}

module.exports = {regularPl, regularTPS, regularPast, regularPresentP};