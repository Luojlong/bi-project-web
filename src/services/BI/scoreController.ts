/* eslint-disable */
import { request } from '@umijs/max';

/** checkIn POST /api/score/checkIn */
export async function checkInUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseString_>('/api/score/checkIn', {
    method: 'POST',
    ...(options || {}),
  });
}

/** getUserById GET /api/score/get */
export async function getUserByIdUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/score/get', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getUserById GET /api/score/getSign */
export async function getSignByIdUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseInt_>('/api/score/getSign', {
    method: 'GET',
    ...(options || {}),
  });
}
