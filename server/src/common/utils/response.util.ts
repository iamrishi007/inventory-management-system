/* eslint-disable prettier/prettier */
import { ResponseInterface } from '../interfaces/response.interface';

export class ResponseUtil {
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): ResponseInterface<T> {
    return {
      success: true,
      message,
      data,
      statusCode,
    };
  }

  static error<T>(
    message: string = 'Error',
    statusCode: number = 400,
    data: T = null as T,
  ): ResponseInterface<T> {
    return {
      success: false,
      message,
      data,
      statusCode,
    };
  }
}


