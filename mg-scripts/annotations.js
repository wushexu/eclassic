function loadDefault() {
    let family = db.annotation_families.findOne({isDefault: true});
    if (family) {
        print('found, ' + family.name);
        return family;
    }
    family = {name: '英语-1', isDefault: true, version: 1};
    let result = db.annotation_families.insertOne(family);
    family._id = result.insertedId;
    print('insert, ' + family._id.str);
    return family;
}


function loadAnnotitions(family) {
    if (!family || !family._id) {
        print('family missing.');
        return;
    }

    let familyId = family._id.str;


    let compact = [
        {
            name: '词类',
            nameEn: 'Parts of Speech',
            tagName: null,
            cssClass: 'pos',
            dataName: 'pos',
            annotations: [
                //nameEn,name,dataValue
                ['Noun', '名词', 'pn'],
                ['Verb', '动词', 'pv'],
                ['Adjective', '形容词', 'pa'],
                ['Adverb', '副词', 'pd'],
                ['Interjection', '感叹词', 'pi'],
                ['Preposition', '介词', 'pp'],
                // ['Pronoun', '代词', 'pr'],
                ['Conjunction', '连词', 'pc']
            ]
        }, {
            name: '名词',
            nameEn: 'Noun',
            tagName: null,
            cssClass: 'noun',
            dataName: 'noun',
            annotations: [
                // ['Individual Nouns', '个体名词', 'ni'],
                ['Collective Nouns', '集体名词', 'nc'],
                ['Material Nouns', '物质名词', 'nm'],
                ['Abstract Nouns', '抽象名词', 'na'],
                ['Countable Nouns', '可数', 'nn'],
                ['Uncountable Nouns', '不可数', 'nu'],
                ['Singular Form', '单数', 'ns'],
                ['Plural Form', '复数', 'np'],
                ['Gerund', '动名词', 'ng']
            ]
        }, {
            name: '动词',
            nameEn: 'Verb',
            tagName: null,
            cssClass: 'verb',
            dataName: 'verb',
            annotations: [
                ['Transitive Verbs', '及物', 'vt'],
                ['Intransitive Verbs', '不及物', 'vi'],
                ['Ergative Verbs', '及物/不及物', 've'],
                ['Link-verbs', '系动词', 'vl'],
                ['Modal Verbs', '情态动词', 'vm'],
                ['Irregular Verbs', '不规则', 'vr'],
                ['Ditransitive Verbs', '双宾动词', 'vd'],
                ['Instantaneous Verbs', '短暂动词', 'vs']
            ]
        }, {
            name: '成分',
            nameEn: 'Members of the Sentence',
            tagName: null,
            cssClass: 'memb',
            dataName: 'memb',
            annotations: [
                ['Subject', '主语', 'ms'],
                ['Predicate', '谓语', 'mp'],
                ['Object', '宾语', 'mo'],
                ['Direct Object', '直接宾语', 'md'],
                ['Indirect Object', '间接宾语', 'mi'],
                ['Predicative', '表语', 'me'],
                ['Attribute', '定语', 'ma'],
                ['Adverbial', '状语', 'mv'],
                ['Appositive', '同位语', 'mt'],
                ['Parenthesis', '插入语', 'mr'],
                ['Participial Phrases', '分词小句', 'mc']
            ]
        }, {
            name: '从句',
            nameEn: 'Clauses',
            tagName: null,
            cssClass: 'clau',
            dataName: 'clau',
            annotations: [
                ['Subject Clauses', '主语从句', 'cs'],
                ['Object Clauses', '宾语从句', 'co'],
                ['Predicative Clauses', '表语从句', 'cp'],
                ['Attributive Clauses', '定语从句', 'ca'],
                ['Appositive Clauses', '同位语从句', 'ct'],
                ['Adverbial Clauses', '状语从句', 'cd'],
                ['Antecedent', '先行词', 'cc'],
                ['Relative', '引导词', 'cr']
            ]
        },
        {
            name: '时态',
            nameEn: 'Tense',
            tagName: null,
            cssClass: 'tens',
            dataName: 'tens',
            annotations: [
                ['Present Indefinite', '现在时', 'tp'],
                ['Present Continuous', '现在进行时', 'tc'],
                ['Present Perfect', '现在完成时', 'tr'],
                ['Present Perfect Continuous', '现在完成进行时', 'te'],
                ['Past Indefinite', '过去时', 'ta'],
                ['Past Future', '过去将来时', 'tf'],
                ['Past Continuous', '过去进行时', 'ts'],
                ['Past Perfect', '过去完成时', 'tt'],
                ['Future Indefinite', '将来时', 'tu'],
                ['Future Perfect', '将来完成时', 'tz']
            ]
        },
        {
            name: '短语',
            nameEn: 'Phrases',
            tagName: null,
            cssClass: 'phra',
            dataName: 'phra',
            annotations: [
                ['Infinitive Phrases', '不定式短语', 'hi'],
                ['Phrasal Verbs', '成语动词', 'hp'],
                ['Prepositional Phrases', '介词短语', 'hr'],
                ['phrases1', '词组1', 'g1'],
                ['phrases2', '词组2', 'g2'],
                ['phrases3', '词组3', 'g3']
            ]
        }, {
            name: '其他',
            nameEn: 'Misc',
            tagName: null,
            cssClass: 'misc',
            dataName: 'misc',
            annotations: [
                ['Idiom', '习语', 'wi'],
                ['Slang', '俚语', 'ws'],
                ['Colloquial', '口语', 'wc'],
                ['Euphemism', '委婉语', 'we'],
                ['Figurative', '比喻义', 'wf'],
                ['Passive Voice', '被动语态', 'sp'],
                ['Imperative Mood', '祈使语气', 'si'],
                ['Subjunctive Mood', '虚拟语气', 'ss'],
                ['Footnote', '脚注', 'sf'],
                ['Careful', '注意', 'sc'],
                ['Inversion', '倒装', 'sv'],
                ['Ellipsis', '省略', 'se']
            ]
        }
    ];


    let groups = [];
    let no = 1;

    for (let compactGroup of compact) {
        let group = {familyId};
        group.name = compactGroup.name;
        group.nameEn = compactGroup.nameEn;
        let {tagName, cssClass, dataName} = compactGroup;
        if (tagName) {
            tagName = tagName.toUpperCase();
        }
        group.tagName = tagName;
        group.cssClass = cssClass;
        group.dataName = dataName;
        group.no = (no++);
        group.version = 1;
        groups.push(group);

        let annotations = group.annotations = [];
        for (let annotationProps of compactGroup.annotations) {
            let [nameEn, name, dataValue] = annotationProps;
            let ann = {};
            ann.name = name;
            ann.nameEn = nameEn;
            ann.dataValue = dataValue;
            annotations.push(ann);
        }
    }

    for (let group of groups) {
        db.annotation_groups.insertOne(group);
    }

}

loadAnnotitions(loadDefault());
