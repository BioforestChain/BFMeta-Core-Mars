## 定义

fromChainVersion = 注册链 ID

## 基础接口定义

1. FieldEncoderFactory 有一个默认的 DefaultFieldEncoderFactory ,用于默认处理任何 注册链的 入链交易,它只在乎 fieldName, fieldNameVersion.

   > 默认编解码的文件夹规则

   ```ts
        default/bodyVersion/{fieldName}/()=>map<version, encoder>
   ```

2. 如果一些特殊的链,需要特殊处理,就打代码补丁, 提供定制版的 FieldEncoderFactory
   > 补丁的文件夹规则
   ```ts
       patch/{fromChainVersion}/{bodyVersion}/{fieldName}/()=>map<version, encoder>
       patch/{fromChainVersion}/{bodyVersion}/{fieldName}+()=>map<{fieldName}+version, encoder>
       patch/{fromChainVersion}/{bodyVersion}+()=>map<{bodyVersion}+{fieldName}+version, encoder>
       patch/{fromChainVersion}()=>map<{fromChainVersion+{bodyVersion}+{fieldName}+version, encoder>
   ```

```ts
import {patch} from {fromChainVersion}
export function FieldEncoderFactory(config: { fromChainVersion, bodyVersion, fieldName, fieldNameVersion } ){
    if(patch.test(config)){
        return patch.factory(config)
    }
    return DefaultFieldEncoderFactory(config)
}
export function BodyEncoderFactory<F extends {[name]:version}>( { fromChainVersion, bodyVersion, fields: F } ){
    return {} as interface {
         [`${keyof F}Encocder`]:Encoder,
         [`${keyof F}Decocder`]:Decoder,
    }
}
```

## 顶层接口定义

MigrateCertificateConverter 是跟着当前链的规则走的. 它直接决定着 body 内有哪些字段。
比如说 body 内有 location 和 ip 信息，但是我们不需要，就不用解析

```ts
class MigrateCertificateConverter extends BodyEncoderFactory /* 我们自己需要的字段 */ {
  private _sourceData: JSON;
  private _helper;
}
```
