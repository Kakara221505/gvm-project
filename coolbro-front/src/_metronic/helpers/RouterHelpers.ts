export function getCurrentUrl(pathname: string) {
  return pathname.split(/[?#]/)[0]
}

// function checkActive(url:string,tab:string) {
//   return url.includes(tab);
// }

export function checkIsActive(pathname: string, url: string) {
  const current = getCurrentUrl(pathname)
  if (!current || !url) {
    return false
  }

  if (current === url) {
    return true
  }

  if (current.indexOf(url) > -1) {
    return true
  }

  const management=url.split('/')[2]?url.split('/')[2]:url.split('/')[1]

  if (current.match(management)) {
    return current.match(management);
  }

  return false
}
