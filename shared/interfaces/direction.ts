
/**
 * Direction represents one, or more directions (a single, or multi direction)
 */
export enum Direction {
  Center    = 0b000_0_0_000,
  Northwest = 0b100_0_0_000,
  North     = 0b010_0_0_000,
  Northeast = 0b001_0_0_000,
  West      = 0b000_1_0_000,
  East      = 0b000_0_1_000,
  Southwest = 0b000_0_0_100,
  South     = 0b000_0_0_010,
  Southeast = 0b000_0_0_001,
}
