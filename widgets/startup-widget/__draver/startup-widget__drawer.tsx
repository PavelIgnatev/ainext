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

import { checkRandomString } from '../../../utils/checkRandomString';
import { GroupId } from '@/@types/GroupId';

const { Option } = Select;

const EXCLUDED_GROUP_IDS = [
  '13529023516',
  '15141603549-prefix-ukraine-documents',
];

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

  const validateField = (
    value: string | undefined | null,
    fieldName: string,
    pattern: RegExp,
    errorMessage: string
  ): boolean => {
    if (!value) return true;
    if (pattern.test(value)) {
      notification.error({
        message: `Ошибка в поле "${fieldName}"`,
        description: errorMessage,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const {
        groupId,
        name,
        target,
        currentCount,
        messagesCount,
        language,
        aiRole,
        goal,
        part,
        secondMessagePrompt,
        addedQuestion,
        companyDescription,
        flowHandling,
        addedInformation,
        firstMessagePrompt,
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
          value: flowHandling,
          name: 'Обработка сценариев',
          pattern: /[?!]/,
          message: 'Поле содержит недопустимые символы: ? или !',
        },
        {
          value: addedInformation,
          name: 'Дополнительная информация',
          pattern: /[?!]/,
          message: 'Поле содержит недопустимые символы: ? или !',
        },
        {
          value: firstMessagePrompt,
          name: 'Первое приветствие',
          pattern: /[?:]/,
          message: 'Поле содержит недопустимые символы: ? или :',
        },
        {
          value: secondMessagePrompt,
          name: 'Первый вопрос',
          pattern: /[!:]/,
          message: 'Поле содержит недопустимые символы: ! или :',
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
        { value: secondMessagePrompt, name: 'Первый вопрос' },
        ...(addedQuestion
          ? [{ value: addedQuestion, name: 'Дополнительный вопрос' }]
          : []),
      ];

      const questionsWithoutMark = questions
        .filter(({ value }) => !value.includes('?'))
        .map(({ name }) => name);

      if (questionsWithoutMark.length > 0) {
        notification.error({
          message: 'Отсутствует знак "?"',
          description: `Добавьте знак "?" в следующих вопросах: ${questionsWithoutMark.join(', ')}`,
        });
        return;
      }

      const numericFields = {
        'Целевое значение отправок': target,
        'Текущее значение отправок': currentCount,
        'Количество сообщений': messagesCount,
      };

      const invalidNumericFields = Object.entries(numericFields)
        .filter(([_, value]) => isNaN(Number(value)) || Number(value) < 0)
        .map(([fieldName]) => fieldName);

      if (invalidNumericFields.length > 0) {
        notification.error({
          message: 'Некорректные числовые значения',
          description: `Следующие поля должны быть положительными числами: ${invalidNumericFields.join(', ')}`,
        });
        return;
      }

      if (!['ENGLISH', 'RUSSIAN', 'UKRAINIAN'].includes(language)) {
        notification.error({
          message: 'Ошибка в поле "Язык"',
          description:
            'Выберите корректный язык: ENGLISH, RUSSIAN или UKRAINIAN',
        });
        return;
      }

      const data: GroupId = {
        groupId,
        name,
        target: Number(target),
        currentCount: Number(currentCount),
        messagesCount: Number(messagesCount),
        language,
        aiRole,
        companyDescription,
        goal,
        firstMessagePrompt,
        secondMessagePrompt,
        part: part?.trim() || null,
        flowHandling: flowHandling?.trim() || null,
        addedInformation: addedInformation?.trim() || null,
        addedQuestion: addedQuestion?.trim() || null,
        dateUpdated: new Date(),
      };

      onSumbitDrawer({ data, database: values.database.split('\n') });
    } catch {
      notification.error({
        message: 'Ошибка в полях',
        description: 'Проверьте правильность заполнения всех полей',
      });
    }
  };

  return (
    <Drawer
      title={`${!groupIdData ? 'Создание' : 'Обновление'} запуска`}
      width={820}
      onClose={onCloseDrawer}
      open={Boolean(groupId)}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      extra={
        <Space>
          <Button loading={loading} onClick={handleSubmit} type="primary">
            {!groupIdData ? 'Создать' : 'Обновить'}
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
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
                    {
                      validator: (_, value) => {
                        const minValue = groupIdData?.currentCount ?? 0;
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
                        const lines = value
                          .split('\n')
                          .map((line: string) => line.trim())
                          .filter(Boolean);
                        const invalidCharacters = lines.filter((line: string) =>
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
                          if (EXCLUDED_GROUP_IDS.includes(groupId)) {
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
                  label="Дополнительный вопрос"
                  rules={[
                    {
                      validator: async (_, value) => {
                        try {
                          if (EXCLUDED_GROUP_IDS.includes(groupId)) {
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
