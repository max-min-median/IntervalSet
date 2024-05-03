# __class IntervalSet__
An IntervalSet class I wrote to assist in solving [AOC 2022 #15](https://adventofcode.com/2022/day/15).

## Installation
`const { Interval, IntervalSet } = require ('./IntervalSet');`

## Interval class

| Method | Description |
| -----: | ----------- |
| (static) `parse(string)` | Parses a string (e.g `'(3, 4]'`) into an Interval |
| `validate()` | Validates an Interval. Returns `null` if invalid |
| `set(...params)` | Manually set the values of an Interval |
| `intersect(b)` | Finds the intersection (A∩B) of two Intervals |
| `union(b)` | Finds the union (A∪B) of two Intervals |
| `subtract(b)` | Finds the subtraction (A\B) of two Intervals |
| `equals(b)` | Checks if two Intervals are identical |
| `toString()` | Returns a string representation of the Interval in interval notation |
| `toInequality()` | Returns a string representation of the Interval as inequalities |

## IntervalSet class

| Method | Description |
| -----: | ----------- |
| `union(b)` | Finds the union (A∪B) of two IntervalSets |
| `intersect(b)` | Finds the intersection (A∩B) of two IntervalSets |
| `complement()` | Finds the real complement (A') of an IntervalSet |
| `subtract(b)` | Finds the subtraction (A\B) of two IntervalSets |
| `toString()` | Returns a string representation of the IntervalSet in interval notation |
| `toInequality()` | Returns a string representation of the IntervalSet as inequalities |
