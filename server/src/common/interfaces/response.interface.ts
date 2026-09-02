/* eslint-disable prettier/prettier */
export interface ResponseInterface<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}


