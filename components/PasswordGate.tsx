'use client';
import { useEffect, useState } from 'react';

const PASSWORD = "G_-N'j*5qzXgd^=8Y~wRem";

export const PasswordGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const storedPassword = localStorage.getItem('startup');
    if (storedPassword !== PASSWORD) {
      const enteredPassword = prompt(
        'Please enter the password to access the page:'
      );
      if (enteredPassword === PASSWORD) {
        localStorage.setItem('startup', enteredPassword);
        setPassword(enteredPassword);
      } else {
        alert('Incorrect password. Access denied.');
      }
    } else {
      setPassword(storedPassword);
    }
  }, []);

  if (!password) return null;

  return <>{children}</>;
};
