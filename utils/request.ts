export const handleResponse = async (response: Response): Promise<any> => {
  const data = await response.json();
  if (!response.ok) {
    console.error('API Error:', data);
    let errorMessage = 'An error occurred';

    if (data.detail) {
      errorMessage = Array.isArray(data.detail) 
        ? data.detail.map((error: { msg: string }) => error.msg).join(', ')
        : data.detail;
    }

    throw new Error(errorMessage);
  }

  console.log('API Response:', data);
  return data;
};
