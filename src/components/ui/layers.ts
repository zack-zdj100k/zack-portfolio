// Stacked screens that switch without a blank frame: the active layer fades in on top, and the last
// fully shown layer stays opaque underneath until that fade has finished (then it becomes "shown").

export function layerClass(i: number, active: number, shown: number) {
  if (i === active) return "z-20 opacity-100 transition-opacity duration-300 ease-out";
  if (i === shown) return "z-10 opacity-100";
  return "pointer-events-none z-0 opacity-0";
}
