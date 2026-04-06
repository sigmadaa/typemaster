// Word lists and letter sets for training levels
export const WORDS = {
  ru: {
    level1: ['аа', 'оо', 'ао', 'оа', 'аоа', 'оао'],
    level2: ['авва', 'оло', 'ала', 'вол', 'лов', 'вол'],
    level3: ['фол', 'фол', 'ала', 'сол', 'вал'],
    home: ['фыва', 'олдж', 'фол', 'дол', 'вол', 'жало', 'фаол', 'свод', 'слод'],
    common: [
      'год', 'два', 'три', 'раз', 'там', 'тут', 'вот', 'как', 'что', 'все',
      'уже', 'ещё', 'или', 'нет', 'так', 'его', 'её', 'кто', 'над', 'под',
      'для', 'при', 'без', 'про', 'до', 'по', 'из', 'от', 'во', 'со',
      'мир', 'дом', 'сон', 'день', 'ночь', 'путь', 'час', 'свет', 'тень', 'огонь',
      'дело', 'слово', 'место', 'время', 'жизнь', 'люди', 'рука', 'глаз', 'лицо', 'сила',
      'работа', 'город', 'страна', 'человек', 'вопрос', 'система', 'право', 'власть',
      'первый', 'другой', 'новый', 'старый', 'большой', 'малый', 'сам', 'себя',
      'делать', 'знать', 'идти', 'стать', 'дать', 'брать', 'видеть', 'думать',
      'сказать', 'говорить', 'иметь', 'хотеть', 'мочь', 'встать', 'жить', 'писать'
    ],
    code: [
      'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
      'import', 'export', 'class', 'extends', 'async', 'await', 'try', 'catch',
      'null', 'undefined', 'true', 'false', 'typeof', 'new', 'this', 'super',
      'break', 'continue', 'switch', 'case', 'default', 'throw', 'finally',
      'def', 'print', 'range', 'list', 'dict', 'len', 'str', 'int', 'float',
      'pass', 'lambda', 'yield', 'with', 'from', 'not', 'and', 'or', 'in',
      'data', 'result', 'error', 'index', 'count', 'total', 'value', 'key',
      'user', 'token', 'query', 'input', 'output', 'config', 'state', 'type',
      'item', 'items', 'array', 'object', 'string', 'number', 'boolean',
      'response', 'request', 'callback', 'promise', 'resolve', 'reject',
      'get', 'set', 'post', 'put', 'delete', 'update', 'fetch', 'push', 'pop',
      'filter', 'map', 'reduce', 'find', 'sort', 'slice', 'join', 'split',
      'length', 'size', 'width', 'height', 'id', 'src', 'href', 'style',
      'start', 'stop', 'init', 'load', 'save', 'parse', 'format', 'render',
      'create', 'read', 'write', 'open', 'close', 'connect', 'send',
      'path', 'file', 'url', 'host', 'port', 'method', 'status', 'body',
      'sum', 'min', 'max', 'abs', 'sqrt', 'round', 'floor', 'ceil',
      'log', 'warn', 'info', 'debug', 'test', 'assert', 'expect',
      'then', 'done', 'next', 'run', 'build', 'name', 'password', 'email'
    ]
  },
  en: {
    level1: ['aa', 'ff', 'jj', 'aj', 'fa', 'fj'],
    level2: ['add', 'all', 'fall', 'jag', 'had', 'hall'],
    level3: ['glad', 'flag', 'half', 'fail', 'fad', 'lad'],
    home: ['asdf', 'jkl', 'flag', 'glad', 'dash', 'flask', 'flash', 'lash'],
    common: [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
      'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use',
      'time', 'year', 'good', 'know', 'take', 'them', 'well', 'also', 'back',
      'after', 'being', 'could', 'every', 'first', 'great', 'group', 'house',
      'large', 'light', 'might', 'never', 'night', 'other', 'place', 'point',
      'right', 'round', 'small', 'sound', 'still', 'study', 'their', 'there',
      'thing', 'think', 'three', 'under', 'water', 'where', 'which', 'while',
      'world', 'would', 'write', 'young', 'about', 'above', 'began', 'begin',
      'black', 'bring', 'carry', 'close', 'color', 'cross', 'don\'t', 'earth',
      'found', 'given', 'going', 'hands', 'horse', 'human', 'leave', 'often',
      'plant', 'power', 'story', 'those', 'watch', 'white',
      'started', 'another', 'because', 'between', 'children', 'country',
      'example', 'follow', 'important', 'mountain', 'problem', 'question',
      'through', 'together', 'without', 'something', 'sometimes', 'different',
      'complete', 'everyone', 'language', 'possible', 'sentence', 'together'
    ],
    code: [
      'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
      'import', 'export', 'class', 'extends', 'async', 'await', 'try', 'catch',
      'null', 'undefined', 'true', 'false', 'typeof', 'new', 'this', 'super',
      'break', 'continue', 'switch', 'case', 'default', 'throw', 'finally',
      'data', 'result', 'error', 'index', 'count', 'total', 'value', 'key',
      'user', 'token', 'query', 'input', 'output', 'config', 'state', 'type',
      'item', 'items', 'array', 'object', 'string', 'number', 'boolean',
      'response', 'request', 'callback', 'promise', 'resolve', 'reject',
      'get', 'set', 'post', 'put', 'delete', 'update', 'fetch', 'push', 'pop',
      'filter', 'map', 'reduce', 'find', 'sort', 'slice', 'join', 'split',
      'length', 'size', 'width', 'height', 'id', 'src', 'href', 'style',
      'start', 'stop', 'init', 'load', 'save', 'parse', 'format', 'render',
      'create', 'read', 'write', 'open', 'close', 'connect', 'send',
      'path', 'file', 'url', 'host', 'port', 'method', 'status', 'body',
      'sum', 'min', 'max', 'abs', 'sqrt', 'round', 'floor', 'ceil',
      'log', 'warn', 'debug', 'test', 'assert', 'expect', 'mock',
      'then', 'done', 'next', 'run', 'build', 'name', 'password', 'email',
      'component', 'module', 'service', 'interface', 'interface', 'props',
      'useState', 'useEffect', 'render', 'mounted', 'computed', 'watch'
    ],
    pangrams: [
      'the quick brown fox jumps over the lazy dog',
      'pack my box with five dozen liquor jugs',
      'how vexingly quick daft zebras jump',
      'the five boxing wizards jump quickly',
      'bright vixens jump dozy fowl quack'
    ]
  }
};

export const KEYBOARD_LAYOUTS = {
  ru: {
    rows: [
      ['`','1','2','3','4','5','6','7','8','9','0','-','='],
      ['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],
      ['ф','ы','в','а','п','р','о','л','д','ж','э'],
      ['я','ч','с','м','и','т','ь','б','ю','.'],
      [' ']
    ],
    shifted: {
      '1':'!','2':'"','3':'№','4':';','5':'%','6':':','7':'?','8':'*','9':'(','0':')','е':'Е'
    }
  },
  en: {
    rows: [
      ['`','1','2','3','4','5','6','7','8','9','0','-','='],
      ['q','w','e','r','t','y','u','i','o','p','[',']'],
      ['a','s','d','f','g','h','j','k','l',';',"'"],
      ['z','x','c','v','b','n','m',',','.','/'],
      [' ']
    ],
    shifted: {
      '`':'~','1':'!','2':'@','3':'#','4':'$','5':'%','6':'^','7':'&','8':'*','9':'(','0':')','-':'_','=':'+',
      '[':'{',']':'}','\\':'|',';':':','\'':'"',',':'<','.':'>','/':'?'
    }
  }
};

// Finger zone assignments: key → finger index (0=L.pinky … 7=R.pinky, 8=thumb)
export const FINGER_ZONES = {
  en: buildFingerZones('en'),
  ru: buildFingerZones('ru')
};

function buildFingerZones(lang) {
  const zones = {};
  // Helper: rowIndex, keyIndex → finger
  const map = [
    // Numbers row
    { range: [0,1], finger: 0 }, // ` 1
    { range: [2,2], finger: 1 }, // 2
    { range: [3,3], finger: 2 }, // 3
    { range: [4,5], finger: 3 }, // 4 5
    { range: [6,7], finger: 4 }, // 6 7
    { range: [8,8], finger: 5 }, // 8
    { range: [9,9], finger: 6 }, // 9
    { range: [10,12], finger: 7 }, // 0 - =
  ];

  const layout = KEYBOARD_LAYOUTS[lang];
  layout.rows.forEach((row, ri) => {
    row.forEach((key, ki) => {
      if (key === ' ') { zones[' '] = 8; return; }
      zones[key.toLowerCase()] = getFingerForKey(ri, ki);
    });
  });
  return zones;
}

function getFingerForKey(row, col) {
  // Row 0: numbers
  if (row === 0) {
    if (col <= 1) return 0;       // ` 1 → L.pinky
    if (col === 2) return 1;       // 2 → L.ring
    if (col === 3) return 2;       // 3 → L.middle
    if (col <= 5) return 3;        // 4,5 → L.index
    if (col <= 7) return 4;        // 6,7 → R.index
    if (col === 8) return 5;       // 8 → R.middle
    if (col === 9) return 6;       // 9 → R.ring
    return 7;                      // 0 - = → R.pinky
  }
  // Row 1: QWERTY / ЙЦУКЕН
  if (row === 1) {
    if (col === 0) return 0;
    if (col === 1) return 1;
    if (col === 2) return 2;
    if (col <= 4) return 3;        // r,t / к,е
    if (col <= 6) return 4;        // y,u / н,г
    if (col === 7) return 5;
    if (col === 8) return 6;
    return 7;
  }
  // Row 2: ASDF / ФЫВА
  if (row === 2) {
    if (col === 0) return 0;
    if (col === 1) return 1;
    if (col === 2) return 2;
    if (col <= 4) return 3;        // f,g  / а,п
    if (col <= 6) return 4;        // h,j  / р,о
    if (col === 7) return 5;
    if (col === 8) return 6;
    return 7;
  }
  // Row 3: ZXCV / ЯЧСМ
  if (row === 3) {
    if (col === 0) return 0;
    if (col === 1) return 1;
    if (col === 2) return 2;
    if (col <= 4) return 3;
    if (col <= 6) return 4;
    if (col === 7) return 5;
    if (col === 8) return 6;
    return 7;
  }
  return 8; // space = thumbs
}

export const FINGER_NAMES = [
  'Л. мизинец', 'Л. безымянный', 'Л. средний', 'Л. указательный',
  'П. указательный', 'П. средний', 'П. безымянный', 'П. мизинец',
  'Большие пальцы'
];

export const FINGER_COLORS = [
  '#e74c3c', // L.pinky   - red
  '#e67e22', // L.ring    - orange
  '#f1c40f', // L.middle  - yellow
  '#2ecc71', // L.index   - green
  '#1abc9c', // R.index   - teal
  '#3498db', // R.middle  - blue
  '#9b59b6', // R.ring    - purple
  '#e91e63', // R.pinky   - pink
  '#95a5a6'  // Thumbs    - gray
];
