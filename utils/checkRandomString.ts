export const checkRandomString = (template: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!template) return resolve();

    let lastIndex = 0;
    const regex = /{([^{}]*)}/g;
    let match;
    let openBraces = 0;
    let totalCombinations = 1;

    for (let i = 0; i < template.length; i++) {
      if (template[i] === '{') {
        openBraces++;
      } else if (template[i] === '}') {
        openBraces--;
      }
      if (openBraces < 0) {
        return reject(
          "Некорректная часть строки: отсутствуют открывающие '{' или закрывающие '}' скобки."
        );
      }
    }

    if (openBraces !== 0) {
      return reject(
        "Некорректная часть строки: отсутствуют открывающие '{' или закрывающие '}' скобки."
      );
    }

    const regexBetweenBraces = /}(.*?)\{/g;
    let matchBetweenBraces;

    while ((matchBetweenBraces = regexBetweenBraces.exec(template)) !== null) {
      const braces = matchBetweenBraces[1].replace(/[.,?!;()]/g, ' ').trim();
      const wBraces = braces.replace(/ /g, '');

      if (wBraces.length > 10) {
        return reject(
          `Часть строки "${braces}" длиной ${wBraces.length}, хотя максимальная свободная длина - 10.`
        );
      }
    }

    const optionsLengthArray: any = [];

    while ((match = regex.exec(template)) !== null) {
      const braces = template
        .substring(lastIndex, match.index)
        .replace(/[.,?!;()]/g, ' ')
        .trim();
      const wBraces = braces.replace(/ /g, '');

      if (wBraces.length > 10) {
        return reject(
          `Часть строки "${braces}" длиной ${wBraces.length}, хотя максимальная свободная длина - 10.`
        );
      }

      lastIndex = regex.lastIndex;

      const content = match[1].trim();
      const options = content
        .split('|')
        .map((option) =>
          option
            .trim()
            .toLowerCase()
            .replace(/[-—]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        );

      const emptyOptions = options.filter((option) => option === '');
      if (emptyOptions.length > 0) {
        return reject(
          `Часть строки {${content}} содержит пустые значения между |, что недопустимо.`
        );
      }

      if (!/^[a-zA-Zа-яА-ЯёЁґҐєЄіІїЇ0-9(),|'"\-\s%]+$/.test(content)) {
        return reject(
          `Часть строки {${content}} содержит некорректные спец-символы. Разрешенные: (),'-"%`
        );
      }

      const optionCount: Record<string, number> = {};
      const tooLongOptions: string[] = [];
      options.forEach((option) => {
        optionCount[option] = (optionCount[option] || 0) + 1;
        if (option.length > 22) {
          tooLongOptions.push(option);
        }
      });

      if (tooLongOptions.length > 0) {
        return reject(
          `Часть строки {${content}} содержит варианты, превышающие максимальную длину в 22 символа: ${tooLongOptions.join(
            ', '
          )}.`
        );
      }

      const duplicates = Object.keys(optionCount).filter(
        (option) => optionCount[option] > 1
      );
      if (duplicates.length > 0) {
        return reject(
          `Часть строки {${content}} содержит повторяющиеся элементы: ${duplicates.join(
            ', '
          )}.`
        );
      }

      const firstWords: Record<string, string[]> = {};
      const lastWords: Record<string, string[]> = {};

      options.forEach((option) => {
        const words = option.split(/\s+/);
        const firstWord = words[0];
        const secondWord = words[1] || '';
        const lastWord = words[words.length - 1];

        const combinedFirstWord =
          firstWord.length < 5 && secondWord
            ? `${firstWord} ${secondWord}`
            : firstWord;

        firstWords[combinedFirstWord] = firstWords[combinedFirstWord] || [];
        firstWords[combinedFirstWord].push(option);

        lastWords[lastWord] = lastWords[lastWord] || [];
        lastWords[lastWord].push(option);
      });

      const checkDuplicates = (
        wordsMap: Record<string, string[]>,
        label: string
      ) => {
        const duplicates = Object.keys(wordsMap).filter(
          (word) => wordsMap[word].length > 1
        );
        return duplicates.length > 0
          ? `${label}:\n${duplicates
              .map((word) => `${word} (${wordsMap[word].join(', ')})`)
              .join('\n')}`
          : null;
      };

      const firstWordsDupes = checkDuplicates(
        firstWords,
        '\nДУБЛИ ПО ПЕРВОМУ ВХОЖДЕНИЮ'
      );
      const lastWordsDupes = checkDuplicates(
        lastWords,
        '\nДУБЛИ ПО ПОСЛЕДНЕМУ ВХОЖДЕНИЮ'
      );

      if (firstWordsDupes || lastWordsDupes) {
        return reject(
          `Часть строки {${content}} содержит дублирующие элементы.\n${[
            firstWordsDupes,
            lastWordsDupes,
          ]
            .filter(Boolean)
            .join('\n')}`
        );
      }

      if (options.length < 3) {
        return reject(
          `Часть строки {${content}} содержит недостаточное количество уникальных вариантов. Минимальное требование - 3.`
        );
      }

      totalCombinations *= options.length;
      optionsLengthArray.push([options]);
    }

    const remainingText = template.substring(lastIndex).trim();
    const braces = remainingText.replace(/[.,?!;()]/g, ' ').trim();
    const wBraces = braces.replace(/ /g, '');

    if (wBraces.length > 10) {
      return reject(
        `Часть строки "${braces}" длиной ${wBraces.length}, хотя максимальная свободная длина - 10.`
      );
    }

    for (let i = 0; i < optionsLengthArray.length - 1; i++) {
      const currentCount = optionsLengthArray[i][0].length;
      const nextCount = optionsLengthArray[i + 1][0].length;

      if (currentCount * nextCount < 18) {
        return reject(
          `Коэффициенты для элементов в скобках не соответствуют требованиям: {${optionsLengthArray[
            i
          ][0].join('|')}}  * {${optionsLengthArray[i + 1][0].join(
            '|'
          )}} = ${currentCount} * ${nextCount} = ${
            currentCount * nextCount
          }. Минимальное количество - 18.`
        );
      }
    }

    if (totalCombinations < 1000) {
      return reject(
        `Количество уникальных генераций - ${totalCombinations}, минимальный порог - 1000.`
      );
    }

    resolve();
  });
};
