export function getDocumentHref(url: string) {
  return (window.shared?.general ?? window).getDocumentHref!(url);
}

export function hh_ajax(params: any, callback?: any, err_callback?: any) {
  return (window.shared?.general ?? window).hh_ajax!(
    params,
    callback,
    err_callback
  );
}

export function getLoadingAnimation() {
  return (window.shared?.animations ?? window).loadingAnimation!;
}

export function getHeroImpl() {
  return (window.shared ?? window).Hero!;
}
