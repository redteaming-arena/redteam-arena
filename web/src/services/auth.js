import Cookies from "js-cookie";
import { jwtVerify } from 'jose';

export const setToken = token => {
  Cookies.set("token", token);
};

export const getToken = () => {
  return Cookies.get("token");
};

export const removeToken = () => {
  Cookies.remove("token");
};

export const isLoggedIn = async () => {
  try {

    const token = getToken();
    if (!token) {
      return false;
    } else if (process.env.REACT_APP_DEV_LOGIN_TOKEN === token){
      return false;
    }

    // Convert the secret key to Uint8Array
    const secretKey = new TextEncoder().encode(process.env.REACT_APP_SECRET_KEY);

    // Decode and verify the token
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [process.env.REACT_APP_ALGORITHM] // Specify the algorithm used for encoding
    });
    // TODO: check if token has expired and token owner matches state
    // ...
    console.log("Token is valid", payload);
    return true;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};
