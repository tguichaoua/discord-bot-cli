/* eslint-disable @typescript-eslint/ban-types */
// https://gist.github.com/navix/6c25c15e0a2d3cd0e5bce999e0086fc9
/** @ignore @see https://gist.github.com/navix/6c25c15e0a2d3cd0e5bce999e0086fc9 */
export type DeepPartial<T> = T extends Function ? T : T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
