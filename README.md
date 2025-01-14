# __class IntervalSet__
An IntervalSet class I wrote to assist in solving [AOC 2022 #15](https://adventofcode.com/2022/day/15).
And revised while solving [AOC 2016 #20](https://adventofcode.com/2016/day/20) :D

## Installation
`const IntervalSet = require ('./IntervalSet');`

## Interval class

| Method | Description |
| -----: | ----------- |
| (static) `parse(str, throws=true)` | Parses a string (e.g `'(3, 4]'`) into an Interval |
| `isValid()` | Returns `true` if the Interval is valid |
| `overlap(other)` | Finds the intersection (A∩B) of two Intervals |
| `merge(other)` | Finds the union (A∪B) of two Intervals |
| `remove(other)` | Returns an array of 2 Intervals obtained by subtracting `other` from `this` |
| `equals(other)` | Checks if two Intervals are identical |
| `toArray()` | Returns an array representation of the Interval |
| `toString()` | Returns a string representation of the Interval in interval notation |
| `toInequality()` | Returns a string representation of the Interval as inequalities |

## IntervalSet class

| Method | Description |
| -----: | ----------- |
| `toArray()` | Returns an array representation of the IntervalSet |
| `union(b)` | Finds the union (A∪B) of two IntervalSets |
| `intersect(b)` | Finds the intersection (A∩B) of two IntervalSets |
| `complement()` | Finds the real complement (A') of an IntervalSet |
| `subtract(b)` | Finds the subtraction (A\B) of two IntervalSets |
| `toString()` | Returns a string representation of the IntervalSet in interval notation |
| `toInequality()` | Returns a string representation of the IntervalSet as inequalities |
