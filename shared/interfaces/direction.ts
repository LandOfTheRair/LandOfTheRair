
/**
 * Direction represents one, or more directions (a single, or multi direction)
 * Center represents a lack of direction
 */
export enum Direction {
  // Individual Flags
  Center    = 0b000_0_0_000, // 0
  Northwest = 0b100_0_0_000, // 128
  North     = 0b010_0_0_000, // 64
  Northeast = 0b001_0_0_000, // 32
  West      = 0b000_1_0_000, // 16
  East      = 0b000_0_1_000, // 8
  Southwest = 0b000_0_0_100, // 4
  South     = 0b000_0_0_010, // 2
  Southeast = 0b000_0_0_001, // 1

  // Premade combinations for convenience
  All           = 0b111_1_1_111, // 255
  Cardinals     = 0b010_1_1_010, // 90
  Diagonals     = 0b101_0_0_101, // 165
  NorthAndSouth = 0b010_0_0_010, // 66
  WestAndEast   = 0b000_1_1_000, // 24
  WestAndNorth  = 0b010_1_0_000, // 80
  WestAndSouth  = 0b000_1_0_010, // 18
  EastAndNorth  = 0b010_0_1_000, // 72
  EastAndSouth  = 0b000_0_1_010, // 10
}
