import classes from './analysis-id__loading-page.module.css';

export const AnalysisIdLoadingPage = () => {
  return (
    <div className={classes.loadingContainer}>
      <div className={classes.loadingContent}>
        <div className={classes.spinner}>
          <div className={classes.dot}></div>
          <div className={classes.dot}></div>
          <div className={classes.dot}></div>
        </div>
        <h4 className={classes.title}>Загрузка данных по разбору</h4>
        <p className={classes.text}>
          Пожалуйста, подождите, мы получаем информацию...
        </p>
      </div>
    </div>
  );
};
