
/**
 * Direction represents one, or more directions (a single, or multi direction)
 */
export enum Direction {
  Center    = 0b000_0_0_000,// 0
  Northwest = 0b100_0_0_000,// 128
  North     = 0b010_0_0_000,// 64
  Northeast = 0b001_0_0_000,// 32
  West      = 0b000_1_0_000,// 16
  East      = 0b000_0_1_000,// 8
  Southwest = 0b000_0_0_100,// 4
  South     = 0b000_0_0_010,// 2
  Southeast = 0b000_0_0_001,// 1
}
