import { AutoComplete, Button, Col, Form, Input, Row, Select } from 'antd';
import React from 'react';

import classes from './analysis-create__form.module.css';

const { TextArea } = Input;
const { Option } = Select;

interface AnalysisCreateFormProps {
  loading?: boolean;

  onFinish: (data: {
    aiRole: string;
    companyName: string;
    messagesCount: number;
    companyDescription: string;
    goal: string;
    language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';

    addedInformation?: string;
    styleGuide?: string;
    addedQuestion?: string;
    flowHandling?: string;
    part?: string;
    firstQuestion?: string;
  }) => void;
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

  return (
    <Form
      name="basic"
      layout="vertical"
      className={classes.analysisCreateForm}
      onFinish={onFinish}
      initialValues={{
        language: 'RUSSIAN',
        messagesCount: 4,
        meGender: 'male',
        userGender: 'male',
        meName: 'Евгений',
        userName: 'Павел',
      }}
      onFinishFailed={onFinishFailed}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="meGender"
            label="Пол инцииатора"
            style={{ marginBottom: '10px' }}
            rules={[{ required: true, message: 'Обязательное поле' }]}
          >
            <Select>
              <Option value="male">МУЖСКОЙ</Option>
              <Option value="female">ЖЕНСКИЙ</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="meName"
            label="Имя инициатора"
            style={{ marginBottom: '10px' }}
            rules={[{ required: true, message: 'Обязательное поле' }]}
          >
            <Input placeholder="Евгений" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="userGender"
            label="Пол отвечающего"
            style={{ marginBottom: '10px' }}
            rules={[{ required: true, message: 'Обязательное поле' }]}
          >
            <Select>
              <Option value="male">МУЖСКОЙ</Option>
              <Option value="female">ЖЕНСКИЙ</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="userName"
            label="Имя отвечающего"
            style={{ marginBottom: '10px' }}
            rules={[{ required: true, message: 'Обязательное поле' }]}
          >
            <Input placeholder="Павел" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            style={{ marginBottom: '10px' }}
            label="Язык разбора"
            name="language"
            rules={rules}
          >
            <Select defaultValue="RUSSIAN">
              <Option value="RUSSIAN">РУССКИЙ</Option>
              <Option value="UKRAINIAN">УКРАИНСКИЙ</Option>
              <Option value="ENGLISH">АНГЛИЙСКИЙ</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            style={{ marginBottom: '10px' }}
            label="Количество сообщений"
            name="messagesCount"
            rules={rules}
          >
            <Select>
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
        style={{ marginBottom: '10px' }}
      >
        <TextArea style={{ height: 30 }} maxLength={1000} />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '10px' }}
        label="Роль AI менеджера"
        name="aiRole"
        rules={rules}
      >
        <TextArea style={{ height: 30 }} maxLength={1000} />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '10px' }}
        label="Описание компании"
        name="companyDescription"
        rules={rules}
      >
        <TextArea style={{ height: 30 }} maxLength={30000} />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '10px' }}
        label="Целевое действие"
        name="goal"
        rules={rules}
      >
        <TextArea style={{ height: 30 }} maxLength={1000} />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '10px' }}
        label="Уникальная часть"
        name="part"
      >
        <TextArea
          placeholder="@aisenderOfficial_bot"
          style={{ height: 30 }}
          maxLength={1000}
        />
      </Form.Item>
      {/* <Form.Item
        style={{ marginBottom: "10px" }}
        label="Стайл гайд"
        name="styleGuide"
      >
        <TextArea style={{ height: 30 }} maxLength={1500} />
      </Form.Item> */}

      <Form.Item
        style={{ marginBottom: '10px' }}
        label="Обработка сценариев"
        name="flowHandling"
      >
        <TextArea style={{ height: 30 }} maxLength={50000} />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '10px' }}
        label="Дополнительная информация (появляется на этапе целевого действия)"
        name="addedInformation"
      >
        <TextArea style={{ height: 30 }} maxLength={50000} />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '10px' }}
        label="Первый вопрос"
        name="firstQuestion"
        rules={rules}
      >
        <TextArea style={{ height: 30 }} maxLength={1000} />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '10px' }}
        label="Дополнительный вопрос"
        name="addedQuestion"
      >
        <TextArea style={{ height: 30 }} maxLength={1000} />
      </Form.Item>

      <Form.Item style={{ marginBottom: '10px' }}>
        <Button
          type="primary"
          htmlType="submit"
          block
          style={{ marginTop: '1em' }}
          size="large"
          loading={loading}
        >
          {!loading ? 'Создать разбор' : 'Создание разбора'}
        </Button>
      </Form.Item>
    </Form>
  );
};
