import { AppError as AppErrorType } from '#/utils/errorRelated.js'

declare global {
  var AppError: typeof AppErrorType
}

global.AppError = AppError