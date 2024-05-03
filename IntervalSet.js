class IntervalSet {
  #intervals = [];
  
  constructor(...intervals) {
    let errorIntervals = [];
    for (const interval of intervals) {
      const parsed = Interval.parse(interval);
      if (parsed === null) errorIntervals.push(typeof interval === 'string' ? `'${interval}'` : `[${interval.join(', ')}]`); else this.#intervals.push(parsed);
    }
    if (errorIntervals.length) console.log('Error parsing some intervals:', errorIntervals.join(', '));
    this.#intervals.sort(IntervalSet.sortFn);
    for (let i = 0; i < this.#intervals.length - 1; i++) {
      const u = this.#intervals[i].union(this.#intervals[i+1]);
      if (u) this.#intervals.splice(i--, 2, u);
    }
  }

  get copy() {return this.#intervals.map(x => [...x]);}
  get list() {return this.#intervals;}
  
  /** Finds the union (A∪B) of two IntervalSets.
   *  @param {IntervalSet} b - an IntervalSet to union with.
   *  @returns {IntervalSet} the union of the IntervalSets.
   */
  union(b) {
    return new IntervalSet(...this.#intervals, ...b.list);
  }
  
  /** Finds the intersection (A∩B) of two IntervalSets.
   *  @param {IntervalSet} b - an IntervalSet to intersect with.
   *  @returns {IntervalSet} the intersection of the IntervalSets.
   */
  intersect(b) {
    const result = [], a = this.#intervals;
    a_Loop: for (let i = 0; i < a.length; i++) {
      const i1 = a[i];
      for (const i2 of b.list) {
        if (i2.L > i1.R) continue a_Loop;
        if (i1.L > i2.R) continue;
        const intersection = i1.intersect(i2);
        if (intersection !== null) result.push(intersection);
      }
    }
    return new IntervalSet(...result);
  }

  /** Finds the real complement (A') of an IntervalSet.
   *  Since the universal set is the set of all reals, therefore A' = (-∞,+∞) \ A.
   *  @returns {IntervalSet} the real complement of the IntervalSet.
   */
  complement() {
    const result = [];
    let realsRemaining = Interval.parse([false, -Infinity, Infinity, false]);
    for (const interval of this.#intervals) {
      realsRemaining = realsRemaining.subtract(interval);
      if (realsRemaining === false) continue;
      if (realsRemaining === null) break;
      if (realsRemaining instanceof IntervalSet) {
        result.push(realsRemaining.list[0]);
        realsRemaining = realsRemaining.list[1];
      }
    }
    if (realsRemaining instanceof Interval) result.push(realsRemaining);
    if (realsRemaining instanceof IntervalSet) result.push(...realsRemaining.list);
    return new IntervalSet(...result);
  }


  /** Finds the subtraction (A\B) of two IntervalSets.
   *  @param {IntervalSet} b - an IntervalSet to intersect with.
   *  @returns {IntervalSet} the intersection of the IntervalSets.
   */
  subtract(b) {
    return this.intersect(b.complement());
  }

  /** Sort function for re-ordering intervals within an IntervalSet. An interval is placed before another if:
   *  - its `L` is less, failing which
   *  - its `leftInclusive === true` but not the other's, failing which
   *  - its `R` is less, failing which
   *  - it `rightInclusive === false` but the other's is true, failing which
   *  - the two intervals are considered equal.
   * 
   * @returns {Number} negative if `a` is before `b`, positive if `a` is after `b`, 0 otherwise.
   * @param {Interval} a the first Interval
   * @param {Interval} b the second Interval
   */
  static sortFn(a, b) {
    return a.L !== b.L ? a.L - b.L
                       : a.leftInclusive !== b.leftInclusive ? b.leftInclusive - a.leftInclusive
                       : a.R !== b.R ? a.R - b.R
                       : a.rightInclusive - b.rightInclusive;
  }

  toString(inequality = false) {
    if (this.#intervals.length === 0) return '∅ (null set)';
    return this.#intervals
               .map(x => x.toString(inequality))
               .join(inequality ? '  or  ' : ' ∪ ');
  }

  toInequality() {
    return this.toString(true);
  }

}

class Interval {

  #leftInclusive;
  #L;
  #R;
  #rightInclusive;

  constructor() {}

  get leftInclusive() {return this.#leftInclusive}
  get L() {return this.#L}
  get R() {return this.#R}
  get rightInclusive() {return this.#rightInclusive}

  /** Sets the values of an Interval manually. Performs error/bounds checking.
   * 
   * @param {[boolean, Number, Number, boolean]} params
   */
  set(...params) {
    [this.#leftInclusive, this.#L, this.#R, this.#rightInclusive] = params.flat();
    return this.validate();
  }

  get copy() {
    return (new Interval).set(this.#leftInclusive, this.#L, this.#R, this.#rightInclusive);
  }

  /** Parses string representations of an `Interval` and/or ensures that an `Interval` is valid.
   * @param {string|array|Interval} interval - A string representing an `Interval`, e.g. `'[-2.05, 3['`, `'(-inf, 2]'`.
   * @param interval - Or an array `[leftInclusive, L, R, rightInclusive]`.
   * @param interval - Or an existing `Interval`.
   * @returns {null|Interval} If passed an `Interval`, returns the `Interval` itself. Otherwise, returns a `new Interval` parsed from the string/array.
   * @returns `null` if the `Interval` is invalid.
   */
  static parse(interval) {
    if (interval instanceof Interval) return interval;
    if (typeof interval === 'string') {
      const matches = interval.match(/\s*([(\[\]])\s*(-?\d+\.?\d*|-?\.\d+|-inf)\s*,\s*(-?\d+\.?\d*|-?\.\d+|\+?inf)\s*([)\[\]])/);
      if (matches === null) return null;
      return (new Interval).set(matches?.[1] === '[', matches?.[2] === '-inf' ? -Infinity : +matches?.[2], matches?.[3]?.includes('inf') ? Infinity : +matches?.[3], matches?.[4] === ']');
    } else { // interval is an array
      return (new Interval).set(interval);
    }
  }

  /** Ensures that an Interval is 'valid', meaning it conforms to the following conditions:
   * - L and R are not undefined or NaN.
   * - L is not greater than R.
   * - If one side of the Interval is +/-Infinity, then it is an open interval (the respective Inclusive flag is false).
   * - If L == R, i.e. the Interval is a single real number, then both Inclusive flags must be true.
   * 
   * @returns {null|Interval} `null` if the Interval is invalid.
   * @returns Otherwise, returns the Interval itself.
   */
  validate() {
    const [leftInclusive, L, R, rightInclusive] = [this.leftInclusive, this.L, this.R, this.rightInclusive];
    let valid = true;
    if (isNaN(L) || isNaN(R) || L === undefined || R === undefined) valid = false;
    if (L > R) valid = false;
    if (L === -Infinity && leftInclusive || R === Infinity && rightInclusive) valid = false;
    if (L === R) {
      if (L === -Infinity || L === Infinity) valid = false;
      if (!leftInclusive || !rightInclusive) valid = false;
    }
    if (valid) return this;
    this.#leftInclusive = this.#L = this.#R = this.#rightInclusive = undefined;
    return null;
  }

  /** Finds the intersection of two Intervals.
   *  @returns {null|Interval} `null` if the intersection is a null set (i.e. intervals do not overlap).
   *  @returns Otherwise, returns the intersection as an Interval.
   *  @param {Interval} b - the Interval to intersect with.
   */
  intersect(b, sorted = false) {  // sort intervals, then check if right bound of 1st interval >= left bound of 2nd interval.
    let [i1, i2] = [this, b];
    if (!sorted) [i1, i2] = [i1, i2].sort(IntervalSet.sortFn);
    if (!(i1.R > i2.L || i1.R === i2.L && i1.rightInclusive && i2.leftInclusive)) return null;
    return (new Interval).set(i2.leftInclusive, i2.L, Math.min(i1.R, i2.R), i1.R === i2.R ? i1.rightInclusive && i2.rightInclusive
                                                                                     : i1.R < i2.R ? i1.rightInclusive
                                                                                     : i2.rightInclusive);
  }

  /** Finds the union of two intervals.
   *  @returns {false|Interval} `false` if the union is simply both intervals (i.e. intervals do not overlap).
   *  @returns Otherwise, returns the union as a single Interval.
   *  @param {Interval} b - the Interval to intersect with.
   */
  union(b, sorted = false) {
    let [i1, i2] = [this, b];
    if (!sorted) [i1, i2] = [i1, i2].sort(IntervalSet.sortFn);
    if (i1.R < i2.L || i1.R === i2.L && !i1.rightInclusive && !i2.leftInclusive) return false;
    return (new Interval).set(i1.leftInclusive, i1.L, Math.max(i1.R, i2.R), i1.R === i2.R ? i1.rightInclusive || i2.rightInclusive
                                                                                     : i1.R < i2.R   ? i2.rightInclusive
                                                                                     : i1.rightInclusive);
  }

  /** Subtracts the 2nd interval from the 1st.
   *  @returns {false|null|Interval|IntervalSet} `false` if the subtraction leaves the 1st array unchanged.
   *  @returns `null` if the subtraction results in a null set (1st interval is subset of 2nd).
   *  @returns Interval if the subtraction results in a single Interval.
   *  @returns IntervalSet if the subtraction results in two Intervals.
   */
  subtract(b) {
    let [i1, i2] = [this, b];
    const intersection = this.intersect(i2, false);
    if (intersection === null) return false;
    let result = [];
    result[0] = Interval.parse([i1.leftInclusive, i1.L, intersection.L, !intersection.leftInclusive]);
    result[1] = Interval.parse([!intersection.rightInclusive, intersection.R, i1.R, i1.rightInclusive]);
    result = result.filter(x => x !== null);
    if (result.length === 1) return result[0]; else return new IntervalSet(...result);
  }

  /** Checks if two Intervals are identical.
   *  @returns {boolean}
   */
  equals(b) {
    return this.leftInclusive === b.leftInclusive && this.L === b.L &&
           this.rightInclusive === b.rightInclusive && this.R === b.R;
  }

  toString(inequality = false) {
    if (this.#L === undefined) return '(invalid interval)';
    if (this.#L === this.#R) return inequality ? `x = ${this.#L}` : `{${this.#L}}`;
    if (this.#L === -Infinity && this.#R === Infinity) return inequality? `x ∈ R` : `R (all reals)`;
    if (inequality) return (this.#L !== -Infinity ? `${this.#L} ${'<≤'[+this.#leftInclusive]} ` : '') + 'x' +
                           (this.#R !== Infinity ? ` ${'<≤'[+this.#rightInclusive]} ${this.#R}` : '');
    
    return ('(['[+this.#leftInclusive]) +
           (this.#L === -Infinity ? '-∞' : this.#L) + ', ' +
           (this.#R === Infinity ? '∞' : this.#R) +
           (')]'[+this.#rightInclusive]);
  }

  toInequality() {
    return this.toString(true);
  }

}

module.exports = {Interval, IntervalSet};