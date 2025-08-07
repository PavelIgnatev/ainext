import {
  AutoComplete,
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
  Tooltip,
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';

import { GroupId } from '@/@types/GroupId';
import { Crm } from '@/@types/Crm';

import styles from './startup-widget__drawer.module.css';

const { Option } = Select;

const getTimeInfo = (dateUpdated?: Date) => {
  if (!dateUpdated) {
    return { canManagePrefix: true, remainingMinutes: 0 };
  }

  const now = new Date();
  const updated = new Date(dateUpdated);
  const diffMs = now.getTime() - updated.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  const canManagePrefix = diffMinutes >= 60;
  const remainingMinutes = Math.max(0, 60 - diffMinutes);

  return { canManagePrefix, remainingMinutes };
};

interface StartupWidgetDrawerProps {
  loading: boolean;

  groupId: string;
  groupIdData: GroupId | null;
  groupIdDatabase: {
    users: string[];
    workingDatabase: string[];
  };
  crmData: Crm | null;

  showPrefixField: boolean;
  prefixes: string[];
  prefixesLoading: boolean;

  onCloseDrawer: () => void;
  onSumbitDrawer: ({
    data,
    database,
    crm,
  }: {
    data: GroupId;
    database: Array<string>;
    crm: Crm | null;
  }) => void;
  onShowPrefixField: () => void;
}

export const StartupWidgetDrawer = (props: StartupWidgetDrawerProps) => {
  const {
    groupId,
    loading,
    groupIdData,
    groupIdDatabase,
    crmData,
    showPrefixField,
    prefixes,
    prefixesLoading,
    onCloseDrawer,
    onSumbitDrawer,
    onShowPrefixField,
  } = props;

  const [hasChanges, setHasChanges] = useState(false);
  const [hasSelectedChanges, setHasSelectedChanges] = useState(false);
  const [selectedPrefix, setSelectedPrefix] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { canManagePrefix, remainingMinutes } = getTimeInfo(
    groupIdData?.dateUpdated
  );

  const initialValues = {
    ...groupIdData,
    groupId,
    database: groupIdDatabase.users.join('\n'),
    workingDatabase: groupIdDatabase.workingDatabase.join('\n'),
    language: groupIdData?.language || 'RUSSIAN',
    messagesCount: groupIdData?.messagesCount || 4,
    currentCount: groupIdData?.currentCount || 0,
    crmType: crmData?.type || 'none',
    crmWebhook: crmData?.webhook || '',
  };

  const trimValue = (value: any) => {
    return typeof value === 'string' ? value.trim() : value;
  };

  const checkForChanges = (_: any, allValues: any) => {
    if (!groupId || loading) return;

    const formHasChanges = Object.keys(allValues).some((key) => {
      if (key === 'workingDatabase') return false;
      const currentValue = trimValue(allValues[key]);
      const initialValue = trimValue((initialValues as any)[key]);
      return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
    });

    setHasChanges(formHasChanges);
    setHasSelectedChanges(
      !!selectedPrefix || (groupId.includes('prefix') ? showPrefixField : false)
    );
  };

  useEffect(() => {
    if (!groupId || loading) return;
    const formValues = form.getFieldsValue();
    checkForChanges(null, formValues);
  }, [selectedPrefix, showPrefixField, groupId, loading]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notification.success({
        message: 'Скопировано',
        description: 'Ссылка скопирована в буфер обмена',
      });
    } catch (error) {
      notification.error({
        message: 'Ошибка копирования',
        description: 'Не удалось скопировать ссылку',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: GroupId = {
        groupId: trimValue(values.groupId),
        newGroupId: hasSelectedChanges
          ? selectedPrefix
            ? `${trimValue(values.groupId)}-prefix-${selectedPrefix}`
            : trimValue(values.groupId.replace(/-prefix-.*$/, ''))
          : trimValue(values.groupId),
        name: trimValue(values.name),
        target: Number(values.target),
        currentCount: Number(values.currentCount),
        messagesCount: Number(values.messagesCount),
        language: trimValue(values.language),
        aiRole: trimValue(values.aiRole),
        companyDescription: trimValue(values.companyDescription),
        goal: trimValue(values.goal),
        leadDefinition: trimValue(values.leadDefinition),
        leadGoal: trimValue(values.leadGoal),
        firstMessagePrompt: trimValue(values.firstMessagePrompt),
        secondMessagePrompt: trimValue(values.secondMessagePrompt),
        part: trimValue(values.part) || null,
        flowHandling: trimValue(values.flowHandling) || null,
        addedInformation: trimValue(values.addedInformation) || null,
        addedQuestion: trimValue(values.addedQuestion) || null,
      };

      const database = trimValue(values.database)
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);

      const crm: Crm | null =
        values.crmType === 'none' || !values.crmType
          ? null
          : {
              groupId: trimValue(values.groupId),
              type: trimValue(values.crmType),
              webhook: trimValue(values.crmWebhook) || '',
            };

      onSumbitDrawer({ data, database, crm });
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
          {!showPrefixField && (
            <Tooltip
              title={
                !canManagePrefix && !loading
                  ? `Управление префиксом доступно через ${remainingMinutes} мин. Остановите запуск (если еще не остановлен) и подождите.`
                  : ''
              }
            >
              <Button
                loading={loading}
                disabled={loading || !canManagePrefix}
                onClick={onShowPrefixField}
                type="primary"
              >
                {loading
                  ? ''
                  : groupId.includes('prefix')
                    ? 'Убрать из под префикса'
                    : 'Поставить под префикс'}
              </Button>
            </Tooltip>
          )}
          <Button
            loading={loading}
            disabled={!hasChanges && !loading}
            onClick={handleSubmit}
            type="primary"
          >
            {loading ? '' : !groupIdData ? 'Создать' : 'Обновить'}
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading || prefixesLoading} style={{ marginTop: '50px' }}>
        {!loading && groupId && (
          <Form
            form={form}
            layout="vertical"
            onValuesChange={checkForChanges}
            initialValues={initialValues}
          >
            <div className={styles.identifiersSectionTitle}>
              ПАРАМЕТРЫ ЗАПУСКА
            </div>
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
            {showPrefixField && (
              <Row gutter={16}>
                <Col span={24}>
                  {groupId.includes('prefix') ? (
                    <Form.Item label="Новый идентификатор">
                      <Input
                        disabled
                        value={groupId.replace(/-prefix-.*$/, '')}
                      />
                    </Form.Item>
                  ) : (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Новый идентификатор">
                          <Input
                            disabled
                            value={
                              selectedPrefix
                                ? `${groupId}-prefix-${selectedPrefix}`
                                : groupId
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="prefixInput"
                          label="Выберите или введите префикс"
                        >
                          <AutoComplete
                            placeholder="Выберите или введите префикс"
                            allowClear
                            style={{
                              transition: 'none',
                            }}
                            classNames={{
                              popup: {
                                root: 'no-transition',
                              },
                            }}
                            onChange={(value) => {
                              setSelectedPrefix(value || null);
                            }}
                            options={prefixes
                              .sort((a, b) => a.localeCompare(b))
                              .map((prefix) => ({
                                value: prefix,
                                label: prefix,
                              }))}
                            filterOption={(input, option) =>
                              option?.label
                                ?.toLowerCase()
                                .includes(input.toLowerCase()) ?? false
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
            )}
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

            <div className={styles.crmSectionTitle}>CRM</div>
            {groupIdData && groupIdData.googleTableCrmId && (
              <>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="googleTableCrmId"
                      label={
                        <div>
                          <div>Ссылка на Google Sheets</div>
                          <div
                            style={{
                              color: '#8c8c8c',
                              fontSize: '11px',
                              fontWeight: 'normal',
                              fontStyle: 'italic',
                              marginTop: '2px',
                              fontFamily: 'monospace',
                            }}
                          >
                            📊 Лиды будут появляться в реальном времени с
                            возможностью просмотра всех или по месяцам для
                            удобной работы
                          </div>
                        </div>
                      }
                      style={{ marginBottom: '12px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Input
                          disabled
                          value={`https://docs.google.com/spreadsheets/d/${groupIdData.googleTableCrmId}`}
                          style={{ flex: 1 }}
                        />
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={() =>
                            handleCopyToClipboard(
                              `https://docs.google.com/spreadsheets/d/${groupIdData.googleTableCrmId}`
                            )
                          }
                          className={styles.copyButton}
                        />
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="crmType"
                  label="Тип интеграции"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <Select placeholder="Выберите тип интеграции">
                    <Option value="bitrix">Bitrix24</Option>
                    <Option value="amo">АмоCRM</Option>
                    <Option value="api">Custom API</Option>
                    <Option value="none">Отсутствует</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) => prev.crmType !== curr.crmType}
              style={{ marginBottom: '12px' }}
            >
              {({ getFieldValue }) => {
                const crmType = getFieldValue('crmType');
                return crmType && crmType !== 'none' ? (
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="crmWebhook"
                        label="Webhook URL"
                        rules={[
                          { required: true, message: 'Введите webhook URL' },
                          { type: 'url', message: 'Введите корректный URL' },
                        ]}
                      >
                        <Input
                          placeholder={
                            crmType === 'amo'
                              ? 'https://yoursubdomain.amocrm.ru/api/v4/webhooks/...'
                              : crmType === 'bitrix'
                                ? 'https://your-portal.bitrix24.ru/rest/...'
                                : 'https://your-domain.com/api/webhook'
                          }
                          style={{
                            borderRadius: '6px',
                            border: '1px solid #d9d9d9',
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null;
              }}
            </Form.Item>

            <div className={styles.identifiersSectionTitle}>БАЗА ДАННЫХ</div>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Основная база данных"
                  name="database"
                  rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                  <Input.TextArea rows={6} />
                </Form.Item>
              </Col>
            </Row>

            {groupIdDatabase.workingDatabase.length > 0 && (
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                          }}
                        >
                          <span style={{ color: '#1890ff' }}>⚙️</span>
                          Замороженная база{' '}
                          <span
                            style={{
                              color:
                                groupIdDatabase.workingDatabase.length > 300
                                  ? '#ff4d4f'
                                  : '#faad14',
                              backgroundColor:
                                groupIdDatabase.workingDatabase.length > 300
                                  ? '#fff2f0'
                                  : '#fff7e6',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}
                          >
                            (в работе: {groupIdDatabase.workingDatabase.length})
                          </span>
                        </div>
                        <div
                          style={{
                            color:
                              groupIdDatabase.workingDatabase.length > 300
                                ? '#ff4d4f'
                                : '#8c8c8c',
                            fontSize: '11px',
                            fontWeight: 'normal',
                            fontStyle: 'italic',
                            marginTop: '2px',
                            fontFamily: 'monospace',
                          }}
                        >
                          🔧 Техническое поле. Замороженные пользователи со
                          статусом "в работе". При обновлении данных эти
                          пользователи останутся неизменными. Данное поле не
                          влияет на функциональность и используется только для
                          внутреннего отслеживания.
                          {groupIdDatabase.workingDatabase.length > 300 && (
                            <span
                              style={{ color: '#ff4d4f', fontWeight: 'bold' }}
                            >
                              {' '}
                              ⚠️ Внимание: большое количество пользователей в
                              работе может указывать на проблемы с обработкой.
                            </span>
                          )}
                        </div>
                      </div>
                    }
                    name="workingDatabase"
                  >
                    <Input.TextArea
                      rows={6}
                      disabled
                      style={{
                        backgroundColor: '#f5f5f5',
                        cursor: 'not-allowed',
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <div className={styles.identifiersSectionTitle}>
              КОНФИГУРАЦИЯ AI
            </div>
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
                  <Input.TextArea
                    rows={1}
                    placeholder="В случае, если .. то .."
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="addedInformation"
                  label="Дополнительная информация"
                >
                  <Input.TextArea
                    rows={1}
                    placeholder="Обьемное описание рода деятельности компании"
                  />
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
