import { notification } from 'antd';
import { useCallback } from 'react';

export const useNotifications = () => {
  const [api, contextHolder] = notification.useNotification();

  const showError = useCallback(
    (description: string) => {
      api.error({
        message: 'Произошла ошибка',
        description,
        duration: 5,
      });
    },
    [api]
  );

  const showSuccess = useCallback(
    (description: string) => {
      api.success({
        message: 'Успешно',
        description,
        duration: 3,
      });
    },
    [api]
  );

  return {
    contextHolder,
    showError,
    showSuccess,
  };
};
