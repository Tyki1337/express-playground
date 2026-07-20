import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client.js"

export class AppError extends Error{
 public statusCode: number;
 constructor(message = "Server error", statusCode = 500){
  super(message)
  this.name = "AppError"
  this.statusCode = statusCode
  Object.setPrototypeOf(this, AppError.prototype)
 }
}

export const getErrorMessage = (err: unknown): string =>{
  if(err instanceof Error) return err.message
  else return "Unknown error"
}

const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2002: {
    status: 409,
    message: 'Такая запись уже существует (нарушение уникального ключа).',
  },
  P2025: {
    status: 404,
    message: 'Запись для обновления или удаления не найдена.',
  },
  P2003: {
    status: 400,
    message: 'Ошибка внешнего ключа (связанная запись не существует).',
  },
  P2000: {
    status: 400,
    message: 'Введенное значение слишком длинное для этого поля.',
  },
  // Сюда можно дописывать любые коды Prisma по мере необходимости
};

export class PrismaAppError extends AppError {
  constructor(prismaError: PrismaClientKnownRequestError) {
    // Ищем код в нашей карте, если кода нет — отдаем 500
    const errorConfig = PRISMA_ERROR_MAP[prismaError.code] || {
      status: 500,
      message: `Внутренняя ошибка базы данных (Код: ${prismaError.code})`,
    };
    super(errorConfig.message, errorConfig.status);
    
    this.name = 'PrismaAppError';
  }

  // Статический метод-чекер для удобной фильтрации
  static from(err: unknown): AppError {
    if (err instanceof PrismaClientKnownRequestError) {
      return new PrismaAppError(err);
    }
    if(err instanceof AppError){
      return err
    }
    return new AppError(getErrorMessage(err), 500);
  }
}