import { ParityBitHelper } from "@bfchain/core-helper";

const parityBitHelper = new ParityBitHelper();

function getRandomMagic() {
    return parityBitHelper.createMagic();
}

function getRandomDAppid() {
    return parityBitHelper.createDAppId();
}

export {
    getRandomMagic,
    getRandomDAppid
}