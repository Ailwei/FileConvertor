export const setCookie = (name, value, options = {}) => {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
    if (options.expires instanceof Date) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    if (options.secure) {
      cookieString += `; secure`;
    }
    if (options.httpOnly) {
      cookieString += `; HttpOnly`;
    }
  
    document.cookie = cookieString;
  };
  
  // Function to get a cookie by name
  export const getCookie = (name) => {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  
    if (cookie) {
      return decodeURIComponent(cookie.split('=')[1]);
    }
  
    return null;
  };