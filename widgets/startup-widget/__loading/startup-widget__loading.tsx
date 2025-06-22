import classes from './startup-widget__loading.module.css';

export const StartupWidgetLoading = () => {
  return (
    <div className={classes.loadingContainer}>
      <div className={classes.loadingContent}>
        <div className={classes.spinner}>
          <div className={classes.dot}></div>
          <div className={classes.dot}></div>
          <div className={classes.dot}></div>
        </div>
        <h4 className={classes.title}>Загрузка всех запусков</h4>
        <p className={classes.text}>
          Пожалуйста, подождите, мы получаем информацию...
        </p>
      </div>
    </div>
  );
};
