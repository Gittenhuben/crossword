import { readFileSync } from 'fs';

const MAX_WORDS = 23;
const FIELD_FILENAME = 'field.txt';
const DICTIONARY_FILENAME = 'words.txt';
const EMPTY_CHAR = '_';
const LOG_TIME = false;


function readLinesFromFile(fileName, encoding) {
  const data = readFileSync(fileName, encoding);
  const lines = data.split(/\r?\n/).filter(line => line.length > 0);
  return lines;
}

function generateZeroArray(n) {
  const array = [];
  for (let i = 0; i < n; i++) {
    array.push(0);
  }
  return array;
}

function getFieldWidth(field) {
  let width = 0;
  for (let i = 0; i < field.length; i++) {
    if (field[i].length > width) width = field[i].length;
  }
  return width;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomWord(dictionaryMemo, firstWordsCount) {
  const maxIndex = (firstWordsCount != 0 && firstWordsCount < dictionaryMemo.length) ? firstWordsCount : dictionaryMemo.length;
  const index = getRandomInt(0, maxIndex);
  return dictionaryMemo[index].word;
}

function generateDictionaryMemo(dictionaries, frequencyTables, positions) {
  const dictionary = dictionaries[positions.length - 1];
  const currentDictionaryFrequency = [];

  for (let j = 0; j < dictionary.length; j++) {
    let currentWordFrequency = 1;
    for (let i = 0; i < dictionary[j].length; i++) {
      const currentLetter = dictionary[j][i];
      const currentTargetWordLength = positions[i][1];
      const currentTargetLetterPosition = positions[i][0];
      const currentFrequencyTable = frequencyTables[currentTargetWordLength - 1];
      const currentFrequencyTableSymbols = currentFrequencyTable[0];
      const letterIndexInFrequencyTable = currentFrequencyTableSymbols.findIndex(symbol => symbol === currentLetter);
      const letterFrequency = currentFrequencyTable[currentTargetLetterPosition + 1][letterIndexInFrequencyTable];
      currentWordFrequency *= letterFrequency;
    }
    currentDictionaryFrequency.push(currentWordFrequency);
  }

  const dictionaryWithFrequency = dictionary.map((word, index) => ({
    word,
    frequency: currentDictionaryFrequency[index]
  }));

  return dictionaryWithFrequency.sort((a, b) => b.frequency - a.frequency);
}

function generateDictionariesMemo(dictionaries, frequencyTables, positionsMemo) {
  const dictionariesMemo = [];
  for (let t = 0; t < positionsMemo.length; t++) {
    dictionariesMemo.push(generateDictionaryMemo(dictionaries, frequencyTables, positionsMemo[t]));
  }
  return dictionariesMemo;
}

function printField(field) {
  for (let j = 0; j < field.length; j++) {
    console.log(field[j]);
  }
}

function setLetter(field, i, j, char) {
  if (j < field.length && i < field[j].length) {
    field[j] = field[j].substring(0, i) + char + field[j].substring(i + 1);
  }
}

function generateField(template, dictionariesMemo, firstWordsCount) {
  const fieldTemp = template.slice();

  const fieldWidth = getFieldWidth(template);
  const fieldHeight = template.length;

  let currentWord = 0;

  for (let i = 0; i < fieldWidth; i++) {
    let j=0;

    while (j < fieldHeight) {
      while (j < fieldHeight && template[j][i] !== EMPTY_CHAR) {
        j++;
      }
      if (j >= fieldHeight) {
        continue;
      }
      const jStart = j;
      while (j < fieldHeight && template[j][i] === EMPTY_CHAR) {
        j++;
      }
      const jEnd = j - 1;
      const wordLength = jEnd - jStart + 1;

      const word = getRandomWord(dictionariesMemo[currentWord], firstWordsCount);
      
      for (let jj = jStart; jj <= jEnd; jj++) {
        setLetter(fieldTemp, i, jj, word[jj - jStart]);
      }
      
      currentWord++;
    }
  }

  return fieldTemp;
}

function generatePositionsMemo(template) {
  const fieldWidth = getFieldWidth(template);
  const fieldHeight = template.length;

  const positionsMemo = [];

  for (let i = 0; i < fieldWidth; i++) {
    let j=0;

    while (j < fieldHeight) {
      while (j < fieldHeight && template[j][i] !== EMPTY_CHAR) {
        j++;
      }
      if (j >= fieldHeight) {
        continue;
      }
      const jStart = j;
      while (j < fieldHeight && template[j][i] === EMPTY_CHAR) {
        j++;
      }
      const jEnd = j - 1;

      const positions = [];
      for (let jj = jStart; jj <= jEnd; jj++) {
        let ii = i;
        while (ii >= 0 && template[jj][ii] === EMPTY_CHAR) {
          ii--;
        }
        const iiStart = ii + 1;
        ii = i;
        while (ii < fieldWidth && template[jj][ii] === EMPTY_CHAR) {
          ii++;
        }
        const iiEnd = ii - 1;
        positions.push([i - iiStart, iiEnd - iiStart + 1]);
      }

      positionsMemo.push(positions)
    }
  }

  return positionsMemo;
}

function getVerticalWordsCount(template) {
  const fieldWidth = getFieldWidth(template);
  const fieldHeight = template.length;

  const array = generateZeroArray(fieldHeight);

  for (let i = 0; i < fieldWidth; i++) {
    let j=0;

    while (j < fieldHeight) {
      while (j < fieldHeight && template[j][i] !== EMPTY_CHAR) {
        j++;
      }
      if (j >= fieldHeight) {
        continue;
      }
      const jStart = j;
      while (j < fieldHeight && template[j][i] === EMPTY_CHAR) {
        j++;
      }
      const jEnd = j - 1;
      const wordLength = jEnd - jStart + 1;
      array[wordLength - 1]++;
    }
  }
  return array;
}

function getHorizontalWordsCount(template) {
  const fieldWidth = getFieldWidth(template);
  const fieldHeight = template.length;

  const array = generateZeroArray(fieldWidth);

  for (let j = 0; j < fieldHeight; j++) {
    let i=0;

    while (i < fieldWidth) {
      while (i < fieldWidth && template[j][i] !== EMPTY_CHAR) {
        i++;
      }
      if (i >= fieldWidth) {
        continue;
      }
      const iStart = i;
      while (i < fieldWidth && template[j][i] === EMPTY_CHAR) {
        i++;
      }
      const iEnd = i - 1;
      const wordLength = iEnd - iStart + 1;
      array[wordLength - 1]++;
    }
  }
  return array;
}

function checkField(template, fieldTemp, sets) {
  const fieldWidth = getFieldWidth(template);
  const fieldHeight = template.length;

  for (let j = 0; j < fieldHeight; j++) {
    let i=0;

    while (i < fieldWidth) {
      while (i < fieldWidth && template[j][i] !== EMPTY_CHAR) {
        i++;
      }
      if (i >= fieldWidth) {
        continue;
      }
      const iStart = i;
      let word = '';
      while (i < fieldWidth && template[j][i] === EMPTY_CHAR) {
        word += fieldTemp[j][i];
        i++;
      }
      const iEnd = i - 1;
      const wordLength = iEnd - iStart + 1;

      if (!sets[wordLength - 1].has(word)) {
        return false;
      }
    }
  }
  return checkUniqueWords(template, fieldTemp);
}

function checkUniqueWords(template, fieldTemp) {
  const fieldWidth = getFieldWidth(template);
  const fieldHeight = template.length;

  const words = [];

  for (let j = 0; j < fieldHeight; j++) {
    let i=0;

    while (i < fieldWidth) {
      while (i < fieldWidth && template[j][i] !== EMPTY_CHAR) {
        i++;
      }
      if (i >= fieldWidth) {
        continue;
      }
      let word = '';
      while (i < fieldWidth && template[j][i] === EMPTY_CHAR) {
        word += fieldTemp[j][i];
        i++;
      }

      if (words.includes(word)) {
        return false;
      }
      words.push(word);
    }
  }

  for (let i = 0; i < fieldWidth; i++) {
    let j=0;

    while (j < fieldHeight) {
      while (j < fieldHeight && template[j][i] !== EMPTY_CHAR) {
        j++;
      }
      if (j >= fieldHeight) {
        continue;
      }
      const jStart = j;
      let word = '';
      while (j < fieldHeight && template[j][i] === EMPTY_CHAR) {
        word += fieldTemp[j][i];
        j++;
      }
      if (words.includes(word)) {
        return false;
      }
      words.push(word);
    }
  }

  return true;
}

function generateDictionary(dictionary, len) {
  return dictionary.filter(word => word.length === len)
}

function generateDictionaries(dictionary, verticalWordsCountArray, horizontalWordsCountArray) {
  const dictionaries = [];
  for (let i = 0; i < Math.max(verticalWordsCountArray.length, horizontalWordsCountArray.length); i++) {
    if (verticalWordsCountArray[i] > 0 || horizontalWordsCountArray[i] > 0) {
      dictionaries.push(generateDictionary(dictionary, i+1))
    } else {
      dictionaries.push([]);
    }
  }
  return dictionaries;
}

function getSymbols(dictionary) {
  const symbols = [];
  for (let j = 0; j < dictionary.length; j++) {
    for (let i = 0; i < dictionary[j].length; i++) {
      if (!symbols.includes(dictionary[j][i])) {
        symbols.push(dictionary[j][i]);
      }
    }
  }
  return symbols.sort();
}

function getFrequencyTable(dictionary) {
  const result = [];
  if (dictionary.length > 0 && dictionary[0].length > 0) {
    const symbols = getSymbols(dictionary);
    result.push(symbols);
    
    for (let i = 0; i < dictionary[0].length; i++) {
      const currentFrequency = generateZeroArray(symbols.length);
      let currentTotal = 0;
      for (let j = 0; j < dictionary.length; j++) {
        const index = symbols.findIndex(symbol => symbol === dictionary[j][i]);
        currentFrequency[index]++;
        currentTotal++;
      }
      if (currentTotal > 0) {
        for (let t = 0; t < currentFrequency.length; t++) {
          currentFrequency[t] = currentFrequency[t] / currentTotal;
        }
      }
      result.push(currentFrequency);
    }
  }
  return result;
}

function generateFrequencyTables(dictionaries) {
  const frequencyTables = [];
  for (let i = 0; i < dictionaries.length; i++) {
    frequencyTables.push(getFrequencyTable(dictionaries[i]));
  }
  return frequencyTables;
}

function generateSets(dictionaries) {
  const sets = [];
  for (let i = 0; i < dictionaries.length; i++) {
    sets.push(new Set(dictionaries[i]))
  }
  return sets;
}

const fieldTemplate = readLinesFromFile(FIELD_FILENAME, 'utf-8');
const dictionaryFull = readLinesFromFile(DICTIONARY_FILENAME, 'utf-8');

const verticalWordsCountArray = getVerticalWordsCount(fieldTemplate);
const horizontalWordsCountArray = getHorizontalWordsCount(fieldTemplate);
const dictionaries = generateDictionaries(dictionaryFull, verticalWordsCountArray, horizontalWordsCountArray);
const frequencyTables = generateFrequencyTables(dictionaries);
const positionsMemo = generatePositionsMemo(fieldTemplate);
const dictionariesMemo = generateDictionariesMemo(dictionaries, frequencyTables, positionsMemo);
const sets = generateSets(dictionaries);


const time1 = Date.now();

for (let i = 0; i < 10000000000; i++) {
  const fieldTemp = generateField(fieldTemplate, dictionariesMemo, MAX_WORDS);
  if (checkField(fieldTemplate, fieldTemp, sets)) {
    printField(fieldTemp);
    break;
  }
}

const time2 = Date.now();
if (LOG_TIME) {
  console.log(time2 - time1, 'ms');
}
