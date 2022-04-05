"use strict";

module.exports = class EnhancedSet extends Set {
  isSuperset(subset) {
    for (const elem of subset) {
      if (!this.has(elem)) {
        return false;
      }
    }
    return true;
  }

  union(set) {
    for (const elem of set) {
      this.add(elem);
    }
    return this;
  }

  intersection(set) {
    for (const elem of this) {
      if (!set.has(elem)) {
        this.delete(elem);
      }
    }
    return this;
  }

  difference(set) {
    for (const elem of set) {
      this.delete(elem);
    }
    return this;
  }

  symmetricDifference(set) {
    const intersection = (new EnhancedSet(this)).intersection(set);
    this.union(set);
    this.difference(intersection);
    return this;
  }
};
