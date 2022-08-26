export default class EnhancedSet<T> extends Set<T> {
  isSuperset(subset: Set<T>) {
    for (const elem of subset) {
      if (!this.has(elem)) {
        return false;
      }
    }
    return true;
  }

  union(set: Set<T>) {
    for (const elem of set) {
      this.add(elem);
    }
    return this;
  }

  intersection(set: Set<T>) {
    for (const elem of this) {
      if (!set.has(elem)) {
        this.delete(elem);
      }
    }
    return this;
  }

  difference(set: Set<T>) {
    for (const elem of set) {
      this.delete(elem);
    }
    return this;
  }

  symmetricDifference(set: Set<T>) {
    const intersection = (new EnhancedSet(this)).intersection(set);
    this.union(set);
    this.difference(intersection);
    return this;
  }
}
