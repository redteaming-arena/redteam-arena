'use server';

import { cookies } from 'next/headers';
import { apiCall, ApiResponse } from './utils';


type ValidationResponse = {
  success: boolean;
  message: string;
};

type LoginResponse = {
  access_token: string;
};

type RegisterResponse = {
  message: string;
};


export async function validateEmail(email: string): Promise<ApiResponse<ValidationResponse>> {
  return apiCall<ValidationResponse>(
    `${process.env.BASE_URL}/api/validate?email=${encodeURIComponent(email)}`,
    'GET',
    { 'Content-Type': 'application/json' }
  );
}

export async function handleLogin(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  const result = await apiCall<LoginResponse>(
    `${process.env.BASE_URL}/api/login`,
    'POST',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    "no-store",
    new URLSearchParams({ username: email, password })
  );

  return result;
}

export async function handleRegister(email: string): Promise<ApiResponse<RegisterResponse>> {
  return apiCall<RegisterResponse>(
    `${process.env.BASE_URL}/api/email/registration?email=${encodeURIComponent(email)}`,
    'POST',
    { 'Content-Type': 'application/json' }
  );
}

export async function registerUser(username: string, password: string, token: string): Promise<ApiResponse<LoginResponse>> {
  const result = await apiCall<LoginResponse>(
    `${process.env.BASE_URL}/api/user/registration`,
    'POST',
    {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    "no-store",
    JSON.stringify({ username, password })
  );

  if (result.success && result.data?.access_token) {
    cookies().set("ra_token_verification", result.data.access_token);
  }

  return result;
}

export async function handleLogout(): Promise<ApiResponse<{ message: string }>> {
  return apiCall<{ message: string }>(
    `${process.env.BASE_URL}/api/logout`,
    'POST',
    {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cookies().get("ra_token_verification")?.value || ''}`
    }
  );
}