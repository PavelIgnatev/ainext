import { llmDefaultValidation } from '../utils/llmDefaultValidation';

describe('LLM Default Validation', () => {
  describe('Валидные случаи', () => {
    describe('Базовый текст', () => {
      it('должен пропускать обычный текст', () => {
        expect(() =>
          llmDefaultValidation('Привет! How are you? 123')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation('Текст с запятыми, точками. И восклицаниями!')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation(
            'Это длинный текст с разными знаками препинания: точки, запятые, восклицания!'
          )
        ).not.toThrow();
      });

      it('должен пропускать текст с числами и датами', () => {
        expect(() => llmDefaultValidation('Сегодня 25.03.2024')).not.toThrow();
        expect(() => llmDefaultValidation('Время встречи 15:00')).not.toThrow();
        expect(() => llmDefaultValidation('Цена 99.99')).not.toThrow();
        expect(() => llmDefaultValidation('Версия 1.2.3')).not.toThrow();
      });

      it('должен пропускать текст с валютой и процентами', () => {
        expect(() =>
          llmDefaultValidation('Цена $100, €50 и ₽200')
        ).not.toThrow();
        expect(() => llmDefaultValidation('Скидка 20% на товар')).not.toThrow();
        expect(() =>
          llmDefaultValidation('Бонус +10% к зарплате')
        ).not.toThrow();
      });

      it('должен пропускать текст с подмененными ссылками', () => {
        expect(() =>
          llmDefaultValidation('Посетите LINK_1234567890')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation(
            'Подробнее на LINK_9876543210 или LINK_1111222333'
          )
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation('Наш сайт LINK_4444555666, заходите!')
        ).not.toThrow();
      });
    });

    describe('Текст без маркеров', () => {
      it('должен пропускать фразы со словами-маркерами без двоеточия', () => {
        expect(() =>
          llmDefaultValidation('у меня есть вопрос про это')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation('важный момент в этом деле')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation('хочу отметить ваш профессионализм')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation('обратите внимание на детали')
        ).not.toThrow();
      });

      it('должен пропускать глагольные конструкции без маркеров', () => {
        expect(() =>
          llmDefaultValidation('хочу спросить про вашу ситуацию')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation('позвольте уточнить детали')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation('давайте обсудим варианты')
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation('могу рассказать подробнее')
        ).not.toThrow();
      });

      it('должен пропускать сложные предложения с потенциальными маркерами', () => {
        expect(() =>
          llmDefaultValidation(
            'Важный разговор предстоит, хочу уточнить детали встречи, не забудьте документы'
          )
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation(
            'Отмечу ваше внимание к деталям и хочу задать пару вопросов по проекту'
          )
        ).not.toThrow();
        expect(() =>
          llmDefaultValidation(
            'Для справки могу добавить информацию о сроках и процессе работы'
          )
        ).not.toThrow();
      });
    });
  });

  describe('Невалидные случаи', () => {
    describe('Пустые значения', () => {
      it('должен блокировать пустой текст', () => {
        expect(() => llmDefaultValidation('')).toThrow('Empty response');
        expect(() => llmDefaultValidation('   ')).toThrow('Empty response');
        expect(() => llmDefaultValidation('\n\t\r')).toThrow('Empty response');
      });
    });

    describe('HTML и разметка', () => {
      it('должен блокировать HTML теги', () => {
        expect(() => llmDefaultValidation('<div>test</div>')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('<script>alert(1)</script>')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('<p>параграф</p>')).toThrow(
          'Invalid characters detected'
        );
      });

      it('должен блокировать markdown разметку', () => {
        expect(() => llmDefaultValidation('**жирный**')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('*курсив*')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('`код`')).toThrow(
          'Invalid characters detected'
        );
      });
    });

    describe('Спецсимволы', () => {
      it('должен блокировать эмодзи', () => {
        expect(() => llmDefaultValidation('привет 👋')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('отлично ✨')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('❤️ спасибо')).toThrow(
          'Invalid characters detected'
        );
      });

      it('должен блокировать спецсимволы', () => {
        expect(() => llmDefaultValidation('test™')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('компания®')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('параграф§')).toThrow(
          'Invalid characters detected'
        );
      });

      it('должен блокировать другие алфавиты', () => {
        expect(() => llmDefaultValidation('你好')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('مرحبا')).toThrow(
          'Invalid characters detected'
        );
        expect(() => llmDefaultValidation('안녕하세요')).toThrow(
          'Invalid characters detected'
        );
      });
    });

    describe('Формальные маркеры', () => {
      it('должен блокировать простые маркеры', () => {
        expect(() => llmDefaultValidation('вопрос: как дела?')).toThrow(
          'Formal marker detected'
        );
        expect(() => llmDefaultValidation('ответ: хорошо')).toThrow(
          'Formal marker detected'
        );
        expect(() => llmDefaultValidation('важно: помнить')).toThrow(
          'Formal marker detected'
        );
      });

      it('должен блокировать маркеры с уточнениями', () => {
        expect(() =>
          llmDefaultValidation('вопрос важный: что думаете?')
        ).toThrow('Formal marker detected');
        expect(() => llmDefaultValidation('вопрос для вас: как быть?')).toThrow(
          'Formal marker detected'
        );
        expect(() =>
          llmDefaultValidation('важное замечание: обратите внимание')
        ).toThrow('Formal marker detected');
      });

      it('должен блокировать глагольные маркеры', () => {
        expect(() => llmDefaultValidation('спрошу: как дела?')).toThrow(
          'Formal marker detected'
        );
        expect(() => llmDefaultValidation('отвечу: все хорошо')).toThrow(
          'Formal marker detected'
        );
        expect(() =>
          llmDefaultValidation('хочу спросить: что нового?')
        ).toThrow('Formal marker detected');
      });

      it('должен блокировать устойчивые выражения', () => {
        expect(() =>
          llmDefaultValidation('к вашему сведению: это важно')
        ).toThrow('Formal marker detected');
        expect(() => llmDefaultValidation('nb: запомните это')).toThrow(
          'Formal marker detected'
        );
        expect(() => llmDefaultValidation('и btw: еще кое-что')).toThrow(
          'Formal marker detected'
        );
      });

      it('должен блокировать маркеры в разных регистрах', () => {
        expect(() => llmDefaultValidation('ВОПРОС: как дела?')).toThrow(
          'Formal marker detected'
        );
        expect(() => llmDefaultValidation('Важно: помнить')).toThrow(
          'Formal marker detected'
        );
        expect(() => llmDefaultValidation('ВаЖнО: заметить')).toThrow(
          'Formal marker detected'
        );
      });

      it('должен блокировать множественные маркеры', () => {
        expect(() =>
          llmDefaultValidation('важно: помнить! nb: и это тоже')
        ).toThrow('Formal marker detected');
        expect(() =>
          llmDefaultValidation('спрошу: как дела? замечу: хорошо')
        ).toThrow('Formal marker detected');
      });
    });
  });
});
