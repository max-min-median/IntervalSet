const IntervalSet = require('./IntervalSet');
const Interval = IntervalSet.Interval;

let i1 = Interval.parse('[3, 10)');
let i2 = Interval.parse('(5, 20]');
let i3 = Interval.parse('(4, 5]');
let i4 = Interval.parse(']4, 5]');
let a = new IntervalSet('[3, 10)');
let b = new IntervalSet('(5, 20]');
let c = new IntervalSet('(4, 5]');
let d = new IntervalSet(']4, 5]');
let A = new IntervalSet('[3, 10)', [false, 12, 15, true], c);
console.log(Interval.parse('[3, 5)').merge(Interval.parse('[5, 7]')).toString() === '[3, 7]');
console.log(Interval.parse('[3, 5)').merge(Interval.parse('(5, 7]')) === null);
console.log(a.intersect(b).toString() === '(5, 10)');
console.log(a.subtract(c).toString() === '[3, 4] ∪ (5, 10)');
console.log(c.equals(d));
console.log(b.union(c).toString() === '(4, 20]');
let e = b.union(c); // (4, 20]
console.log(e.subtract(a).toString() === '[10, 20]');  // [10, 20]
console.log(new IntervalSet('[1, 20)').subtract(new IntervalSet('[3, 10]')).toString() === '[1, 3) ∪ (10, 20)');

console.log(new IntervalSet('[-4, -3 )', '[2 , 7)', '(2, 5]', [false, -5, -1, true]).toString() === '(-5, -1] ∪ [2, 7)');
console.log(new IntervalSet('(-inf, -10]', '[-10, -9)', '[-9, -8)', '[-8, -7]', '(-7, inf)').toString() === Interval.parse('(-inf, inf)').toString());
console.log(new IntervalSet('[1, 3]', '[2, 5]', '(3, 6]').toString() === '[1, 6]');

a = new IntervalSet('[-3, -2)', '[3, 7]');
b = new IntervalSet('[-5, -1]', '[0, 4]', '(6, 8)');
console.log(a.union(b).toString() === '[-5, -1] ∪ [0, 8)');
console.log(b.subtract(a).toString() === '[-5, -3) ∪ [-2, -1] ∪ [0, 3) ∪ (7, 8)');
console.log(a.complement().toString() === '(-∞, -3) ∪ [-2, 3) ∪ (7, ∞)');
console.log(a.intersect(b).toString() === '[-3, -2) ∪ [3, 4] ∪ (6, 7]');

// const a = Interval.parse('[5, 8)');
// // (' [ 0 , 10 ) ');
// const b = Interval.parse('[7.5, inf[');
// const c = a.intersect(b);
console.log(`Done`);