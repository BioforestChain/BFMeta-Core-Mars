const UNLOCKED = 0;
const LOCKED_NO_WAITERS = 1;
const LOCKED_POSSIBLE_WAITERS = 2;

export class Lock {
  constructor(private _sharedArray: Int32Array) {
    Atomics.store(this._sharedArray, 0, UNLOCKED);
  }

  lock() {
    let lastLockState = Atomics.compareExchange(this._sharedArray, 0, UNLOCKED, LOCKED_NO_WAITERS);
    if (lastLockState !== UNLOCKED) {
      do {
        if (
          lastLockState === LOCKED_POSSIBLE_WAITERS ||
          Atomics.compareExchange(
            this._sharedArray,
            0,
            LOCKED_NO_WAITERS,
            LOCKED_POSSIBLE_WAITERS,
          ) != UNLOCKED
        ) {
          Atomics.wait(this._sharedArray, 0, LOCKED_POSSIBLE_WAITERS, Number.POSITIVE_INFINITY);
        }
        lastLockState = Atomics.compareExchange(
          this._sharedArray,
          0,
          UNLOCKED,
          LOCKED_POSSIBLE_WAITERS,
        );
      } while (lastLockState != UNLOCKED);
    }
  }

  tryLock() {
    const lastLockState = Atomics.compareExchange(
      this._sharedArray,
      0,
      UNLOCKED,
      LOCKED_NO_WAITERS,
    );
    return lastLockState === UNLOCKED;
  }

  unlock() {
    let v0 = Atomics.sub(this._sharedArray, 0, 1);
    if (v0 !== LOCKED_NO_WAITERS) {
      Atomics.store(this._sharedArray, 0, UNLOCKED);
      Atomics.notify(this._sharedArray, 0, 1);
    }
  }
}
