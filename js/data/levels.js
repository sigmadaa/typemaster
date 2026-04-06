// Level definitions for the training system
export const LEVELS = [
  // Tier 1: Home position basics
  {
    id: 1, name: 'Уровень 1', title: 'Первые пальцы',
    description: 'Клавиши А и О. Позиция рук.',
    chars: { ru: 'ао', en: 'af' },
    minSpeed: 20, minAccuracy: 95, wordCount: 20, duration: 60,
    unlock: 'homeRow'
  },
  {
    id: 2, name: 'Уровень 2', title: 'Левая сторона',
    description: 'Домашний ряд: Ф, Ы, В, А',
    chars: { ru: 'фыва', en: 'asdf' },
    minSpeed: 30, minAccuracy: 95, wordCount: 25, duration: 60,
    unlock: null
  },
  {
    id: 3, name: 'Уровень 3', title: 'Правая сторона',
    description: 'Домашний ряд: П, Р, О, Л, Д',
    chars: { ru: 'фываПРОЛД'.toLowerCase(), en: 'asdfghjkl' },
    minSpeed: 40, minAccuracy: 95, wordCount: 30, duration: 60,
    unlock: null
  },
  {
    id: 4, name: 'Уровень 4', title: 'Полный домашний ряд',
    description: 'Весь домашний ряд плюс пробел',
    chars: { ru: 'фываолдж прл', en: 'asdfghjkl ;' },
    minSpeed: 50, minAccuracy: 95, wordCount: 30, duration: 60,
    unlock: null
  },
  {
    id: 5, name: 'Уровень 5', title: 'Домашний ряд — слова',
    description: 'Простые слова из домашнего ряда',
    chars: { ru: 'фываолджэ', en: 'asdfghjkl' },
    wordMode: true,
    minSpeed: 60, minAccuracy: 95, wordCount: 30, duration: 60,
    unlock: null
  },
  // Tier 2: Upper row
  {
    id: 6, name: 'Уровень 6', title: 'Верхний ряд — левая',
    description: 'Й, Ц, У, К, Е',
    chars: { ru: 'йцукефывао', en: 'qwertasdf' },
    wordMode: true,
    minSpeed: 60, minAccuracy: 94, wordCount: 35, duration: 90,
    unlock: null
  },
  {
    id: 7, name: 'Уровень 7', title: 'Верхний ряд — правая',
    description: 'Н, Г, Ш, Щ, З',
    chars: { ru: 'нгшщзолджэ', en: 'yuiophjkl' },
    wordMode: true,
    minSpeed: 65, minAccuracy: 94, wordCount: 35, duration: 90,
    unlock: null
  },
  {
    id: 8, name: 'Уровень 8', title: 'Весь верхний ряд',
    description: 'Все буквы верхнего и домашнего рядов',
    chars: { ru: 'йцукенгшщзхфываолдж', en: 'qwertyuiopasdfghjkl' },
    wordMode: true,
    minSpeed: 70, minAccuracy: 94, wordCount: 40, duration: 90,
    unlock: null
  },
  // Tier 3: Lower row
  {
    id: 9, name: 'Уровень 9', title: 'Нижний ряд',
    description: 'Я, Ч, С, М, И, Т, Ь, Б, Ю',
    chars: { ru: 'ячсмитьбю', en: 'zxcvbnm' },
    wordMode: true,
    minSpeed: 70, minAccuracy: 93, wordCount: 40, duration: 90,
    unlock: null
  },
  {
    id: 10, name: 'Уровень 10', title: 'Все буквы',
    description: 'Полный алфавит — все три ряда',
    chars: { ru: null, en: null }, // all chars
    wordMode: true,
    minSpeed: 80, minAccuracy: 93, wordCount: 40, duration: 120,
    unlock: null
  },
  // Tier 4: Common words
  {
    id: 11, name: 'Уровень 11', title: 'Слова — начало',
    description: 'Короткие частотные слова',
    wordMode: true, useCommon: true, wordLength: [2, 4],
    minSpeed: 80, minAccuracy: 93, wordCount: 50, duration: 120,
    unlock: null
  },
  {
    id: 12, name: 'Уровень 12', title: 'Слова — средние',
    description: 'Слова 4-6 символов',
    wordMode: true, useCommon: true, wordLength: [4, 6],
    minSpeed: 85, minAccuracy: 93, wordCount: 50, duration: 120,
    unlock: null
  },
  {
    id: 13, name: 'Уровень 13', title: 'Слова — длинные',
    description: 'Слова 6+ символов',
    wordMode: true, useCommon: true, wordLength: [6, 20],
    minSpeed: 90, minAccuracy: 92, wordCount: 50, duration: 120,
    unlock: null
  },
  // Tier 5: Numbers and symbols
  {
    id: 14, name: 'Уровень 14', title: 'Цифры',
    description: 'Числовой ряд 0-9',
    chars: { ru: '1234567890', en: '1234567890' },
    wordMode: true,
    minSpeed: 80, minAccuracy: 92, wordCount: 40, duration: 120,
    unlock: null
  },
  {
    id: 15, name: 'Уровень 15', title: 'Знаки препинания',
    description: 'Пунктуация: . , ! ? ; :',
    chars: { ru: '.,!?;:', en: '.,!?;:' },
    wordMode: true, useCommon: true,
    minSpeed: 80, minAccuracy: 92, wordCount: 40, duration: 120,
    unlock: null
  },
  // Tier 6: Full text
  {
    id: 16, name: 'Уровень 16', title: 'Текст',
    description: 'Полные предложения с пунктуацией',
    wordMode: true, useCommon: true, fullText: true,
    minSpeed: 90, minAccuracy: 92, wordCount: 60, duration: 120,
    unlock: null
  },
  {
    id: 17, name: 'Уровень 17', title: 'Скоростной рывок',
    description: 'Максимальная скорость!',
    wordMode: true, useCommon: true,
    minSpeed: 120, minAccuracy: 95, wordCount: 80, duration: 120,
    unlock: 'speed'
  },
  // Tier 7: Code
  {
    id: 18, name: 'Уровень 18', title: 'Код',
    description: 'Программный код и символы',
    wordMode: true, useCode: true,
    minSpeed: 80, minAccuracy: 92, wordCount: 40, duration: 120,
    unlock: 'code'
  }
];

export function getLevelById(id) {
  return LEVELS.find(l => l.id === id) || LEVELS[0];
}

export function getMaxLevel() {
  return LEVELS.length;
}
