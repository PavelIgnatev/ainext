import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  notification,
  Row,
  Select,
  Space,
  Spin,
} from 'antd';
import React from 'react';

import { GroupId } from '@/@types/GroupId';

import styles from './startup-widget__drawer.module.css';

const { Option } = Select;

interface StartupWidgetDrawerProps {
  loading: boolean;

  groupId: string | null;
  groupIdData: GroupId | null;
  groupIdDatabase: Array<string>;

  onCloseDrawer: () => void;
  onSumbitDrawer: ({
    data,
    database,
  }: {
    data: GroupId;
    database: Array<string>;
  }) => void;
}

export const StartupWidgetDrawer = (props: StartupWidgetDrawerProps) => {
  const {
    groupId,
    loading,
    groupIdData,
    groupIdDatabase,
    onCloseDrawer,
    onSumbitDrawer,
  } = props;

  if (!groupId) {
    return null;
  }

  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: GroupId = {
        groupId: values.groupId,
        name: values.name,
        target: Number(values.target),
        currentCount: Number(values.currentCount),
        messagesCount: Number(values.messagesCount),
        language: values.language,
        aiRole: values.aiRole,
        companyDescription: values.companyDescription,
        goal: values.goal,
        leadDefinition: values.leadDefinition,
        leadGoal: values.leadGoal,
        firstMessagePrompt: values.firstMessagePrompt,
        secondMessagePrompt: values.secondMessagePrompt,
        part: values.part?.trim() || null,
        flowHandling: values.flowHandling?.trim() || null,
        addedInformation: values.addedInformation?.trim() || null,
        addedQuestion: values.addedQuestion?.trim() || null,
      };

      const database = values.database
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);

      onSumbitDrawer({ data, database });
    } catch (error) {
      notification.error({
        message: 'Произошла ошибка',
        description:
          error instanceof Error
            ? error.message
            : 'Ошибка валидации. Проверьте, пожалуйста, заполненные поля.',
      });
    }
  };

  return (
    <Drawer
      title={
        loading ? (
          <Spin spinning={loading} />
        ) : (
          `${!groupIdData ? 'Создание' : 'Обновление'} запуска`
        )
      }
      width={820}
      onClose={onCloseDrawer}
      open={Boolean(groupId)}
      classNames={{
        body: styles.drawerBody,
      }}
      extra={
        <Space>
          <Button loading={loading} onClick={handleSubmit} type="primary">
            {loading ? '' : !groupIdData ? 'Создать' : 'Обновить'}
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading} style={{ marginTop: '50px' }}>
        {!loading && groupId && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              ...groupIdData,
              groupId,
              database: groupIdDatabase.join('\n'),
              language: groupIdData?.language || 'RUSSIAN',
              messagesCount: groupIdData?.messagesCount || 4,
              currentCount: groupIdData?.currentCount || 0,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="groupId"
                  label="Идентификатор"
                  rules={[{ required: true }]}
                >
                  <Input disabled placeholder="Обязательное поле" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Название"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input placeholder="Название запуска" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="currentCount"
                  label="Текущее значение отправок"
                  rules={[
                    {
                      required: true,
                      message: 'Обязательное поле',
                    },
                  ]}
                  normalize={(v) => (v === '' ? null : Number(v))}
                >
                  <Input
                    disabled
                    type="number"
                    placeholder="Текущее значение отправок"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="target"
                  label="Целевое значение отправок"
                  rules={[
                    {
                      required: true,
                      message: 'Обязательное поле',
                    },
                  ]}
                  normalize={(v) => (v === '' ? null : Number(v))}
                >
                  <Input
                    type="number"
                    placeholder="Целевое значение отправок"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  style={{ marginBottom: '10px' }}
                  label="Количество сообщений"
                  name="messagesCount"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Select>
                    <Option value={3}>3</Option>
                    <Option value={3.5}>3.5</Option>
                    <Option value={4}>4</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="language"
                  label="Язык"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Select>
                    <Option value="RUSSIAN">РУССКИЙ</Option>
                    <Option value="UKRAINIAN">УКРАИНСКИЙ</Option>
                    <Option value="ENGLISH">АНГЛИЙСКИЙ</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="База данных"
                  name="database"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input.TextArea rows={6} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="aiRole"
                  label="Роль AI менеджера"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input.TextArea
                    rows={1}
                    placeholder="Представитель компании ..."
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="companyDescription"
                  label="Описание компании"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input.TextArea
                    rows={1}
                    placeholder="Компания занимается ..."
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="goal"
                  label="Целевое действие"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input.TextArea
                    rows={1}
                    placeholder="Убедить собеседника перейти в информационного ..."
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="leadDefinition"
                  label="Критерии лида"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input.TextArea
                    rows={1}
                    placeholder="Человек, который заинтересован в услуге..."
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="leadGoal"
                  label="Целевое действие при статусе лид"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input.TextArea
                    rows={1}
                    placeholder="Отправить контакты менеджера..."
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="part"
                  label="Уникальная часть (ссылка на бота, сайт, etc)"
                >
                  <Input placeholder="t.me/test" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="flowHandling" label="Обработка сценариев">
                  <Input.TextArea rows={1} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="addedInformation"
                  label="Дополнительная информация"
                >
                  <Input.TextArea rows={1} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstMessagePrompt"
                  label="Первое приветствие"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input placeholder="Здравствуйте!" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="secondMessagePrompt"
                  label="Первый вопрос"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input.TextArea
                    rows={1}
                    placeholder="Заметил вас в одном из совместных ..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="addedQuestion" label="Дополнительный вопрос">
                  <Input.TextArea
                    rows={1}
                    placeholder="Подскажите, вы знакомы с компанией?"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Spin>
    </Drawer>
  );
};
