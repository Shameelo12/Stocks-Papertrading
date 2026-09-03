import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export const clearAxiosAuth = () => {
  delete API.defaults.headers.common.Authorization;
};

/**
 * Unwraps a list response body.
 *
 * Paginated endpoints return { data, offset, limit, total, totalPages, hasMore };
 * unpaginated ones return a bare array. Accepting both keeps callers working
 * whichever shape an endpoint uses.
 */
export const unwrapList = (body) => {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.data)) return body.data;
  return [];
};

export default API;
