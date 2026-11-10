/* Logical terminal sizes; display adapter only, not simulation parameters. */
export const TERMINAL_SIZES = Object.freeze({
  '120x36': Object.freeze({cols:120,rows:36}),
  '160x48': Object.freeze({cols:160,rows:48}),
  '200x60': Object.freeze({cols:200,rows:60})
});
export const DEFAULT_SIZE = '160x48';
export function terminalSize(value){return TERMINAL_SIZES[value]??TERMINAL_SIZES[DEFAULT_SIZE];}
