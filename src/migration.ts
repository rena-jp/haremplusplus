import { GirlSalaryManager } from './data/game-data';

export function getDocumentHref(url: string) {
  return (window.shared?.general ?? window)?.getDocumentHref?.(url) as string;
}

export function getGirlConstructor() {
  return window.Girl ?? window.shared?.Girl;
}

export function getGirlSalaryManager() {
  return (window.shared ?? window).GirlSalaryManager as GirlSalaryManager;
}

export function hh_ajax(params: any, callback?: any, err_callback?: any) {
  return (window.shared?.general ?? window).hh_ajax(
    params,
    callback,
    err_callback
  );
}

export function getLoadingAnimation() {
  return (window.shared?.animations ?? window).loadingAnimation;
}
