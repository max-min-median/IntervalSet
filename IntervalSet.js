class IntervalSet {
    static sortBounds(b1, b2) {
        if (typeof b1[0] === 'boolean') return [b1, b2].sort((a, b) => b[0] - a[0]).sort((a, b) => a[1] - b[1]);  // left bounds
        else return [b1, b2].sort((a, b) => a[1] - b[1]).sort((a, b) => a[0] - b[0]);  // right bounds
    }

    static Interval = class {
        #arr = [];
        get LI() { return this.#arr[0]; }
        get L() { return this.#arr[1]; }
        get R() { return this.#arr[2]; }
        get RI() { return this.#arr[3]; }

        constructor(LI, L, R, RI, throws=true) {
            if (typeof LI === 'string') return this.constructor.parse(LI);
            this.#arr = [LI, L, R, RI];
            if (!this.isValid()) {
                this.#arr = [null, null, null, null];
                if (throws && LI !== null) throw new Error('Invalid interval');
            }
        }

        /** 
         * Parses string representations of an `Interval`. Ensures that an Interval is 'valid', i.e.
         * - L is not greater than R.
         * - If any side of the Interval is +/-Infinity, then that side is 'open' (the respective Inclusive flag is false).
         * - If L == R, i.e. the Interval is a single real number, then both Inclusive flags must be true.
         * @param {string|array|Interval} str - A string representing an `Interval`, e.g. `'[-2.05, 3['`, `'(-inf, 2]'`.
         * @returns {Interval} a `new Interval` parsed from the string/array.
         */
        static parse(str, throws=true) {
            if (typeof str !== 'string') throw new Error('expected a string');
            const matches = str.match(/\s*([(\[\]])\s*(-?\d+\.?\d*|-?\.\d+|-inf)\s*,\s*(-?\d+\.?\d*|-?\.\d+|\+?inf)\s*([)\[\]])/i);
            const res = matches === null ? new this(null)
                                         : new this(matches[1] === '[', matches[2].toLowerCase() === '-inf' ? -Infinity : +matches?.[2],
                                                    '+inf'.includes(matches[3].toLowerCase()) ? Infinity : +matches[3], matches[4] === ']', throws);
            if (!res.isValid() && throws) throw new Error('Invalid interval');
            else return res;
        }

        isValid() {
            return !(this.LI === null || this.L > this.R ||
                     this.L === -Infinity && this.LI || this.R === Infinity && this.RI ||
                     this.L === this.R && (this.L === -Infinity || this.L === Infinity || !this.LI || !this.RI));
        }

        /** Finds the intersection of two Intervals.
         *  @returns {null|Interval} `null` if the intersection is a null set (i.e. intervals do not overlap).
         *  @returns Otherwise, returns the intersection as an Interval.
         *  @param {Interval} other - the Interval to intersect with.
         */
        overlap(other) {  // from the 'righter' leftbound to the 'lefter' rightbound.
            if (!this.isValid()) return this; else if (!other.isValid()) return other;
            const leftbounds = IntervalSet.sortBounds([this.LI, this.L], [other.LI, other.L]);
            const rightbounds = IntervalSet.sortBounds([this.R, this.RI], [other.R, other.RI]);
            return new this.constructor(...leftbounds[1], ...rightbounds[0], false);
        }

        // from the 'lefter' leftbound to the 'righter' rightbound, but only if there is
        // nothing between the 'lefter' rightbound and the 'righter' leftbound.
        merge(other) {
            if (!this.isValid()) return this; else if (!other.isValid()) return other;
            const leftbounds = IntervalSet.sortBounds([this.LI, this.L], [other.LI, other.L]);
            const rightbounds = IntervalSet.sortBounds([this.R, this.RI], [other.R, other.RI]);
            if (new this.constructor(!rightbounds[0][1], rightbounds[0][0], leftbounds[1][1], !leftbounds[1][0], false).isValid()) return null;
            return new this.constructor(...leftbounds[0], ...rightbounds[1], false);
        }
        
        /** returns an array of 2 intervals:
         *  - from `this.L` to `other.L`, and
         *  - from `this.R` to `other.R`.
         *  if `this` and `other` do not intersect, then `this` will be returned as one of the
         *  intervals in the array (which one depends on its relative position to `other`).
         */
        remove(other) {
            if (!this.isValid() || !other.isValid()) return this;
            return [this.overlap(new this.constructor(this.LI, this.L, other.L, !other.LI, false)),
                    this.overlap(new this.constructor(!other.RI, other.R, this.R, this.RI, false))];
        }

        equals(other) { return this.isValid() && ['LI', 'L', 'R', 'RI'].every(x => this[x] === other?.[x]); }

        toArray() { return this.#arr.slice(); }

        toString(inequality=false) {
            if (this.LI === null) return '(invalid interval)';
            if (this.L === this.R) return inequality ? `x = ${this.L}` : `{${this.L}}`;
            if (this.L === -Infinity && this.R === Infinity) return inequality ? `x ∈ R` : `R (all reals)`;
            if (inequality) return (this.L !== -Infinity ? `${this.L} ${'<≤'[+this.LI]} ` : '') + 'x' +
                                   (this.R !== Infinity ? ` ${'<≤'[+this.RI]} ${this.R}` : '');
            return ('(['[+this.LI]) + (this.L === -Infinity ? '-∞' : this.L) + ', '
                                    + (this.R === Infinity ? '∞' : this.R) + (')]'[+this.RI]);
        }
    
        toInequality() { return this.toString(true); }
    }

    #intervals = [];

    constructor(...intervals) {
        const tempIntervals = [], arr = this.#intervals;
        for (const interval of intervals) {
            if (typeof interval === 'string') tempIntervals.push(this.constructor.Interval.parse(interval));
            else if (Array.isArray(interval)) tempIntervals.push(new this.constructor.Interval(...interval));
            else if (interval instanceof this.constructor.Interval) tempIntervals.push(interval);
        }
        tempIntervals.sort((a, b) => a.L - b.L);
        for (let i = 0; i < tempIntervals.length; i++) {
            if (arr.length === 0) { arr.push(tempIntervals[i]); continue; }
            const merge = arr[arr.length - 1].merge(tempIntervals[i]);
            if (merge !== null) arr[arr.length - 1] = merge;
            else arr.push(tempIntervals[i]);
        }
    }

    toArray() { return this.#intervals.slice(); }

    equals(other) { const otherIntervals = other.toArray(); return this.#intervals.every((x, i) => x.equals(otherIntervals[i])) }

    /** Finds the union (A∪B) of two IntervalSets.
     *  @param {IntervalSet} other - an IntervalSet to union with.
     *  @returns {IntervalSet} the union of the IntervalSets.
     */
    union(other) { return new IntervalSet(...this.#intervals, ...other.toArray()); }

    /** Finds the intersection (A∩B) of two IntervalSets.
     *  @param {IntervalSet} other - an IntervalSet to intersect with.
     *  @returns {IntervalSet} the intersection of the IntervalSets.
     */
    intersect(other) {
        const result = [];
        const gen1 = this.#intervals[Symbol.iterator](), gen2 = other.toArray()[Symbol.iterator]();
        for (let i1 = gen1.next().value, i2 = gen2.next().value; i1 !== undefined && i2 !== undefined; ) {
            const intersection = i1.overlap(i2);
            if (intersection.isValid()) result.push(intersection);
            if (i1.R > i2.R) i2 = gen2.next().value; else i1 = gen1.next().value;
        }
        return new IntervalSet(...result);
    }
    
    /** Finds the real complement (A') of an IntervalSet.
     *  Since the universal set is the set of all reals, therefore A' = (-∞,+∞) \ A.
     *  @returns {IntervalSet} the real complement of the IntervalSet.
     */
    complement() { return new IntervalSet([false, -Infinity, Infinity, false]).subtract(this); }

    /** Finds the subtraction (A\B) of two IntervalSets.
     *  @param {IntervalSet} b - an IntervalSet to intersect with.
     *  @returns {IntervalSet} the intersection of the IntervalSets.
     */
    subtract(other) {
        const result = [];
        const gen1 = this.#intervals[Symbol.iterator](), gen2 = other.toArray()[Symbol.iterator]();
        for (let i1 = gen1.next().value, i2 = gen2.next().value; i1 !== undefined; ) {
            if (i2 === undefined) {
                result.push(i1);
                i1 = gen1.next().value;
                continue;
            }
            const [r1, r2] = i1.remove(i2);
            if (r1.isValid()) result.push(r1); else i2 = gen2.next().value;
            if (r2.isValid()) i1 = r2; else i1 = gen1.next().value;
        }
        return new IntervalSet(...result);
    }

    toString(inequality=false) {
        if (this.#intervals.length === 0) return '∅ (null set)';
        return this.#intervals
            .map(x => x.toString(inequality))
            .join(inequality ? '  or  ' : ' ∪ ');
    }

    toInequality() {
        return this.toString(true);
    }
}

const a = new IntervalSet('[0, 3)', '[1, 3]')

module.exports = IntervalSet;