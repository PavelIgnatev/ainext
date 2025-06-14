'use client';

import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

import { AnalysisCreateContainer } from '@/widgets/analysis-create/analysis-create.container';
import { AnalysisLastContainer } from '@/widgets/analysis-last/analysis-last.containter';
import { HeaderContainer } from '@/widgets/header/header.container';

import classes from './index.module.css';

const AnalysisCreatePage: NextPage = () => {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const storedPassword = localStorage.getItem('password');

    if (storedPassword !== "G_-N'j*5qzXgd^=8Y~wRem") {
      const enteredPassword = prompt(
        'Please enter the password to access the page:'
      );

      if (enteredPassword === "G_-N'j*5qzXgd^=8Y~wRem") {
        localStorage.setItem('password', enteredPassword);
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
      <div className={classes.content}>
        <AnalysisCreateContainer />
        <AnalysisLastContainer />
      </div>
    </main>
  );
};

export default AnalysisCreatePage;
