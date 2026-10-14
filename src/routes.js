/** Client-side routes served by the included static Node server. */
export const HOME_PATH = '/';
export const GAME_PATHS = Object.freeze({III:'/gtaiii',VC:'/gtavc',SA:'/gtasa',IV:'/gtaiv',TLAD:'/tlad',TBOGT:'/tbogt'});
export function routeForGame(game) {
  if (!Object.hasOwn(GAME_PATHS,game)) throw new Error('Unsupported game route.');
  return GAME_PATHS[game];
}
export function gameForPath(pathname) {
  const normalized=pathname.replace(/\/+$/,'')||'/';
  return Object.entries(GAME_PATHS).find(([,path])=>path===normalized)?.[0]??null;
}
export function validRoute(pathname) {
  return (pathname.replace(/\/+$/,'')||'/')===HOME_PATH || gameForPath(pathname)!==null;
}
