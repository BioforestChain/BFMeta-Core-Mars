import { Injectable } from "@bfchain/util";

@Injectable()
export class Config {
  private __version = "0.0.1";

  get version() {
    return this.__version;
  }

  set version(newVersion: string) {
    this.__version = newVersion;
  }
}
