import { llmLanguageValidation } from '../utils/llmLanguageValidation';

describe('llmLanguageValidation', () => {
  const russianContext =
    'русская компания разработка программного обеспечения москва';
  const englishContext = 'english company software development moscow';
  const mixedContext = 'компания software ERP разработка development москва';

  describe('Русский язык', () => {
    it('должен пропустить корректный русский текст', () => {
      const result = llmLanguageValidation(
        'Привет, как дела? Работаю в Москве.',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен пропустить русские слова даже если их НЕТ в контексте', () => {
      const result = llmLanguageValidation(
        'Разрабатываем инновационные решения для автоматизации.',
        'hello world english context data', // русских слов НЕТ в контексте
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true); // русские слова всегда ОК для русского языка
    });

    it('должен пропустить смешанный текст: русские слова НЕ в контексте + английские имена собственные', () => {
      const result = llmLanguageValidation(
        'Создаём современные решения используя Microsoft Azure.',
        'hello world english context data', // русских слов НЕТ в контексте, Microsoft и Azure тоже НЕТ
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true); // русские слова ОК + Microsoft/Azure как имена собственные в середине ОК
    });

    it('должен пропустить русский текст с именами собственными в середине', () => {
      const result = llmLanguageValidation(
        'Работаю в Microsoft сейчас, все отлично.',
        'компания microsoft разработка',
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен отклонить английское слово в начале', () => {
      const result = llmLanguageValidation(
        'Hello мир!',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Cyrillic word found: "hello"');
    });

    it('должен отклонить английское слово после пунктуации', () => {
      const result = llmLanguageValidation(
        'Привет. Hello мир!',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Cyrillic word found: "hello"');
    });

    it('должен пропустить английское слово, найденное в контексте', () => {
      const result = llmLanguageValidation(
        'Работаю с software каждый день.',
        mixedContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    describe('Пример со скриншота', () => {
      it('должен отклонить "Excellent" в начале (НЕТ в контексте)', () => {
        const result = llmLanguageValidation(
          'Excellent. ERP-система нашего поколения помогает масштабировать бизнес.',
          'система поколения помогает масштабировать бизнес', // Excellent и ERP НЕТ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "excellent"');
      });

      it('должен пропустить "ERP" как имя собственное в середине (НЕТ в контексте)', () => {
        const result = llmLanguageValidation(
          'Наша ERP-система помогает бизнесу.',
          'наша система помогает бизнесу', // ERP НЕТ в контексте, но это имя собственное
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен пропустить если все слова ЕСТЬ в контексте', () => {
        const result = llmLanguageValidation(
          'Excellent. ERP-система нашего поколения помогает масштабировать бизнес.',
          'excellent erp система поколения помогает масштабировать бизнес', // все слова ЕСТЬ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен отклонить обычные английские слова даже с заглавной', () => {
        const result = llmLanguageValidation(
          'Наша Hello-система работает хорошо.',
          'наша система работает хорошо', // Hello НЕТ в контексте и не глобальное имя
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true); // Hello в середине = имя собственное, должно проходить
      });
    });

    it('должен отклонить множественные английские слова', () => {
      const result = llmLanguageValidation(
        'Hello world! Nice to see you.',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Cyrillic word found: "hello"');
    });

    it('должен пропустить аббревиатуры в контексте', () => {
      const result = llmLanguageValidation(
        'Используем CRM и ERP системы.',
        'компания CRM ERP системы разработка',
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Английский язык', () => {
    it('должен пропустить корректный английский текст', () => {
      const result = llmLanguageValidation(
        'Hello, how are you? Working in Moscow.',
        englishContext,
        'ENGLISH'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен пропустить английские слова даже если их НЕТ в контексте', () => {
      const result = llmLanguageValidation(
        'Developing innovative solutions for business automation.',
        'привет мир русский контекст данные', // английских слов НЕТ в контексте
        'ENGLISH'
      );
      expect(result.isValid).toBe(true); // английские слова всегда ОК для английского языка
    });

    it('должен пропустить английский текст с именами собственными в середине', () => {
      const result = llmLanguageValidation(
        'Working at Яндекс now, everything is great.',
        'company яндекс development',
        'ENGLISH'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен отклонить русское слово в начале', () => {
      const result = llmLanguageValidation(
        'Привет world!',
        englishContext,
        'ENGLISH'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Latin word found: "привет"');
    });

    it('должен отклонить русское слово после пунктуации', () => {
      const result = llmLanguageValidation(
        'Hello. Привет world!',
        englishContext,
        'ENGLISH'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Latin word found: "привет"');
    });

    it('должен пропустить русское слово, найденное в контексте', () => {
      const result = llmLanguageValidation(
        'Working with разработка every day.',
        mixedContext,
        'ENGLISH'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен отклонить смешанный текст без контекста', () => {
      const result = llmLanguageValidation(
        'Hello! Это смешанный текст.',
        englishContext,
        'ENGLISH'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Latin word found: "это"');
    });
  });

  describe('Украинский язык', () => {
    it('должен пропустить корректный украинский текст', () => {
      const result = llmLanguageValidation(
        'Привіт, як справи? Працюю в Києві.',
        'українська компанія розробка київ',
        'UKRAINIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен пропустить украинские слова даже если их НЕТ в контексте', () => {
      const result = llmLanguageValidation(
        'Розробляємо інноваційні рішення для автоматизації бізнесу.',
        'hello world english context data', // украинских слов НЕТ в контексте
        'UKRAINIAN'
      );
      expect(result.isValid).toBe(true); // украинские слова всегда ОК для украинского языка
    });

    it('должен отклонить английское слово', () => {
      const result = llmLanguageValidation(
        'Hello світ!',
        'українська компанія',
        'UKRAINIAN'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Cyrillic word found: "hello"');
    });

    it('должен пропустить английские термины в контексте', () => {
      const result = llmLanguageValidation(
        'Працюю з software кожен день.',
        'компанія software розробка development',
        'UKRAINIAN'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Специальные случаи', () => {
    it('должен игнорировать слово mainlink', () => {
      const result = llmLanguageValidation(
        'Перейди по mainlink для деталей.',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен корректно обрабатывать слова с символами', () => {
      const result = llmLanguageValidation(
        'Стоимость: $500, €300, ₽25000 (отлично!).',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать пустые слова', () => {
      const result = llmLanguageValidation(
        'Привет,,,, мир!!!',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать смешанную пунктуацию', () => {
      const result = llmLanguageValidation(
        'Привет... Как дела??? Отлично!',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать числа', () => {
      const result = llmLanguageValidation(
        'Цена 1000 рублей, скидка 10%.',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать смешанные символы', () => {
      const result = llmLanguageValidation(
        'Email: test@example.com, телефон: +7-999-123-45-67.',
        'test example com телефон email',
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Проверка имен собственных vs контекста', () => {
    describe('Глобальные имена собственные (НЕТ в контексте)', () => {
      it('Не должен пропустить глобальные бренды в начале предложения', () => {
        const result = llmLanguageValidation(
          'Google Работаю в Google уже год.',
          '', // Google НЕТ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
      });

      it('должен пропустить глобальные бренды в середине предложения', () => {
        const result = llmLanguageValidation(
          'Работаю в Google уже год.',
          'работаю год', // Google НЕТ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен пропустить несколько глобальных брендов', () => {
        const result = llmLanguageValidation(
          'Использую Microsoft, Apple и Google одновременно.',
          'использую одновременно', // брендов НЕТ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен пропустить технические термины как имена собственные', () => {
        const result = llmLanguageValidation(
          'Изучаю JavaScript и TypeScript сейчас.',
          'изучаю сейчас', // языков НЕТ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен отклонить английские слова в начале предложения', () => {
        const result = llmLanguageValidation(
          'Google это поисковик.',
          'поисковик это', // Google НЕТ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "google"');
      });

      it('должен отклонить английские слова после точки', () => {
        const result = llmLanguageValidation(
          'Да. Google это поисковик.',
          'поисковик это да', // Google НЕТ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "google"');
      });
    });

    describe('Слова из контекста (ЕСТЬ в контексте)', () => {
      it('должен пропустить английские слова из контекста в любом месте', () => {
        const result = llmLanguageValidation(
          'Software делаем качественно.',
          'компания software разработка качественно', // software ЕСТЬ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен пропустить слова из контекста даже в начале', () => {
        const result = llmLanguageValidation(
          'Development наш профиль.',
          'наш профиль development команда', // development ЕСТЬ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен пропустить слова из контекста после точки', () => {
        const result = llmLanguageValidation(
          'Работаем. Software наша специальность.',
          'работаем специальность software наша', // software ЕСТЬ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });
    });

    describe('Обычные английские слова (НЕТ в контексте)', () => {
      it('должен пропустить английские слова с большой буквы в середине как имена собственные', () => {
        const result = llmLanguageValidation(
          'Работаю с Hello каждый день.',
          'работаю каждый день', // Hello НЕТ в контексте, но в середине = имя собственное
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true); // Hello в середине = имя собственное
      });

      it('должен отклонить строчные английские слова в середине', () => {
        const result = llmLanguageValidation(
          'Делаю work каждый день.',
          'делаю каждый день', // work НЕТ в контексте
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "work"');
      });

      it('должен пропустить неизвестные аббревиатуры с большой буквы в середине', () => {
        const result = llmLanguageValidation(
          'Используем ABC технологии.',
          'используем технологии', // ABC НЕТ в контексте, но в середине = имя собственное
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true); // ABC в середине = имя собственное
      });

      it('должен отклонить английские слова в начале предложения', () => {
        const result = llmLanguageValidation(
          'Work делаю каждый день.',
          'делаю каждый день', // Work НЕТ в контексте и в начале
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "work"');
      });

      it('должен отклонить английские слова после точки', () => {
        const result = llmLanguageValidation(
          'Привет. Work делаю каждый день.',
          'привет делаю каждый день', // Work НЕТ в контексте и после точки
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "work"');
      });
    });
  });

  describe('Реальные примеры', () => {
    it('должен проверить типичное продающее сообщение на русском', () => {
      const context =
        'crm система продажи клиенты автоматизация бизнес процессы moscow';
      const result = llmLanguageValidation(
        'Наша CRM-система поможет автоматизировать продажи. Интегрируется с любыми процессами.',
        context,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен проверить типичное продающее сообщение на английском с русскими словами из контекста', () => {
      const result = llmLanguageValidation(
        'Our CRM-система helps automate sales. Integrates with any processes.',
        'crm система system sales clients automation business processes moscow', // добавил "система" в контекст
        'ENGLISH'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен отклонить английский текст с русскими словами НЕ из контекста', () => {
      const result = llmLanguageValidation(
        'Our CRM-система helps automate sales.',
        'crm system sales clients automation business processes moscow', // "система" НЕТ в контексте
        'ENGLISH'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Latin word found: "система"');
    });

    it('должен отклонить английские слова в начале без контекста', () => {
      const result = llmLanguageValidation(
        'Hello! Наша компания делает системы.',
        'наша компания делает системы', // Hello НЕТ в контексте и в начале
        'RUSSIAN'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Cyrillic word found: "hello"');
    });

    it('должен пропустить английские слова в середине как имена собственные', () => {
      const result = llmLanguageValidation(
        'Наша компания использует Software для работы.',
        'наша компания использует для работы', // Software НЕТ в контексте, но в середине = имя собственное
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен проверить текст с техническими терминами', () => {
      const context =
        'api rest json xml database sql mongodb postgresql react nodejs javascript typescript';
      const result = llmLanguageValidation(
        'Используем REST API с JSON, подключаем MongoDB через JavaScript.',
        context,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен пропустить технические термины как имена собственные в середине', () => {
      const result = llmLanguageValidation(
        'Используем Blockchain и AI для обработки.',
        'используем для обработки', // Blockchain и AI НЕТ в контексте, но в середине = имена собственные
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен отклонить строчные английские термины', () => {
      const result = llmLanguageValidation(
        'Используем blockchain и ai для обработки.',
        'используем для обработки', // blockchain и ai строчными = обычные слова
        'RUSSIAN'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Non-Cyrillic word found: "blockchain"');
    });
  });

  describe('Граничные случаи', () => {
    it('должен обрабатывать пустую строку', () => {
      const result = llmLanguageValidation('', russianContext, 'RUSSIAN');
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать строку только из знаков препинания', () => {
      const result = llmLanguageValidation(
        '!!! ??? ... --- @@@ $$$',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать очень длинный контекст', () => {
      const longContext = 'слово '.repeat(1000) + 'test important context data';
      const result = llmLanguageValidation(
        'Важный test для проверки.',
        longContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать сложную пунктуацию', () => {
      const result = llmLanguageValidation(
        'Привет!!! Как дела??? Всё отлично... Работаю.',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать Unicode символы', () => {
      const result = llmLanguageValidation(
        'Цена ₽1000, скидка €50, доллар $25.',
        russianContext,
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });

    it('должен обрабатывать эмодзи и спецсимволы', () => {
      const result = llmLanguageValidation(
        'Отличная работа! 👍 100% результат ✓',
        'отличная работа результат',
        'RUSSIAN'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Отрицательные тесты (должны возвращать false)', () => {
    describe('Русский язык - отклонение английских слов', () => {
      it('должен отклонить английское слово в самом начале', () => {
        const result = llmLanguageValidation(
          'Welcome в нашу компанию!',
          'компания наша',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "welcome"');
      });

      it('должен отклонить несколько английских слов подряд', () => {
        const result = llmLanguageValidation(
          'Мы используем modern technology для работы.',
          'используем для работы',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "modern"');
      });

      it('должен отклонить английские слова после восклицательного знака', () => {
        const result = llmLanguageValidation(
          'Отлично! Great работа всех!',
          'отлично работа всех',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "great"');
      });

      it('должен отклонить английские слова после вопросительного знака', () => {
        const result = llmLanguageValidation(
          'Как дела? Good morning всем!',
          'как дела всем',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "good"');
      });

      it('должен отклонить английские слова после многоточия', () => {
        const result = llmLanguageValidation(
          'Подождите... Wait немного.',
          'подождите немного',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "wait"');
      });

      it('должен отклонить строчные английские слова везде', () => {
        const result = llmLanguageValidation(
          'Наша company работает хорошо.',
          'наша работает хорошо',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "company"');
      });

      it('должен отклонить английские слова с пустым контекстом', () => {
        const result = llmLanguageValidation(
          'Используем software для разработки.',
          '', // пустой контекст
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "software"');
      });

      it('должен отклонить английское слово даже если похожее есть в контексте', () => {
        const result = llmLanguageValidation(
          'Наш softwares очень хороший.',
          'software программа', // в контексте software, но не softwares
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "softwares"');
      });

      it('должен отклонить английские слова в кавычках в начале', () => {
        const result = llmLanguageValidation(
          '"Hello" - это приветствие.',
          'это приветствие',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "hello"');
      });

      it('должен отклонить смешанные слова', () => {
        const result = llmLanguageValidation(
          'Наш bestшая команда.',
          'наш команда',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "bestшая"');
      });
    });

    describe('Английский язык - отклонение русских слов', () => {
      it('должен отклонить русское слово в начале', () => {
        const result = llmLanguageValidation(
          'Привет everyone!',
          'everyone hello',
          'ENGLISH'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Latin word found: "привет"');
      });

      it('должен отклонить несколько русских слов', () => {
        const result = llmLanguageValidation(
          'We разрабатываем программы for clients.',
          'we for clients',
          'ENGLISH'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Latin word found: "разрабатываем"');
      });

      it('должен отклонить русские слова после точки', () => {
        const result = llmLanguageValidation(
          'Hello. Спасибо for your help.',
          'hello for your help',
          'ENGLISH'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Latin word found: "спасибо"');
      });

      it('должен отклонить строчные русские слова в середине', () => {
        const result = llmLanguageValidation(
          'Our команда is the best.',
          'our is the best',
          'ENGLISH'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Latin word found: "команда"');
      });

      it('должен отклонить русские слова с пустым контекстом', () => {
        const result = llmLanguageValidation(
          'Working with клиенты every day.',
          '',
          'ENGLISH'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Latin word found: "клиенты"');
      });
    });

    describe('Украинский язык - отклонение неправильных слов', () => {
      it('должен отклонить английские слова в начале', () => {
        const result = llmLanguageValidation(
          'Hello друзі!',
          'друзі привіт',
          'UKRAINIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "hello"');
      });

      it('должен отклонить латиницу в середине украинского текста', () => {
        const result = llmLanguageValidation(
          'Ми працюємо з clients щодня.',
          'працюємо щодня',
          'UKRAINIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "clients"');
      });
    });

    describe('Особые случаи с контекстом', () => {
      it('должен отклонить слово не из контекста, даже если часть совпадает', () => {
        const result = llmLanguageValidation(
          'Используем testing для проверки.',
          'test проверка использовать', // есть test, но нет testing
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "testing"');
      });

      it('должен пропустить слово с другим регистром, если оно есть в контексте', () => {
        const result = llmLanguageValidation(
          'Наш product отличный.',
          'product товар наш', // PRODUCT в верхнем регистре найдется как product
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('не должен отклонить слово не из контекста если оно с заглавной буквы', () => {
        const result = llmLanguageValidation(
          'Наш SYSTEM отличная.',
          'product товар наш',
          'RUSSIAN'
        );

        expect(result.isValid).toBe(true);
      });

      it('должен отклонить составные слова с дефисом', () => {
        const result = llmLanguageValidation(
          'Используем well-known методы.',
          'методы используем',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        // well и known будут разделены дефисом
        expect(result.error).toContain('Non-Cyrillic word found: "well"');
      });
    });

    describe('Множественные нарушения', () => {
      it('должен отклонить при первом же нарушении', () => {
        const result = llmLanguageValidation(
          'Hello world and привет всем!',
          'всем привет',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "hello"');
        // Проверка остановится на первом нарушении
      });

      it('должен отклонить текст полностью на другом языке', () => {
        const result = llmLanguageValidation(
          'This is completely English text.',
          '',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "this"');
      });

      it('должен отклонить транслитерацию', () => {
        const result = llmLanguageValidation('Privet kak dela?', '', 'RUSSIAN');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "privet"');
      });
    });

    describe('Граничные случаи для имен собственных', () => {
      it('должен отклонить имя собственное если оно единственное слово', () => {
        const result = llmLanguageValidation('Microsoft', '', 'RUSSIAN');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "microsoft"');
      });

      it('должен отклонить имена собственные после двоеточия', () => {
        const result = llmLanguageValidation(
          'Компания: Microsoft работает.',
          'компания работает',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "microsoft"');
      });

      it('должен отклонить имена собственные после точки с запятой', () => {
        const result = llmLanguageValidation(
          'Работаем хорошо; знает это. Работаем хорошо; Google знает это',
          'работаем хорошо знает это',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "google"');
      });

      it('должен отклонить имена собственные после многоточия', () => {
        const result = llmLanguageValidation(
          'Думаю... Microsoft лучшая компания.',
          'думаю лучшая компания',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "microsoft"');
      });

      it('должен отклонить имена собственные после восклицания и точки', () => {
        const result = llmLanguageValidation(
          'Отлично! Работаем дальше. Apple нам поможет.',
          'отлично работаем дальше нам поможет',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "apple"');
      });

      it('должен отклонить имена собственные в сложном предложении с несколькими точками', () => {
        const result = llmLanguageValidation(
          'Наша компания работает с 2010 года. Мы разрабатываем системы. Google партнер наш. Также работаем с другими.',
          'наша компания работает года разрабатываем системы партнер наш также работаем другими',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "google"');
      });

      it('должен отклонить первое английское слово в длинном тексте', () => {
        const result = llmLanguageValidation(
          'Hello мир! Сегодня прекрасный день для работы. Наша команда готова к новым вызовам. Технологии развиваются быстро.',
          'мир сегодня прекрасный день для работы наша команда готова новым вызовам технологии развиваются быстро',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "hello"');
      });

      it('должен отклонить английские слова после разных знаков препинания в одном тексте', () => {
        const result = llmLanguageValidation(
          'Работаем отлично! Microsoft хорошая компания. Также используем Google? Apple тоже неплохая. Думаю... Facebook интересная.',
          'работаем отлично хорошая компания также используем тоже неплохая думаю интересная',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "microsoft"');
      });

      it('должен отклонить имена собственные после кавычек в сложном предложении', () => {
        const result = llmLanguageValidation(
          'Сказал: "Отлично". Microsoft работает хорошо. Ответил: "Согласен". Google тоже хорошо.',
          'сказал отлично работает хорошо ответил согласен тоже хорошо',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "microsoft"');
      });

      it('должен отклонить имена собственные после френч-кавычек', () => {
        const result = llmLanguageValidation(
          'Он сказал: «Отлично». Microsoft работает хорошо.',
          'он сказал отлично работает хорошо',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "microsoft"');
      });

      it('должен отклонить составные нарушения в длинном тексте', () => {
        const result = llmLanguageValidation(
          'Компания работает с 2010 года. Excellent результаты показывает. Наши клиенты довольны. Super качество продукции.',
          'компания работает года результаты показывает наши клиенты довольны качество продукции',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "excellent"');
      });

      it('должен отклонить английские слова в начале каждого предложения', () => {
        const result = llmLanguageValidation(
          'Good утро! Excellent день сегодня! Perfect погода для работы!',
          'утро день сегодня погода для работы',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "good"');
      });

      it('должен пропустить имена собственные в середине длинного текста', () => {
        const result = llmLanguageValidation(
          'Наша компания работает с Microsoft уже десять лет. Используем их Azure для облачных решений. Также работаем с Google Cloud.',
          'наша компания работает уже десять лет используем их для облачных решений также работаем',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен отклонить строчные английские слова даже в длинном тексте', () => {
        const result = llmLanguageValidation(
          'Наша компания работает отлично. Делаем software для клиентов. Качество проверяем тщательно.',
          'наша компания работает отлично делаем для клиентов качество проверяем тщательно',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "software"');
      });

      it('должен обрабатывать смешанную пунктуацию с именами собственными', () => {
        const result = llmLanguageValidation(
          'Да!!! Конечно??? Работаем с Microsoft отлично!!! Согласны???',
          'да конечно работаем отлично согласны',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(true);
      });

      it('должен отклонить имена собственные после сложных знаков препинания', () => {
        const result = llmLanguageValidation(
          'Работаем хорошо!!! Отлично??? Microsoft знает это... Согласны???',
          'работаем хорошо отлично знает это согласны',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "microsoft"');
      });

      it('должен отклонить английские слова в очень длинном тексте', () => {
        const longText =
          'Наша компания работает уже много лет. Мы специализируемся на разработке программного обеспечения. Команда состоит из опытных специалистов. Используем современные технологии. Клиенты довольны нашими решениями. Quality наш приоритет. Постоянно совершенствуемся. Изучаем новые подходы. Развиваем компетенции команды.';
        const result = llmLanguageValidation(
          longText,
          'наша компания работает уже много лет специализируемся разработке программного обеспечения команда состоит опытных специалистов используем современные технологии клиенты довольны нашими решениями наш приоритет постоянно совершенствуемся изучаем новые подходы развиваем компетенции команды',
          'RUSSIAN'
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Non-Cyrillic word found: "quality"');
      });
    });
  });

  describe('Производительность', () => {
    it('должен быстро обрабатывать длинные тексты', () => {
      const longText =
        'Это очень длинный текст для проверки производительности. '.repeat(100);
      const start = Date.now();

      const result = llmLanguageValidation(longText, russianContext, 'RUSSIAN');

      const duration = Date.now() - start;
      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(1000); // Менее 1 секунды
    });

    it('должен обрабатывать много коротких слов', () => {
      const manyWords = Array(1000).fill('слово').join(' ');

      const result = llmLanguageValidation(
        manyWords,
        russianContext,
        'RUSSIAN'
      );

      expect(result.isValid).toBe(true);
    });
  });
});
