import { PromiseOut } from "@bfchain/util-extends-promise-out";
export class ChainChannelWaiter<CC extends BFChainCore.ChainChannel>
  extends PromiseOut<CC>
  implements BFChainCore.ChainChannelGroup.ChainChannelWaiter<CC>
{
  constructor(public readonly filter?: BFChainCore.ChainChannelGroup.Filter<CC>) {
    super();
  }
}

export class ChainChannelWaiterQueue<CC extends BFChainCore.ChainChannel>
  implements BFChainCore.ChainChannelGroup.ChainChannelWaiterQueue<CC>
{
  private _list = new Set<ChainChannelWaiter<CC>>();
  get size() {
    return this._list.size;
  }
  enqueue(filter?: BFChainCore.ChainChannelGroup.Filter<CC>) {
    const waiter = new ChainChannelWaiter(filter);
    this._list.add(waiter);
    return waiter;
  }
  dequeue(cc: CC) {
    for (const waiter of this._list) {
      if (waiter.filter === undefined || waiter.filter(cc)) {
        waiter.resolve(cc);
        this._list.delete(waiter);
        return waiter;
      }
    }
  }
}
