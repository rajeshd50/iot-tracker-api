import { HttpStatus } from '@nestjs/common';

export interface ApiResponse {
  data?: any;
  message: string;
  statusCode: HttpStatus;
  error?: any;
  success: boolean;
}

export const ApiSuccessResponse = (
  data: any = {},
  message: string = 'success',
  statusCode: HttpStatus = HttpStatus.OK,
): ApiResponse => {
  return {
    statusCode,
    message,
    success: true,
    data: data || {},
  };
};

export const ApiErrorResponse = (
  error: any = {},
  message: string = 'error',
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
): ApiResponse => {
  return {
    statusCode,
    message,
    success: false,
    data: error || {},
  };
};
