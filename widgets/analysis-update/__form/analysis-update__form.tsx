import { Button, Col, Form, Input, Row, Select } from 'antd';
import React, { useRef } from 'react';
import type { Analysis } from '@/@types/Analysis';
import { convertUndefinedToNull } from '@/utils/convertUndefinedToNull';

import classes from './analysis-update__form.module.css';

const { TextArea } = Input;
const { Option } = Select;

interface AnalysisUpdateFormProps {
  loading?: boolean;
  analysis: Analysis | null;
  className?: string;

  onFinish: (data: Omit<Analysis, 'dialogs' | 'companyId'>) => void;
  onFinishFailed: () => void;
}

const rules = [
  {
    required: true,
    message: 'Обязательное поле!',
  },
];

export const AnalysisUpdateForm = (props: AnalysisUpdateFormProps) => {
  const {
    loading = false,
    analysis = null,
    onFinish,
    onFinishFailed,
    className,
  } = props;

  const formRef = useRef<any>(null);

  const getInitialValues = () => {
    if (analysis) {
      return {
        language: analysis.language,
        messagesCount: analysis.messagesCount,
        meGender: analysis.meGender,
        userGender: analysis.userGender,
        meName: analysis.meName,
        userName: analysis.userName,
        companyName: analysis.companyName,
        aiRole: analysis.aiRole,
        companyDescription: analysis.companyDescription,
        goal: analysis.goal,
        part: analysis.part,
        flowHandling: analysis.flowHandling,
        addedInformation: analysis.addedInformation,
        firstQuestion: analysis.firstQuestion,
        addedQuestion: analysis.addedQuestion,
        leadDefinition: analysis.leadDefinition,
        leadGoal: analysis.leadGoal,
      };
    }

    return {
      language: 'RUSSIAN',
      messagesCount: 4,
      meGender: 'male',
      userGender: 'male',
      meName: 'Евгений',
      userName: 'Павел',
    };
  };

  const handleFinish = (values: Omit<Analysis, 'dialogs' | 'companyId'>) => {
    const processedValues = convertUndefinedToNull(values);
    onFinish(processedValues as Omit<Analysis, 'dialogs' | 'companyId'>);
  };

  return (
    <Form
      name="basic"
      layout="vertical"
      className={`${classes.form} ${className || ''}`}
      onFinish={handleFinish}
      initialValues={getInitialValues()}
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
              <Input placeholder="Введите имя инициатора" autoComplete="off" />
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
              <Input placeholder="Введите имя отвечающего" autoComplete="off" />
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
            autoComplete="off"
            showCount
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
            autoComplete="off"
            showCount
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
            maxLength={3000}
            placeholder="Компания занимается ..."
            autoComplete="off"
            showCount
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
            autoComplete="off"
            showCount
          />
        </Form.Item>
        <Form.Item
          className={classes.formItem}
          label="Критерии лида"
          name="leadDefinition"
          rules={rules}
        >
          <TextArea
            className={classes.textArea}
            maxLength={1000}
            placeholder="Собеседник согласился на ..."
            autoComplete="off"
            showCount
          />
        </Form.Item>
        <Form.Item
          className={classes.formItem}
          label="Целевое действие при статусе лид"
          name="leadGoal"
          rules={rules}
        >
          <TextArea
            className={classes.textArea}
            maxLength={1000}
            placeholder="Проверить, что время зума выбрано и ..."
            autoComplete="off"
            showCount
          />
        </Form.Item>
        <Form.Item
          className={classes.formItem}
          label="Уникальная часть"
          name="part"
        >
          <TextArea
            placeholder="t.me/test"
            className={classes.textArea}
            maxLength={1000}
            autoComplete="off"
            showCount
          />
        </Form.Item>
        <Form.Item
          className={classes.formItem}
          label="Обработка сценариев"
          name="flowHandling"
        >
          <TextArea
            className={classes.textArea}
            maxLength={5000}
            placeholder="В случае, если .. то .."
            autoComplete="off"
            showCount
          />
        </Form.Item>
        <Form.Item
          className={classes.formItem}
          label="Дополнительная информация"
          name="addedInformation"
        >
          <TextArea
            className={classes.textArea}
            maxLength={5000}
            placeholder="Обьемное описание рода деятельности компании"
            autoComplete="off"
            showCount
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
            autoComplete="off"
            showCount
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
            autoComplete="off"
            showCount
          />
        </Form.Item>
      </div>
      <div className={classes.buttonSeparator}></div>
      <Form.Item className={classes.formItem} style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          className={classes.submitBtn}
          loading={loading}
        >
          {loading
            ? analysis && analysis.companyId
              ? 'Изменение разбора...'
              : 'Создание разбора...'
            : analysis && analysis.companyId
              ? 'Изменить разбор'
              : 'Создать разбор'}
        </Button>
      </Form.Item>
    </Form>
  );
};
