import Cookies from "js-cookie";

export const setToken = token => {
  Cookies.set("token", token);
};

export const getToken = () => {
  return Cookies.get("token");
};

export const removeToken = () => {
  Cookies.remove("token");
};

export const isLoggedIn = () => {
  return (
    getToken() !== "undefined" ||
    getToken() === process.env.REACT_APP_DEV_LOGIN_TOKEN
  );
};
