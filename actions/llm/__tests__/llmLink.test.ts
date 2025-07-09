import { llmExtractLinks, llmRestoreLinks } from '../utils/llmLink';

describe('llmLink', () => {
  describe('DNS проверка', () => {
    it('проверка ложных ссылок', async () => {
      const testCases = [
        {
          input: 'exam.Rouming. Привиет.Здравствуйте. Hello.hi',
          expected: [],
          description: 'Ложные домены без DNS записей',
        },
        {
          input:
            'test.local/path. this-domain-definitely-not-exists-12345.test/files. random.string/docs',
          expected: [],
          description: 'Локальные и несуществующие домены',
        },
        {
          input: 'file.txt document.pdf image.jpg script.js style.css',
          expected: [],
          description: 'Расширения файлов',
        },
        {
          input: 'user.name@email.com admin.user@server.net',
          expected: [],
          description: 'Email адреса',
        },
        {
          input: 'version.1.2.3 build.123.456.789',
          expected: [],
          description: 'Версии и номера сборок',
        },
        {
          input: 'Это notadomain.cominsideword будет игнорировано',
          expected: [],
          description: 'Не захватывать точки внутри слов без пробелов',
        },
        {
          input: 'Зайдите на HTTP://EXAMPLE.COM/PATH',
          expected: ['http://example.com/PATH'],
          description: 'Схема и домен в любом регистре',
        },
        {
          input: 'Зайдите на HTTPS://EXAMPLE.COM/PATH',
          expected: ['https://example.com/PATH'],
          description: 'Схема и домен в любом регистре',
        },
        {
          input: 'example.com/ example.com',
          expected: ['example.com/', 'example.com'],
          description: 'Домены с завершающим /',
        },
      ];

      for (const testCase of testCases) {
        const result = await llmExtractLinks(testCase.input);
        const foundUrls = Array.from(result.links.values());

        expect(foundUrls).toEqual(testCase.expected);
      }
    });

    it('проверка корректных ссылок', async () => {
      const testCases = [
        {
          input: 'http://aisender.ru',
          expected: ['http://aisender.ru'],
          description: 'URL с http://',
        },
        {
          input: 'https://aisender.ru',
          expected: ['https://aisender.ru'],
          description: 'URL с https://',
        },
        {
          input: 'Вы знаете сайт example.com?',
          expected: ['example.com'],
          description: 'Простой URL с вопросительным знаком',
        },
        {
          input: 'Посетите example.com.',
          expected: ['example.com'],
          description: 'Простой URL с точкой',
        },
        {
          input: 'Смотрите на example.com!',
          expected: ['example.com'],
          description: 'Простой URL с восклицательным знаком',
        },
        {
          input: 'Сайт example.com/path.html?',
          expected: ['example.com/path.html'],
          description: 'URL с путем и HTML расширением',
        },
        {
          input: 'Файл example.com/doc.pdf...',
          expected: ['example.com/doc.pdf'],
          description: 'URL с путем и PDF расширением',
        },
        {
          input: 'Ссылка (example.com/path.to/file)',
          expected: ['example.com/path.to/file'],
          description: 'URL в скобках',
        },
        {
          input: 'Документ example.com/file.doc, а тут example.com/test.txt...',
          expected: ['example.com/file.doc', 'example.com/test.txt'],
          description: 'Несколько URL в тексте',
        },
      ];

      for (const testCase of testCases) {
        const result = await llmExtractLinks(testCase.input);
        const foundUrls = Array.from(result.links.values());
        testCase.expected.forEach((url) => {
          expect(foundUrls).toContain(url);
        });
      }
    });

    it('проверка сложных URL', async () => {
      const testCases = [
        {
          input:
            'Посмотрите example.com/сложный/путь/каталог.html?param=тест&другой=значение...',
          expected: [
            'example.com/сложный/путь/каталог.html?param=тест&другой=значение',
          ],
          description: 'URL с кириллицей и параметрами',
        },
        {
          input:
            'Check example.com/path/to/file.php?name=John%20Doe&возраст=25&город=Москва%20Сити&action=search%20items%20here...',
          expected: [
            'example.com/path/to/file.php?name=John%20Doe&возраст=25&город=Москва%20Сити&action=search%20items%20here',
          ],
          description: 'URL с URL-encoded параметрами',
        },
        {
          input:
            'Документ (example.com/api/v2/docs.html?complex=%7B%22key%22%3A%22value%22%2C%22вложенный%22%3A%7B%22параметр%22%3A%22значение%22%7D%7D&format=json&pretty=true)...',
          expected: [
            'example.com/api/v2/docs.html?complex=%7B%22key%22%3A%22value%22%2C%22вложенный%22%3A%7B%22параметр%22%3A%22значение%22%7D%7D&format=json&pretty=true',
          ],
          description: 'URL с JSON в параметрах',
        },
        {
          input:
            'Найдите example.com/поиск/категории/подкатегории/товары.html?filter%5Bкатегория%5D=Электроника&filter%5Bподкатегория%5D=Телефоны&sort=price:desc&page=1&limit=50#результаты!',
          expected: [
            'example.com/поиск/категории/подкатегории/товары.html?filter%5Bкатегория%5D=Электроника&filter%5Bподкатегория%5D=Телефоны&sort=price:desc&page=1&limit=50#результаты',
          ],
          description: 'URL с двоеточием в параметрах сортировки',
        },
        {
          input:
            'Multi-domain text: example.com/path?param=test, another.com/путь?тест=значение, third.com/mixed/путь/path?param=value&тест=test...',
          expected: [
            'example.com/path?param=test',
            'another.com/путь?тест=значение',
            'third.com/mixed/путь/path?param=value&тест=test',
          ],
          description: 'Несколько разных доменов в одном тексте',
        },
      ];

      for (const testCase of testCases) {
        const result = await llmExtractLinks(testCase.input);
        const foundUrls = Array.from(result.links.values());
        testCase.expected.forEach((url) => {
          expect(foundUrls).toContain(url);
        });
      }
    });

    it('проверка llmRestoreLinks', async () => {
      const testCases = [
        {
          input: 'Привет example.com, как дела?',
          description: 'Простой текст с одной ссылкой',
        },
        {
          input: 'Проверьте example.com/api и example.com/docs',
          description: 'Текст с несколькими ссылками',
        },
        {
          input: 'Сложный URL: example.com/path?param=value&test=123#fragment',
          description: 'Текст со сложным URL',
        },
        {
          input:
            'Вложенные ссылки в тексте: текст (example.com) и [another.com]',
          description: 'Текст с URL в скобках',
        },
      ];

      for (const testCase of testCases) {
        const extracted = await llmExtractLinks(testCase.input);
        const restored = llmRestoreLinks(extracted);
        expect(restored).toBe(testCase.input);
      }
    });
  });

  it('проверка обработки пунктуации', async () => {
    const testCases = [
      {
        input: 't.me/VIPmalvinamira_bot?start=promo',
        expected: ['t.me/VIPmalvinamira_bot?start=promo'],
      },

      {
        input: 'http://t.me/VIPmalvinamira_bot?start=promo',
        expected: ['http://t.me/VIPmalvinamira_bot?start=promo'],
      },

      {
        input:
          'ссылка на бота https://t.me/VIPmalvinamira_bot?start=promo лови',
        expected: ['https://t.me/VIPmalvinamira_bot?start=promo'],
      },

      {
        input: 'Вы знаете сайт http://example.com',
        expected: ['http://example.com'],
        description: 'URL с http://',
      },
      {
        input: 'Вы знаете сайт https://example.com',
        expected: ['https://example.com'],
        description: 'URL с https://',
      },
      {
        input: 'Вы знаете сайт HTTP://en.wikipedia.org?',
        expected: ['http://en.wikipedia.org'],
        description: 'URL с en.wikipedia.org',
      },
      {
        input: 'Вы знаете сайт HTTPS://en.wikipedia.org?',
        expected: ['https://en.wikipedia.org'],
        description: 'URL с en.wikipedia.org',
      },
      {
        input: 'Вы знаете сайт en.wikipedia.org?',
        expected: ['en.wikipedia.org'],
        description: 'URL с en.wikipedia.org',
      },
      {
        input: 'Вы знаете сайт en.wikipedia.org.',
        expected: ['en.wikipedia.org'],
      },
      {
        input: 'Вы знаете сайт en.wikipedia.org!',
        expected: ['en.wikipedia.org'],
      },

      {
        input: 'Вы знаете сайт http://en.wikipedia.org?',
        expected: ['http://en.wikipedia.org'],
        description: 'URL с http:// en.wikipedia.org',
      },
      {
        input: 'Вы знаете сайт http://en.wikipedia.org.',
        expected: ['http://en.wikipedia.org'],
      },
      {
        input: 'Вы знаете сайт http://en.wikipedia.org!',
        expected: ['http://en.wikipedia.org'],
      },

      {
        input: 'Вы знаете сайт https://en.wikipedia.org?',
        expected: ['https://en.wikipedia.org'],
        description: 'URL с https:// en.wikipedia.org',
      },
      {
        input: 'Вы знаете сайт https://en.wikipedia.org.',
        expected: ['https://en.wikipedia.org'],
      },
      {
        input: 'Вы знаете сайт https://en.wikipedia.org!',
        expected: ['https://en.wikipedia.org'],
      },

      {
        input: 'Вы знаете сайт example.com?',
        expected: ['example.com'],
        description: 'URL с вопросительным знаком',
      },
      {
        input: 'Посетите example.com.',
        expected: ['example.com'],
        description: 'URL с точкой',
      },
      {
        input: 'Смотрите на example.com!',
        expected: ['example.com'],
        description: 'URL с восклицательным знаком',
      },
      {
        input: 'Сайт example.com/path.html?',
        expected: ['example.com/path.html'],
        description: 'URL с путем и вопросительным знаком',
      },
      {
        input: 'Файл example.com/doc.pdf...',
        expected: ['example.com/doc.pdf'],
        description: 'URL с многоточием в конце',
      },
      {
        input: 'Ссылка (example.com/path.to/file)',
        expected: ['example.com/path.to/file'],
        description: 'URL в скобках',
      },
      {
        input: 'Документ example.com/file.doc, а тут example.com/test.txt...',
        expected: ['example.com/file.doc', 'example.com/test.txt'],
        description: 'Множественные URL с точками',
      },
      {
        input: 'Страница example.com/page.html?param=test!',
        expected: ['example.com/page.html?param=test'],
        description: 'URL с параметром и восклицательным знаком',
      },
      {
        input: 'URL example.com/path?param=value.here',
        expected: ['example.com/path?param=value.here'],
        description: 'URL с точкой в значении параметра',
      },
      {
        input: 'Адрес example.com/path.to.file',
        expected: ['example.com/path.to.file'],
        description: 'URL с множественными точками в пути',
      },
    ];

    for (const testCase of testCases) {
      const result = await llmExtractLinks(testCase.input);
      const foundUrls = Array.from(result.links.values());

      expect(foundUrls).toHaveLength(testCase.expected.length);
      testCase.expected.forEach((url) => {
        expect(foundUrls).toContain(url);
      });
    }
  });

  it('проверка сложных URL', async () => {
    const testCases = [
      {
        input:
          'Посмотрите example.com/сложный/путь/каталог.html?param=тест&другой=значение...',
        expected: [
          'example.com/сложный/путь/каталог.html?param=тест&другой=значение',
        ],
        description:
          'URL с кириллицей и параметрами, заканчивающийся многоточием',
      },
      {
        input:
          'Check example.com/path/to/file.php?name=John%20Doe&возраст=25&город=Москва%20Сити&action=search%20items%20here...',
        expected: [
          'example.com/path/to/file.php?name=John%20Doe&возраст=25&город=Москва%20Сити&action=search%20items%20here',
        ],
        description: 'URL с encoded пробелами и кириллицей',
      },
      {
        input:
          'Вот example.com/%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/путь?тест=раз&test=two&параметр=значение%20с%20пробелами!',
        expected: [
          'example.com/%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/путь?тест=раз&test=two&параметр=значение%20с%20пробелами',
        ],
        description: 'URL с URL-encoded кириллицей',
      },
      {
        input:
          'Документ (example.com/api/v2/docs.html?complex=%7B%22key%22%3A%22value%22%2C%22вложенный%22%3A%7B%22параметр%22%3A%22значение%22%7D%7D&format=json&pretty=true)...',
        expected: [
          'example.com/api/v2/docs.html?complex=%7B%22key%22%3A%22value%22%2C%22вложенный%22%3A%7B%22параметр%22%3A%22значение%22%7D%7D&format=json&pretty=true',
        ],
        description: 'URL с JSON в параметрах',
      },
      {
        input:
          'Link example.com/path?q=SELECT%20*%20FROM%20table%20WHERE%20column%20%3D%20%27value%27&lang=sql&мета=данные...',
        expected: [
          'example.com/path?q=SELECT%20*%20FROM%20table%20WHERE%20column%20%3D%20%27value%27&lang=sql&мета=данные',
        ],
        description: 'URL с SQL запросом в параметрах',
      },
      {
        input:
          'Проверьте example.com/path.to.file/index.html?param1=value1&param2=value2&param3=value3&param4=value4&param5=value5&param6=value6&param7=value7&param8=value8&param9=value9&param10=value10#section-1?',
        expected: [
          'example.com/path.to.file/index.html?param1=value1&param2=value2&param3=value3&param4=value4&param5=value5&param6=value6&param7=value7&param8=value8&param9=value9&param10=value10#section-1',
        ],
        description: 'URL с множеством параметров и якорем',
      },
      {
        input:
          'Найдите example.com/поиск/категории/подкатегории/товары.html?filter%5Bкатегория%5D=Электроника&filter%5Bподкатегория%5D=Телефоны&sort=price:desc&page=1&limit=50#результаты!',
        expected: [
          'example.com/поиск/категории/подкатегории/товары.html?filter%5Bкатегория%5D=Электроника&filter%5Bподкатегория%5D=Телефоны&sort=price:desc&page=1&limit=50#результаты',
        ],
        description: 'URL с вложенными параметрами фильтрации',
      },
      {
        input:
          'Check this: example.com/path?data=%5B%7B%22id%22%3A1%2C%22name%22%3A%22Test%22%2C%22values%22%3A%5B%22один%22%2C%22два%22%2C%22три%22%5D%7D%2C%7B%22id%22%3A2%2C%22name%22%3A%22Another%22%2C%22values%22%3A%5B%22four%22%2C%22five%22%2C%22six%22%5D%7D%5D&encoding=utf-8...',
        expected: [
          'example.com/path?data=%5B%7B%22id%22%3A1%2C%22name%22%3A%22Test%22%2C%22values%22%3A%5B%22один%22%2C%22два%22%2C%22три%22%5D%7D%2C%7B%22id%22%3A2%2C%22name%22%3A%22Another%22%2C%22values%22%3A%5B%22four%22%2C%22five%22%2C%22six%22%5D%7D%5D&encoding=utf-8',
        ],
        description: 'URL с массивом объектов в параметрах',
      },
      {
        input:
          'Вот ссылка example.com/путь/страница.html?param=значение&array%5B%5D=value1&array%5B%5D=value2&array%5B%5D=value3&nested%5Bkey1%5D%5Bkey2%5D%5Bkey3%5D=value&timestamp=2024-03-14T12%3A30%3A45.000Z...',
        expected: [
          'example.com/путь/страница.html?param=значение&array%5B%5D=value1&array%5B%5D=value2&array%5B%5D=value3&nested%5Bkey1%5D%5Bkey2%5D%5Bkey3%5D=value&timestamp=2024-03-14T12%3A30%3A45.000Z',
        ],
        description: 'URL с массивами и вложенными объектами в параметрах',
      },
      {
        input:
          'Multi-domain text: example.com/path?param=test, another.com/путь?тест=значение, third.com/mixed/путь/path?param=value&тест=test...',
        expected: [
          'example.com/path?param=test',
          'another.com/путь?тест=значение',
          'third.com/mixed/путь/path?param=value&тест=test',
        ],
        description: 'Множественные домены с разными параметрами',
      },
    ];

    for (const testCase of testCases) {
      const result = await llmExtractLinks(testCase.input);
      const foundUrls = Array.from(result.links.values());

      expect(foundUrls).toHaveLength(testCase.expected.length);
      testCase.expected.forEach((url) => {
        expect(foundUrls).toContain(url);
      });
    }
  });

  it('проверка специальных случаев', async () => {
    const testCases = [
      {
        input: 'example.com/path?param={key:"value",nested:{deep:"object"}}',
        expected: [
          'example.com/path?param={key:"value",nested:{deep:"object"}}',
        ],
        description: 'URL с нестандартным JSON в параметрах',
      },
      {
        input:
          'example.com/api?filter=[1,2,3]&complex={"a":1,"b":[true,null,{"x":99}]}',
        expected: [
          'example.com/api?filter=[1,2,3]&complex={"a":1,"b":[true,null,{"x":99}]}',
        ],
        description: 'URL с вложенными структурами данных',
      },
      {
        input: 'example.com/test?param=(1+2)*3&formula=a/(b+c)',
        expected: ['example.com/test?param=(1+2)*3&formula=a/(b+c)'],
        description: 'URL с математическими выражениями',
      },
      {
        input: 'example.com/api?time=12:30:45&range=1:100&interval=00:15',
        expected: ['example.com/api?time=12:30:45&range=1:100&interval=00:15'],
        description: 'URL с двоеточиями в значениях',
      },
      {
        input: 'example.com/path?regex=[a-zA-Z0-9]+&pattern=\\d{2,4}',
        expected: ['example.com/path?regex=[a-zA-Z0-9]+&pattern=\\d{2,4}'],
        description: 'URL с регулярными выражениями',
      },
      {
        input:
          'example.com/test?html=%3Cdiv%20class%3D%22test%22%3Econtent%3C%2Fdiv%3E&xml=%3Croot%3E%3Cchild%3Edata%3C%2Fchild%3E%3C%2Froot%3E',
        expected: [
          'example.com/test?html=%3Cdiv%20class%3D%22test%22%3Econtent%3C%2Fdiv%3E&xml=%3Croot%3E%3Cchild%3Edata%3C%2Fchild%3E%3C%2Froot%3E',
        ],
        description: 'URL с закодированными HTML и XML в параметрах',
      },
      {
        input: 'example.com/api?sql=SELECT * FROM table',
        expected: ['example.com/api?sql=SELECT'],
        description: 'URL обрезается на пробеле после SELECT',
      },
      {
        input: 'example.com/path?query=Hello World',
        expected: ['example.com/path?query=Hello'],
        description: 'URL обрезается на первом пробеле',
      },
      {
        input: 'example.com/api?cmd=git push origin',
        expected: ['example.com/api?cmd=git'],
        description: 'URL обрезается на пробеле, даже если дальше есть команда',
      },
      {
        input:
          'example.com/path?markdown=%23%20Заголовок%0A%23%23%20Подзаголовок%0A*%20Список%0A*%20Элементы',
        expected: [
          'example.com/path?markdown=%23%20Заголовок%0A%23%23%20Подзаголовок%0A*%20Список%0A*%20Элементы',
        ],
        description: 'URL с markdown разметкой (URL-encoded)',
      },
      {
        input:
          'example.com/test?csv=id%2Cname%2Cvalue%0A1%2Ctest%2C100%0A2%2Cexample%2C200',
        expected: [
          'example.com/test?csv=id%2Cname%2Cvalue%0A1%2Ctest%2C100%0A2%2Cexample%2C200',
        ],
        description: 'URL с CSV данными (URL-encoded)',
      },
      {
        input:
          'example.com/api?base64=SGVsbG8gd29ybGQ=&jwt=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
        expected: [
          'example.com/api?base64=SGVsbG8gd29ybGQ=&jwt=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
        ],
        description: 'URL с закодированными данными',
      },
    ];

    for (const testCase of testCases) {
      const result = await llmExtractLinks(testCase.input);
      const foundUrls = Array.from(result.links.values());

      expect(foundUrls).toHaveLength(testCase.expected.length);
      testCase.expected.forEach((url) => {
        expect(foundUrls).toContain(url);
      });
    }
  });

  it('проверка восстановления ссылок', async () => {
    const testCases = [
      {
        input:
          'Текст с example.com/path?param=value и another.com/test?data=123',
        description: 'Базовое восстановление множественных ссылок',
      },
      {
        input:
          'Сложный текст с (example.com/path?json={"key":"value"}) и [another.com/api?array=[1,2,3]]',
        description: 'Восстановление ссылок со сложными параметрами',
      },
      {
        input:
          'Многострочный\nтекст с example.com/test\nи another.com/path в разных строках',
        description: 'Восстановление ссылок в многострочном тексте',
      },
      {
        input:
          'Текст с вложенными структурами: example.com/api?data={"users":[{"id":1,"name":"Test"}]}',
        description: 'Восстановление ссылок с вложенными JSON структурами',
      },
    ];

    for (const testCase of testCases) {
      const extracted = await llmExtractLinks(testCase.input);
      const restored = llmRestoreLinks(extracted);
      expect(restored).toBe(testCase.input);
    }
  });

  it('проверка граничных случаев', async () => {
    const testCases = [
      {
        input: 'Посетите http://example.com:8080/path и https://sub.domain.org',
        expected: ['https://sub.domain.org'],
        description: 'URL со схемой и портом',
      },
      {
        input: 'Сервер на 192.168.0.1/status и ещё 255.255.255.255/test',
        expected: [],
        description: 'URL на IP-адресах',
      },
      {
        input: 'Visit EXAMPLE.COM/About or ExAmPlE.Org/Info/',
        expected: ['example.com/About', 'example.org/Info/'],
        description: 'Домен в разном регистре и с завершающим слэшем',
      },
      {
        input: 'example.com/ and example.com.',
        expected: ['example.com/', 'example.com'],
        description: 'Завершающий слэш vs точка',
      },
      {
        input: 'example.com/page#section example.com/page#other?',
        expected: ['example.com/page#section', 'example.com/page#other'],
        description: 'URL с фрагментами (hash)',
      },
      {
        input: '[example.com/path] <another.org>',
        expected: ['example.com/path', 'another.org'],
        description: 'URL в разных типах скобок',
      },
      {
        input: 'Проверьте сайт пример.рф и xn--e1afmkfd.xn--p1ai/path',
        expected: [],
        description: 'IDN и punycode домены',
      },
      {
        input: 'example.com/path?param="value"&other=\'test\'',
        expected: ['example.com/path?param="value"&other=\'test\''],
        description: 'URL с кавычками в параметрах',
      },
      {
        input: 'example.com/path?param=test.dot&other=value,comma',
        expected: ['example.com/path?param=test.dot&other=value,comma'],
        description: 'URL с точками и запятыми в значениях',
      },
      {
        input: 'example.com/path?param=(test)&other=[value]',
        expected: ['example.com/path?param=(test)&other=[value]'],
        description: 'URL со скобками в значениях',
      },
      {
        input: 'example.com/path?email=test@example.com&domain=sub.domain.com',
        expected: [
          'example.com/path?email=test@example.com&domain=sub.domain.com',
        ],
        description: 'URL с email и поддоменами в параметрах',
      },
      {
        input: 'example.com/path?version=1.2.3&range=1...10',
        expected: ['example.com/path?version=1.2.3&range=1...10'],
        description: 'URL с версией и диапазоном',
      },
      {
        input:
          'example.com/путь/カテゴリー/类别?параметр=значение&パラメータ=値&参数=值',
        expected: [
          'example.com/путь/カテゴリー/类别?параметр=значение&パラメータ=値&参数=值',
        ],
        description: 'URL с многоязычными параметрами',
      },
      {
        input: 'example.com/path?unicode=\u0041\u0042\u0043&emoji=🌍🌎🌏',
        expected: ['example.com/path?unicode=\u0041\u0042\u0043&emoji=🌍🌎🌏'],
        description: 'URL с Unicode и эмодзи',
      },
      {
        input: 'example.com/path?param=value&param=other&param=third',
        expected: ['example.com/path?param=value&param=other&param=third'],
        description: 'URL с повторяющимися параметрами',
      },
      {
        input: 'example.com/path?param=&empty=&blank',
        expected: ['example.com/path?param=&empty=&blank'],
        description: 'URL с пустыми параметрами',
      },
      {
        input:
          'example.com/path?has%20space=value%20with%20space&tab=value%20with%20tab',
        expected: [
          'example.com/path?has%20space=value%20with%20space&tab=value%20with%20tab',
        ],
        description: 'URL с закодированными пробелами',
      },
    ];

    for (const testCase of testCases) {
      const { input, expected, description } = testCase;
      const result = await llmExtractLinks(input);
      const foundUrls = Array.from(result.links.values());

      expect(foundUrls).toHaveLength(expected.length);
      expected.forEach((url) => {
        expect(foundUrls).toContain(url);
      });
    }
  });
});
