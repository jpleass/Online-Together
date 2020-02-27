export const map = ( x, oldMin, oldMax, newMin, newMax ) => (
  newMin + ( x - oldMin ) / ( oldMax - oldMin ) * ( newMax - newMin )
)
export const lerp = ( a, b, t ) => a + ( b - a ) * t;