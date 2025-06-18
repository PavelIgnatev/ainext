import { Button, Col, Form, Input, Row, Select, notification } from 'antd';
import React, { useRef } from 'react';
import type { Analysis } from '@/@types/Analysis';
import { convertUndefinedToNull } from '@/helpers/convertUndefinedToNull';
import { validateField } from '@/helpers/validateField';

import classes from './analysis-create__form.module.css';

const { TextArea } = Input;
const { Option } = Select;

interface AnalysisCreateFormProps {
  loading?: boolean;
  onFinish: (data: Omit<Analysis, 'dialogs' | 'companyId'>) => void;
  onFinishFailed: () => void;
}

const rules = [
  {
    required: true,
    message: 'Обязательное поле!',
  },
];

export const AnalysisCreateForm = (props: AnalysisCreateFormProps) => {
  const { loading = false, onFinish, onFinishFailed } = props;

  const formRef = useRef<any>(null);

  const handleFinish = (values: Omit<Analysis, 'dialogs' | 'companyId'>) => {
    const {
      aiRole,
      goal,
      companyDescription,

      firstQuestion,
      part,
      addedQuestion,
    } = values;

    if (
      part &&
      !goal.toLowerCase().trim().includes(part.toLowerCase().trim())
    ) {
      notification.error({
        message: 'Ошибка в поле "Уникальная часть"',
        description: 'Значение не найдено внутри поля "Целевое действие"',
      });
      return;
    }

    const fieldValidations = [
      {
        value: aiRole,
        name: 'Роль AI менеджера',
        pattern: /[?!]/,
        message: 'Поле содержит недопустимые символы: ? или !',
      },
      {
        value: goal,
        name: 'Целевое действие',
        pattern: /[?!]/,
        message: 'Поле содержит недопустимые символы: ? или !',
      },
      {
        value: companyDescription,
        name: 'Описание компании',
        pattern: /[?!]/,
        message: 'Поле содержит недопустимые символы: ? или !',
      },
      {
        value: firstQuestion,
        name: 'Первый вопрос',
        pattern: /[!.:]/,
        message: 'Поле содержит недопустимые символы: !, : или .',
      },
      {
        value: addedQuestion,
        name: 'Дополнительный вопрос',
        pattern: /[!.:]/,
        message: 'Поле содержит недопустимые символы: !, : или .',
      },
    ];

    for (const validation of fieldValidations) {
      if (
        !validateField(
          validation.value,
          validation.name,
          validation.pattern,
          validation.message
        )
      ) {
        return;
      }
    }

    const questions = [
      { value: firstQuestion, name: 'Первый вопрос' },
      ...(addedQuestion
        ? [{ value: addedQuestion, name: 'Дополнительный вопрос' }]
        : []),
    ];
    const questionsWithoutMark = questions
      .filter(({ value }) => value && !value.includes('?'))
      .map(({ name }) => name);
    if (questionsWithoutMark.length > 0) {
      notification.error({
        message: 'Отсутствует знак "?"',
        description: `Добавьте знак "?" в следующих вопросах: ${questionsWithoutMark.join(', ')}`,
      });
      return;
    }

    if (part) {
      const forbiddenEndings = ['.', '?', ',', '!'];
      const lastChar = part.trim().slice(-1);
      if (forbiddenEndings.includes(lastChar)) {
        notification.error({
          message: 'Ошибка в поле "Уникальная часть"',
          description:
            'Значение не должно заканчиваться на ".", "?", "," или "!"',
        });
        return;
      }
    }

    const processedValues = convertUndefinedToNull(values);
    onFinish(processedValues as Omit<Analysis, 'dialogs' | 'companyId'>);
  };

  return (
    <>
      <Form
        name="basic"
        layout="vertical"
        className={classes.form}
        onFinish={handleFinish}
        initialValues={{
          language: 'RUSSIAN',
          messagesCount: 4,
          meGender: 'male',
          userGender: 'male',
          meName: 'Евгений',
          userName: 'Павел',
        }}
        onFinishFailed={onFinishFailed}
        ref={formRef}
      >
        <div className={classes.scrollableContent}>
          <Row gutter={[16, 8]} className={classes.formRow}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="meGender"
                label="Пол инцииатора"
                className={classes.formItem}
                rules={rules}
              >
                <Select placeholder="Выберите пол">
                  <Option value="male">МУЖСКОЙ</Option>
                  <Option value="female">ЖЕНСКИЙ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="meName"
                label="Имя инициатора"
                className={classes.formItem}
                rules={rules}
              >
                <Input placeholder="Введите имя инициатора" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 8]} className={classes.formRow}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="userGender"
                label="Пол отвечающего"
                className={classes.formItem}
                rules={rules}
              >
                <Select placeholder="Выберите пол">
                  <Option value="male">МУЖСКОЙ</Option>
                  <Option value="female">ЖЕНСКИЙ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="userName"
                label="Имя отвечающего"
                className={classes.formItem}
                rules={rules}
              >
                <Input placeholder="Введите имя отвечающего" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 8]} className={classes.formRow}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                className={classes.formItem}
                label="Язык разбора"
                name="language"
                rules={rules}
              >
                <Select placeholder="Выберите язык">
                  <Option value="RUSSIAN">РУССКИЙ</Option>
                  <Option value="UKRAINIAN">УКРАИНСКИЙ</Option>
                  <Option value="ENGLISH">АНГЛИЙСКИЙ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                className={classes.formItem}
                label="Количество сообщений"
                name="messagesCount"
                rules={rules}
              >
                <Select placeholder="Выберите количество">
                  <Option value={3}>3</Option>
                  <Option value={3.5}>3.5</Option>
                  <Option value={4}>4</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Название компании"
            name="companyName"
            rules={rules}
            className={classes.formItem}
          >
            <TextArea
              className={classes.textArea}
              maxLength={1000}
              placeholder="Введите название компании"
            />
          </Form.Item>
          <Form.Item
            className={classes.formItem}
            label="Роль AI менеджера"
            name="aiRole"
            rules={rules}
          >
            <TextArea
              className={classes.textArea}
              maxLength={1000}
              placeholder="Представитель компании ..."
            />
          </Form.Item>
          <Form.Item
            className={classes.formItem}
            label="Описание компании"
            name="companyDescription"
            rules={rules}
          >
            <TextArea
              className={classes.textArea}
              maxLength={30000}
              placeholder="Компания занимается ..."
            />
          </Form.Item>
          <Form.Item
            className={classes.formItem}
            label="Целевое действие"
            name="goal"
            rules={rules}
          >
            <TextArea
              className={classes.textArea}
              maxLength={1000}
              placeholder="Убедить собеседника перейти в информационного ..."
            />
          </Form.Item>
          <Form.Item
            className={classes.formItem}
            label="Уникальная часть"
            name="part"
          >
            <TextArea
              placeholder="@aisenderOfficial_bot"
              className={classes.textArea}
              maxLength={1000}
            />
          </Form.Item>
          <Form.Item
            className={classes.formItem}
            label="Обработка сценариев"
            name="flowHandling"
          >
            <TextArea
              className={classes.textArea}
              maxLength={50000}
              placeholder="В случае, если .. то .."
            />
          </Form.Item>
          <Form.Item
            className={classes.formItem}
            label="Дополнительная информация (появляется на этапе целевого действия)"
            name="addedInformation"
          >
            <TextArea
              className={classes.textArea}
              maxLength={50000}
              placeholder="Обьемное описание рода деятельности компании"
            />
          </Form.Item>
          <Form.Item
            className={classes.formItem}
            label="Первый вопрос"
            name="firstQuestion"
            rules={rules}
          >
            <TextArea
              className={classes.textArea}
              maxLength={1000}
              placeholder="Заметил вас в одном из совместных ..."
            />
          </Form.Item>
          <Form.Item
            className={classes.formItem}
            label="Дополнительный вопрос"
            name="addedQuestion"
          >
            <TextArea
              className={classes.textArea}
              maxLength={1000}
              placeholder="Подскажите, вы знакомы с компанией?"
            />
          </Form.Item>
        </div>
        <Form.Item className={classes.formItem}>
          <Button
            type="primary"
            htmlType="submit"
            className={classes.submitBtn}
            loading={loading}
          >
            {!loading ? 'Создать разбор' : 'Создание разбора'}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
