/**
 * Обернутые Server Actions для анализа с глобальной обработкой ошибок
 * Используй эти версии вместо прямых вызовов из actions/db/analysis
 */

import { withErrorHandling } from '@/utils/errorHandler';
import * as originalActions from './db/analysis';

// Оборачиваем все Server Actions в обработчик ошибок
export const getAnalysis = withErrorHandling(originalActions.getAnalysis);
export const getAnalysisById = withErrorHandling(
  originalActions.getAnalysisById
);
export const updateAnalysis = withErrorHandling(originalActions.updateAnalysis);
