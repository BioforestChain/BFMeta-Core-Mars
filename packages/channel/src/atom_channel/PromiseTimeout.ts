import { sleep, unsleep, PromiseOut } from "@bfchain/util-extends-promise";

export class PromiseTimeout<T> extends PromiseOut<T> {
  constructor() {
    super();
    this.onFinished(() => this.clearTimeout());
  }
  get sleepTime() {
    return this._sleepTime;
  }
  get endTime() {
    return this._startTime + this._sleepTime;
  }
  private _startTime = Date.now();
  private _sleepTime = 0;
  private _sleepTi?: Promise<unknown>;
  setTimeout(sleepTime: number, cb: () => unknown) {
    this.clearTimeout();
    this._startTime = Date.now();
    this._sleepTi = sleep((this._sleepTime = sleepTime), cb);
  }
  clearTimeout() {
    if (this._sleepTi) {
      unsleep(this._sleepTi);
      this._sleepTime = 0;
      this._sleepTi = undefined;
    }
  }
}
