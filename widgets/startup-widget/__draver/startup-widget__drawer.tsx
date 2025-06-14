import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
} from 'antd';
import React from 'react';
import { toast } from 'react-toastify';

import { checkRandomString } from '../../../utils/checkRandomString';
import { FullFroupIdType } from '../startup-widget.types';

const { Option } = Select;

interface StartupWidgetDrawerProps {
  startupId: string | null;
  startupIdLoading: boolean;
  startupIdData: FullFroupIdType | null;

  onCloseStartupWidgetDrawer: () => void;
  onSubmitStartupWidget: (data: FullFroupIdType) => void;

  onExportLeads: () => void;
  onExportSent: () => void;
  onExportUnsent: () => void;
}

export const StartupWidgetDrawer = (props: StartupWidgetDrawerProps) => {
  const {
    startupId,
    startupIdLoading,
    startupIdData,
    onCloseStartupWidgetDrawer,
    onSubmitStartupWidget,
    onExportLeads,
    onExportSent,
    onExportUnsent,
  } = props;

  if (!startupId) {
    return null;
  }

  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.database = values.database
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line !== '');

      const {
        aiRole = '',
        goal = '',
        part = '',
        secondMessagePrompt = '',
        addedQuestion = '',
        companyDescription = '',
        flowHandling = '',
        addedInformation = '',
      } = values || {};

      if (
        part &&
        (!goal ||
          !goal.toLowerCase().trim().includes(part.toLowerCase().trim()))
      ) {
        toast.error(
          'Значение секции *Уникальная часть* не найдено внутри секции *Целевое действие*'
        );
        return;
      }

      const datas: Record<string, string> = {
        'Роль AI менеджера': aiRole,
        'Целевое действие': goal,
        'Описание компании': companyDescription,
        'Обработка сценариев': flowHandling,
        'Дополнительная информация': addedInformation,
      };
      for (const str of Object.keys(datas)) {
        const value = datas[str];

        if (/[?!]/.test(value)) {
          toast.error(`Поле "${str}" содержит недопустимые символы: ? или !`);
          return;
        }
      }

      const datas2: Record<string, string> = {
        'Дополнительный вопрос после первого автоответа': addedQuestion || '',
      };
      for (const str of Object.keys(datas2)) {
        const value = datas2[str];

        if (/[!.:]/.test(value)) {
          toast.error(
            `Поле "${str}" содержит недопустимые символы: !, : или .`
          );
          return;
        }
      }

      const datas3: Record<string, string> = {
        'Первый вопрос': secondMessagePrompt,
      };
      for (const str of Object.keys(datas3)) {
        const value = datas3[str];

        if (/[!:]/.test(value)) {
          toast.error(`Поле "${str}" содержит недопустимые символы: ! или :`);
          return;
        }
      }

      if (
        ![secondMessagePrompt, addedQuestion || '?'].every((e) =>
          e.includes('?')
        )
      ) {
        toast.error(`Не во всех вопросах есть знак "?" :)`);
        return;
      }

      onSubmitStartupWidget({ ...values, part: part.trim() });
    } catch {}
  };

  const database = (startupIdData ? startupIdData.database || [] : [])
    .map((line: string) => line.trim())
    .filter((line: string) => line !== '')
    .join('\n');

  return (
    <Drawer
      title={`${!startupIdData ? 'Создание' : 'Обновление'} запуска`}
      width={820}
      onClose={onCloseStartupWidgetDrawer}
      open={Boolean(startupId)}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      extra={
        <Space>
          <Button
            loading={startupIdLoading}
            onClick={onCloseStartupWidgetDrawer}
          >
            Отмена
          </Button>
          <Button
            loading={startupIdLoading}
            onClick={handleSubmit}
            type="primary"
          >
            {!startupIdData ? 'Создать' : 'Обновить'}
          </Button>
        </Space>
      }
    >
      <Spin spinning={startupIdLoading}>
        {!startupIdLoading && (
          <Form
            form={form}
            layout="vertical"
            initialValues={
              startupIdData
                ? {
                    messagesCount: 4,
                    //@ts-ignore
                    language: 'RUSSIAN',
                    //@ts-ignore
                    ...(startupIdData?.offer || {}),
                    ...startupIdData,
                    database,
                  }
                : {
                    database,
                    groupId: startupId,
                    language: 'RUSSIAN',
                    currentCount: 0,
                    messagesCount: 4,
                  }
            }
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
                    {
                      validator: (_, value) => {
                        const minValue = startupIdData?.currentCount ?? 0;
                        if (value !== undefined && value < minValue) {
                          return Promise.reject(
                            new Error(
                              `Текущее значение не может быть меньше, чем текущее значение отправок (${minValue})`
                            )
                          );
                        }
                        return Promise.resolve();
                      },
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
              <Col span={24}>
                <div
                  style={{
                    borderTop: '1px solid #f0f0f0',
                    marginBottom: '16px',
                  }}
                />
                <Space>
                  {startupIdData && (
                    <>
                      <Button onClick={onExportLeads}>Выгрузить "лидов"</Button>
                      <Button onClick={onExportSent}>
                        Выгрузить "успешных"
                      </Button>
                      <Button onClick={onExportUnsent}>
                        Выгрузить "ошибочных"
                      </Button>
                    </>
                  )}
                </Space>
                <div
                  style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }}
                />
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
                  rules={[
                    { required: true, message: 'Обязательное поле' },
                    {
                      validator: (_, value) => {
                        const invalidCharacters = value
                          .split('\n')
                          .filter((line: string) =>
                            /[^a-zA-Z0-9_+]/.test(line)
                          );
                        if (invalidCharacters.length > 0) {
                          return Promise.reject(
                            new Error(
                              `Некорректные юзернеймы: ${invalidCharacters.join(
                                ', '
                              )}. Проверьте, что в юзернеймах содержатся только английские буквы, цифры или символ подчеркивания (_). Каждый новый юзернейм должен находиться в отдельной строке.`
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
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
                  name="part"
                  label="Уникальная часть (ссылка на бота, сайт, etc)"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }

                        const forbiddenEndings = ['.', '?', ',', '!'];
                        const lastChar = value.trim().slice(-1);

                        if (forbiddenEndings.includes(lastChar)) {
                          return Promise.reject(
                            new Error(
                              'Значение не должно заканчиваться на ".", "?", "," или "!"'
                            )
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder="@aisenderOfficial_bot" />
                </Form.Item>
              </Col>
              {/* <Col span={24}>
                <Form.Item name="styleGuide" label="Стайл гайд">
                  <Input.TextArea
                    rows={1}
                    placeholder="Вы  - опытный коммунникатор ..."
                  />
                </Form.Item>
              </Col> */}

              <Col span={24}>
                <Form.Item name="flowHandling" label="Обработка сценариев">
                  <Input.TextArea rows={1} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="addedInformation"
                  label="Дополнительная информация (появляется на этапе целевого действия)"
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
                  rules={[
                    { required: true, message: 'Обязательное поле' },
                    {
                      validator: async (_, value) => {
                        try {
                          if (
                            startupId === '13529023516' ||
                            startupId === '15141603549-prefix-ukraine-documents'
                          ) {
                            return Promise.resolve();
                          }

                          await checkRandomString(value);
                        } catch (error) {
                          return Promise.reject(error);
                        }
                      },
                    },
                  ]}
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
                <Form.Item
                  name="addedQuestion"
                  label="Дополнительный вопрос после первого автоответа"
                  rules={[
                    {
                      validator: async (_, value) => {
                        try {
                          if (
                            startupId === '13529023516' ||
                            startupId === '15141603549-prefix-ukraine-documents'
                          ) {
                            return Promise.resolve();
                          }

                          await checkRandomString(value);
                        } catch (error) {
                          return Promise.reject(error);
                        }
                      },
                    },
                  ]}
                >
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
