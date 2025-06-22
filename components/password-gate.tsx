'use client';
import { checkAdmin } from '@/actions/admin/checkAdmin';
import { validateAdminPassword } from '@/actions/admin/validateAdminPassword';
import { useEffect, useState } from 'react';

export const PasswordGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const main = async () => {
      const isAdmin = await checkAdmin();

      if (isAdmin) {
        setIsAdmin(true);
      } else {
        const enteredPassword = prompt(
          'Пожалуйста, введите пароль для доступа к странице:'
        );

        const isValid = await validateAdminPassword(String(enteredPassword));

        if (isValid) {
          setIsAdmin(true);
        } else {
          alert('Неверный пароль. Доступ запрещен.');
        }
      }
    };

    main();
  }, []);

  if (!isAdmin) return null;

  return <>{children}</>;
};
