'use client';

import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

import { HeaderContainer } from '@/widgets/header/header.container';
import { StartupWidgetContainer } from '@/widgets/startup-widget/startup-widget.container';

import classes from './index.module.css';

const StartupPage: NextPage = () => {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const storedPassword = localStorage.getItem('startup');

    if (storedPassword !== "G_-N'j*5qzXgd^=8Y~wRem") {
      const enteredPassword = prompt(
        'Please enter the password to access the page:'
      );

      if (enteredPassword === "G_-N'j*5qzXgd^=8Y~wRem") {
        localStorage.setItem('startup', enteredPassword);
        setPassword(enteredPassword);
      } else {
        alert('Incorrect password. Access denied.');
      }
    } else {
      setPassword(storedPassword);
    }
  }, []);

  if (!password) {
    return null;
  }

  return (
    <main className={classes.main}>
      <HeaderContainer />
      <StartupWidgetContainer />
    </main>
  );
};

export default StartupPage;
