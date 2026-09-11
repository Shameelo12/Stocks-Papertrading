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

/**
 * Pulls a human-readable message out of a failed request.
 *
 * The API returns ErrorResponse ({ status, error, message, ... }), where `message`
 * is the sentence meant for a person and `error` is the category ("Bad Request").
 * Reading `error` shows the reader "Bad Request" instead of "Insufficient
 * balance. Required: $450.00, Available: $120.00", so `message` wins.
 *
 * @param {unknown} err     the thrown Axios error
 * @param {string} fallback shown when the server sent nothing usable
 */
export const apiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (!data) return fallback;

  // Validation failures carry a generic message ("Input validation failed") and
  // put the per-field detail in `details`. Showing the generic line alone tells
  // the reader nothing about which field to fix.
  if (data.details) return data.details;

  return data.message || data.error || fallback;
};

export default API;
