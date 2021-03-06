// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString =
    typeof str === 'undefined' ? sessionStorage.getItem('authority') : str;
    // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    authority = JSON.parse(authorityString);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  // return ['TEA']
  return authority ||['guest'];
}

export function setAuthority(authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return sessionStorage.setItem('authority', JSON.stringify(proAuthority));
}
export function setUserId(id) {
  // return 123

  return sessionStorage.setItem('userId', JSON.stringify(id));
}
export function getUserId() {
  return sessionStorage.getItem('userId');
}
export function setUserInfo(info) {
  // return 123

  return sessionStorage.setItem('userInfo', JSON.stringify(info || {}));
}
export function getUserInfo() {
  return JSON.parse(sessionStorage.getItem('userInfo') || {});
}