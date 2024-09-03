"use server";
import { cookies } from 'next/headers';
import { setCookie } from 'cookies-next';
import { handleResponse } from '@/utils/request';

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
  };


function extractCookieValues(cookieString: string): Record<string, string> {
    
    const regex = /(?:[\s;]|^)(username|identicon|ra_token_verification)[^=]*=([^;]*)/g;
    const cookies: Record<string, string> = {};
    let match: RegExpExecArray | null;
  
    while ((match = regex.exec(cookieString)) !== null) {
        console.log(match)
        const [_, name, value] = match;

        cookies[name] = value.trim(); // Trim leading and trailing whitespace
    }
  
    return cookies;
  }
  
  
  // Helper function to handle API errors
  export const handleApiError = (error: unknown, fallbackMessage: string): ApiResponse<never> => {
    console.error(fallbackMessage, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : fallbackMessage
    };
  };
  
  // Helper function to make API calls
  export const apiCall = async <T>(
    url: string,
    method: string,
    headers: Record<string, string>,
    cache? : RequestCache,
    body?: BodyInit
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        cache: cache || "no-store",
        credentials: 'include', 
      });
      
      if (response.headers.getSetCookie()) {
        response.headers.getSetCookie().forEach((cookie) => {
          const cookieData = extractCookieValues(cookie);
          Object.entries(cookieData).forEach(([name, value]) => {
            setCookie(name, value, { cookies });
          });
        });
      }
  
      const result = await handleResponse(response);
  
      if (!response.ok) {
        throw new Error(result.detail || 'API call failed');
      }
  
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error, 'API call failed');
    }
  };