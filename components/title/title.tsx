import { ReactNode } from 'react';
import cx from 'classnames';
import classes from './title.module.css';

interface TitleProps {
  children: ReactNode;
  className?: string;
}

export const Title = ({ children, className }: TitleProps) => {
  return <h1 className={cx(classes.title, className)}>{children}</h1>;
};
