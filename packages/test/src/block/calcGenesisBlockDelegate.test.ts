import {
  Block,
  RoundLastBlock,
  CommonBlock,
  CommonBlockFactory,
  TransactionInBlock,
  RoundLastBlockFactory,
} from "@bfchain/core";
import { AsyncIteratorGenerator, QueneEventEmitter } from "@bfchain/util";
import { getFullBfchainCoreEntry } from "../include";
import { console } from "@bfchain/devkit";
import * as fs from "fs";
import * as util from "util";
function print(obj: any) {
  console.log(obj);
  fs.writeFileSync(process.cwd() + "/test.log", util.format(obj) + "\n", { flag: "as+" });
}

(async () => {
  const bfchainCore = await getFullBfchainCoreEntry(57, 128);
  bfchainCore.moduleMap.set("blockGetterHelper", {
    async getBlockByHeight(height: number) {
      const blockJSON = blockMap.get(height);
      let block;
      if (blockJSON && height % bfchainCore.config.blockPerRound !== 0) {
        block = Block.fromObject(blockJSON);
      } else if (blockJSON) {
        block = RoundLastBlock.fromObject(blockJSON);
      } else {
        throw new Error(`no ${height}`);
      }
      return block;
    },
    async getBlockBySignature() {
      return {} as any;
    },
    getLastBlock() {
      return {} as any;
    },
  } as BFChainCore.BlockGetterHelperInterface);

  /**已绑定的受托人个数 */
  let pickGenerators = bfchainCore.transactionHelper.genesisDelegates()[0]; //.slice(50, 80);
  // pickDelegates = pickDelegates.filter((v) => {
  //   if (["c4q2hHccaS3qcXGMqsGcasjbvj9aJsCuuy"].includes(v)) {
  //     return false;
  //   }
  //   return true;
  // });
  /**生成的区块数 */
  const generateCount = 500;
  /**生成完以后是否验证 */
  const isVerify = true;
  /**第一笔交易开始的时间戳 */
  const fakeTimestamp = bfchainCore.config.forgeInterval * bfchainCore.config.blockPerRound * 10;
  const generatorsArr = [
    {
      secret:
        "scan pass carpet coral pumpkin spell present decrease veteran text flower pioneer top speak jaguar wreck ask always hazard good know gift uncle frost",
      address: "cCET2Sxt2LPDhx44wxJ9uhkpviKNrSacvE",
      publicKey: "6e8330144a8c123c017a8f5c363531868d3ce21c45b4a668cc1767c2b4695c84",
      username: "bfchain1",
    },
    {
      secret:
        "upgrade jump sugar congress glare expect other firm morning donate motor pride minute frame amount chimney wood gallery twelve barely dose blame convince enhance",
      address: "cLrUCNAWPyPH96bqqC3JQXZ3CtsvvXmNj1",
      publicKey: "0f88fe3a155927907b507c10ccd0318a7f3b2f55aeb6c90913756ef43db4e836",
      username: "bfchain2",
    },
    {
      secret:
        "boost scorpion peanut output undo useful trash burden custom party click offer leisure magnet obscure drop gather blind predict walk since strike thumb minimum",
      address: "cKySkYVB4MhWhKczSUmY7WhF638hPx6U8N",
      publicKey: "526b2c534f8e0b2c75394e8c2968196510f912ebee80c17193baea45c73c07fa",
      username: "bfchain3",
    },
    {
      secret:
        "trim demise duck obtain afford track forget shuffle stay draft pulp license update decrease proof move come detect annual worry umbrella type robust frozen",
      address: "cNQzoCNDDYY2uqBEW6fb7B6HzFjyz6oCt8",
      publicKey: "72eb8d56261b211e0f77029cd8010b6378fa23342cb21c1169e4ac2c00debaa0",
      username: "bfchain4",
    },
    {
      secret:
        "labor shoe ripple inquiry loan embrace leg addict scheme tent that mixed mirror hockey credit swarm dizzy clap blast step silly ice thank devote",
      address: "cCuaHXAe1hcEGgqz6eg8QC9UKQHZ1Cq2Qo",
      publicKey: "58f751e6ffd7e67d1ddf3d687f02e828a4f855a6ba78fd06bdbeb934ba56ec77",
      username: "bfchain5",
    },
    {
      secret:
        "shoe dinner doll copper merit layer chunk logic treat polar measure program bunker chef usage behave verb fiscal original digital soldier beef diet topic",
      address: "cGnmjV6fk5kFbTWztDtZhyr1a4Van4NPvR",
      publicKey: "a210c3565083922100ce8ba1c2f99da5769fbc78e90594b052ccb0388d3155c2",
      username: "bfchain6",
    },
    {
      secret:
        "jeans cushion salute amount trouble aerobic cube cupboard comfort advance total aim acoustic blanket taste own hair rain sibling profit bunker enforce label three",
      address: "cCmcRqAdKd24ft1Nuwzc6p1Uf5R47RSAUF",
      publicKey: "ca78e16aad7980933da93844a1b91a719bf7793a05c566de8c9806efd90761e2",
      username: "bfchain7",
    },
    {
      secret:
        "possible cube arrow force unaware kind industry law all more actress audit host derive dad deny claw leg until omit tragic kidney bunker horn",
      address: "cKqjHi8u4n5RJJa1CxHgZbwHXS9cKC5Ekw",
      publicKey: "85ea51eefe25fecfa3e7fcb7b47c28dc8e1e47b7152c6a94791b5f2d50ae165a",
      username: "bfchain8",
    },
    {
      secret:
        "ridge amateur moon warrior stairs meadow puppy novel fuel trim simple pig crowd trigger comfort guide blossom frog fringe monitor snap immune hybrid song",
      address: "c81E6nEaLHJ25mFRTDSMar5YjmrYLsNr5v",
      publicKey: "846f681c2d957b372f9b606737dbf8bcc99a8cb8de989c02d8ca162a10132903",
      username: "bfchain9",
    },
    {
      secret:
        "model brush soft lake food develop elegant frog coast order sheriff culture orphan honey depart zone select return traffic inherit trim anxiety twice inform",
      address: "c4wQ1qXmKFBBGeHeiT5QsB9oKwsGYmK2eA",
      publicKey: "5ff43d2626b6a60602645333df040189db9339ca424ac2dc4fa7f32cd4da1923",
      username: "bfchain10",
    },
    {
      secret:
        "joke engine front stairs horse shield proud motion sun net person index draw cement blast soul guilt cargo initial inquiry inspire cute regret educate",
      address: "c8Ke6FeamgemKfaAdppcUVoGfModE4CEyT",
      publicKey: "3b219fc3f94643fdafff9db830746f30d4f91624ca667522ff8f66e1e2093fd7",
      username: "bfchain11",
    },
    {
      secret:
        "shock list sweet violin next subway essence final high toward ugly income submit thumb goat force harvest once rapid evidence match forget symptom rack",
      address: "cBpRE96Ff1RR3kVoN9Hky6pnAtTky8cP4s",
      publicKey: "e28b18bdb7dba853841fdebfc0619298d3c45e1983c99dd0ced0f4ff8196f7c9",
      username: "bfchain12",
    },
    {
      secret:
        "wood unique man resource syrup resource three gasp legend magnet spike cotton vendor tissue beyond asthma deal evoke combine exist melody pig acquire alone",
      address: "cFtYf1e5Ng5QhZzHiPMvDyV3NQHxKBnLmV",
      publicKey: "66147aafdeeb0f6f1fa6019fc8e9218b834a658712fbee756db9330b7ddc0d40",
      username: "bfchain13",
    },
    {
      secret:
        "above way deer garage length life people sweet either screen bonus zebra knee clown aim prize crystal elephant similar regular bundle question point possible",
      address: "cPDXYf8tLYdv8LG43RxgHbNLi1ouxDcP8p",
      publicKey: "0d3e2e300683c37256270851b11889e882f871d2bb3d58e7f18a55ea2cc4d722",
      username: "bfchain14",
    },
    {
      secret:
        "pass second gas frost bright wheel kind insane clock fabric render scout unlock side agent solar art mandate menu right victory company amused frog",
      address: "c5fjyiG9HYrHrzJnyLsMZSkw6M5JzkZWUY",
      publicKey: "f35137a5cdcff0da62d5bf6c9d5840c2ce8e68539653353e2fd1cb85fd15d240",
      username: "bfchain15",
    },
    {
      secret:
        "observe legal stone monster rate sting display purpose issue cabin shine speak help dinosaur invite coin enter scare obtain panel digital old voyage boost",
      address: "c582jFX2DfF45B65YSKN31qk6Ft9ckVAJm",
      publicKey: "3fd31fd9aadff0ababfa361fdcbf6f8838537e4d55b80cc5f6811d29aeb519a4",
      username: "bfchain16",
    },
    {
      secret:
        "asset shoe merry cry soldier avocado pen only subject width rapid garbage grief already million uncle rate inhale loyal bunker canyon divert witness fence",
      address: "cBy33bW2b8QX3Th6mjkpHRykPGLN9ahG9p",
      publicKey: "8faa36a204246e3f4f0a63c6596d5ec2eed55e8c7df556511d44e51f16e3444f",
      username: "bfchain17",
    },
    {
      secret:
        "rate square april cable avoid velvet shift sound usual chapter execute club rural ankle crazy fury area denial adapt risk physical scan ignore perfect",
      address: "c5QActCYGusL7wEwV8sDTZ6QcekFBjBMhv",
      publicKey: "3e4923ab278ff075b4b9b0e791925efe7959d33222d944bbc2173b09db25c2ec",
      username: "bfchain18",
    },
    {
      secret:
        "win avoid creek vacuum reveal plastic salute unable punch tissue indoor clarify winner coyote trend crop casino dignity island horse injury choose flock royal",
      address: "cLxoe3BFVFWJitksZZU7r7pyPbGxdV9FEw",
      publicKey: "7e740a16c8d812e472ccc010e05c3feb24642ce6c1068e155edff525fcd04f81",
      username: "bfchain19",
    },
    {
      secret:
        "domain topic okay clean artwork soda panel heart silly light celery report appear glare crater evolve bless pool penalty arrive dice hope pioneer bone",
      address: "cCTtPZA7Ry9qEnLJm6yyWGFswdFC5hiMhe",
      publicKey: "2bf616d6a1e047121e55221d2aaae311385df6a47d7d7bed3858b9db6f33db72",
      username: "bfchain20",
    },
    {
      secret:
        "abstract leg sadness people quantum edit anchor auction congress exhaust kite corn warfare suggest charge security business loud ostrich fit kid voyage inside cloth",
      address: "cHdATqSzszEe335hM8kaNM267SH98BCpbx",
      publicKey: "53d6c8720e8b1453cb87ff13f8b8a2d500c5a75140bfa3262f6324db3c0beb9c",
      username: "bfchain21",
    },
    {
      secret:
        "normal now either mail trigger oppose develop impact blue oyster defy traffic off sell hour alter gate sponsor bomb vessel clean rack floor deliver",
      address: "c7LefZDapLTMcazj5gJdJJE4PePHQ2qpNu",
      publicKey: "941ea5d076a8ec7786937c574a881d85bcd9d6655caa52ba26f190b6f49057b5",
      username: "bfchain22",
    },
    {
      secret:
        "city gossip uncle mandate appear pluck grow uphold symbol genre vendor indicate foil rack focus jungle useless predict panic jaguar nothing foster noble tunnel",
      address: "c3MCDGU8vFk6waxeeRbBUt3QaRvB6q1TAH",
      publicKey: "09afb1d819eff22f3ef12d6179e3b1d8b9482636e6f9a6249417b5e885fd44dc",
      username: "bfchain23",
    },
    {
      secret:
        "path emerge test bean stem enrich prison uncle mixture admit embark peasant hockey disorder pitch rough bulk stick maid mixture outside bench drink swim",
      address: "cKmsqZLYAY8xjsqSaFdUy2jUuewBpCCcf9",
      publicKey: "e5100fcd7e125400add3ca19a2491508885c111f31c3fb13fab76f0f65fe300b",
      username: "bfchain24",
    },
    {
      secret:
        "blur eye elite economy lawn element marriage neglect hood leg increase meadow army pyramid sauce mom early vicious imitate word process pear eye focus",
      address: "c4aG5yDeGo4TqR6C9r2vBaaNXmR2Ro17SV",
      publicKey: "0e8bc3fb8649b36e5e315e838bd62aca2fe0c47c1dc5ba92b804dcc1cf14059b",
      username: "bfchain25",
    },
    {
      secret:
        "lake coach donate slab winter busy enact can market life auto treat gorilla glow muffin clap despair nature badge before system truth plunge move",
      address: "cJzdd4agJhJR7psxQeH7beLeqarzeRrVWz",
      publicKey: "2fb7a053fd7dc28de5b8fad26a20bab7a44c7ff2dbc236c36f5a40072c5ae89e",
      username: "bfchain26",
    },
    {
      secret:
        "angle deny extra remove curve outer wise addict age toilet lens turn brick cement illness cash modify toe exile bargain coil finger equal phone",
      address: "cBRJCW5SXiaJzDEFQhmLhCjizEBaprHj9w",
      publicKey: "d0183642b53ca8534aa90bd062f6b6382781e105a000f161b06f11cf8f6dd982",
      username: "bfchain27",
    },
    {
      secret:
        "stool tip soccer energy all memory solve chuckle catch disagree gift before fade rhythm sense provide mom asset error photo lecture private cost matrix",
      address: "cKqAK2TLS5AiGm75CAuVLUv4D38MyqTD9M",
      publicKey: "3d51156e61134615a263fd05b9d3adabd9b19c2270ccf42e4078d30f414c3aa9",
      username: "bfchain28",
    },
    {
      secret:
        "link flash very direct security female spare rival festival hollow conduct coconut title fitness choice stone fly profit panic old case hat voice guard",
      address: "cDUwDnum3J5bQo78LDWcCJLAASqRP4VSan",
      publicKey: "3a31d24a39fbab779c77b48cb88735480a07b84dc78599bee3b5d32aa5fdfe3c",
      username: "bfchain29",
    },
    {
      secret:
        "world dance spirit circle lunch crater biology gasp stable modify sand cry flat east almost space denial approve pretty little manage cash town sample",
      address: "cH4RweoyEU363G5p7P2D1bEe5uccLNFJgC",
      publicKey: "6282ce7ff3be98a2343a1bdff366c2d3c803fa73432aa059760b954a18f16341",
      username: "bfchain30",
    },
    {
      secret:
        "marine elite derive gun utility ocean estate buzz foil sphere early amount nothing corn eight sauce cart badge bid kite strategy symbol hotel episode",
      address: "cH6L4muHgCsNwfqFPEMMBJwTG6NWhVWqiv",
      publicKey: "a8c40c599165afaf87e4bbcc4b48882c94aad2f2a3319a5f7f470a216192c3bf",
      username: "bfchain31",
    },
    {
      secret:
        "color horse lunar basic ladder proud cupboard secret asset list tell pear globe dog off aim home first elder test army badge naive east",
      address: "c5rSRneu7iXf8r8N87raRev24kHGmkvPMT",
      publicKey: "01ee78a33f7559acd58db1a16760fb378cea969b0ae56a573a33ec42ac2727ec",
      username: "bfchain32",
    },
    {
      secret:
        "fat brown evoke poem solar spare bench middle barely treat reform snow merry shrimp pause sock laundry sport risk attack neck tuna forward myth",
      address: "cMPVU5d8U87bqPTZsLaWiyAv5UbZwMENip",
      publicKey: "ea615f4e9dfd4d82be354d023054647ea4603ad626d079ef739ec27ff4f405e4",
      username: "bfchain33",
    },
    {
      secret:
        "picnic glimpse bronze history saddle jazz pool donate include ship arena rib bounce tank detail adapt color someone glare pattern rubber fan bacon screen",
      address: "cKcsAB6U1KSkUrUsLr1ysdK5UrfCmFribi",
      publicKey: "2e33318489f9fa553535f14acbc87533f93b1e049107172e0b08ea1d81d2f46c",
      username: "bfchain34",
    },
    {
      secret:
        "tunnel away silent connect envelope melody swamp chronic tray quick damp drift nerve other ill material bacon verify vibrant wage skirt resource lounge stadium",
      address: "cCjrLJHLRUZci2Ak1W2BbgchJQLoQo86d7",
      publicKey: "64f1e68df05d5b3bf4f91a4f7c8df54d84049710969ffe8719d397492afd4b5c",
      username: "bfchain35",
    },
    {
      secret:
        "remind mixed minor unfold hundred merry secret retreat people pledge dust citizen park wall connect address trial shield attract taxi labor course win near",
      address: "cFG8tkEage2m5qnpsd8giKe9kad6ACF3BY",
      publicKey: "ab049a8c531e2fd43e62f78007b99a7c91abaaf1663d3ef144de2d23901cc2ac",
      username: "bfchain36",
    },
    {
      secret:
        "clog chimney evolve pitch maple trend mad lake bike fine rain road identify buyer member design bar baby absurd moon lecture balance cargo govern",
      address: "cNhu1W73hSpHzwJfzGbHf1tM9KWSGTtC8U",
      publicKey: "8178732c2b696e590c1b4dcd1b964c7cd40dc36254f46e679712c69dd989db1e",
      username: "bfchain37",
    },
    {
      secret:
        "floor giggle illegal option taste ribbon chest language force all present move sugar pool echo spy motion source enhance price common reduce solid tunnel",
      address: "cFEaSoF3QceWxjnLsg9FoQyLVcUzVEpkSP",
      publicKey: "78cce1598deb7e093d4e7f11228e5d118445e8ed5a069744c109627914d525fb",
      username: "bfchain38",
    },
    {
      secret:
        "try brick cupboard mountain throw frost step afford father clap march call foil certain arrest cliff entry order village text hole reopen wood carbon",
      address: "cGS6P65poK8GN5yhAtBj5ddDuDFh3k4YW8",
      publicKey: "261094dac90315e218761b473abc5360a1ce64aefb23a6c1485e76b1f5486165",
      username: "bfchain39",
    },
    {
      secret:
        "ensure limit supreme ceiling filter anchor island keen forget foster height cute display umbrella muscle melody salmon limb silk fine blouse adapt practice air",
      address: "cFtR9y1R2zvvd7DXUE5cQu4wVuHzMzKFXW",
      publicKey: "590a79cba04adb47c32ecefa3c8fd5dad28d7b20adf2183720f1cf4da4340a0a",
      username: "bfchain40",
    },
    {
      secret:
        "height candy diary mirror uniform meat exotic magnet actor income town diet blade bargain wreck style force proud success cotton they fitness hero side",
      address: "cMbTY5hZ2RXCVGPYgwjp3ybnM1EyQenDiy",
      publicKey: "ef1f14a3124f5a677fdc6672b6e604fe67ab411ebfc2a43d8bd5712b63f4be71",
      username: "bfchain41",
    },
    {
      secret:
        "avocado civil pulp enrich banana farm flavor left short carpet decorate shell reward knock staff tongue erase craft person banner bitter hurt zero neglect",
      address: "cM8wVfYBZq6KtXCKAobMH9g9jLTcSfCiw5",
      publicKey: "caa26011afcc4e1399d5e3e80e5d99743037d6acdfb0681ae633ac17e4942bd8",
      username: "bfchain42",
    },
    {
      secret:
        "pulp bamboo light swap album choice delay display chimney short theme embrace violin caught express message grit define excite goose elegant scorpion zone stem",
      address: "cNsdgX2hL8tpZuNV8pbqpcmmQXFYgyoHb3",
      publicKey: "bae1c9ebe5687345dcefe3a24db95ed7bf689e96fea65218016cc7926eab9a03",
      username: "bfchain43",
    },
    {
      secret:
        "cloud lab fetch wish cricket over repair avoid weather decline novel mesh joke furnace below goose great peace excite assume better problem offer little",
      address: "c5AYPcDMUGr5JHErEo5y43SZG8JsF8YjG5",
      publicKey: "90661169df55393cefccc85476924a53e3572cd20c3504c04b0fffad6564a372",
      username: "bfchain44",
    },
    {
      secret:
        "royal purity front tonight casual orphan motor salt skill solid alley salad olive outdoor easily bicycle tank survey middle speed vendor turn shift venture",
      address: "c3e7TaDkuPcWC8L7GfkixXsaZDpP5Rtasg",
      publicKey: "c59f43b58fde85c00be6caa17b6105ec316d457aecf778437714521904054e1c",
      username: "bfchain45",
    },
    {
      secret:
        "hurry hawk over settle eternal exit olympic tree rug multiply canal eight second school dice brisk fit surge pigeon into jump balance heart blame",
      address: "cD4rsua9vmVMiPouRL7MJJcVPWKtQu8E5X",
      publicKey: "755361ce88a091223c2cafc05a212f718d5e7030a35f1c2775f25dc8a32cea7d",
      username: "bfchain46",
    },
    {
      secret:
        "glory erosion pumpkin deal grab fancy flee ecology sibling gift typical distance object debate conduct brand garbage brick unaware fox apart output rose veteran",
      address: "cGQ5NPs1k59LxCvxECXLKNpr4TezDvhMZn",
      publicKey: "0778ffb14e793d2f0ec54016ac18032d8d668f150be4d43870e45795211fa309",
      username: "bfchain47",
    },
    {
      secret:
        "weapon ladder valid office grocery olympic digital build brisk token aisle horror equip brief moral merry forest night already legal robust sell claim wealth",
      address: "c6kHiX6mRcy3KeWCeb7MYAd8pfnDhnz8V7",
      publicKey: "879485f07b711ce37a366bf8fccb380a37479fc62becb552de97c83488f10cc8",
      username: "bfchain48",
    },
    {
      secret:
        "novel aunt solve abuse grow space dress excess siren penalty absurd crunch chimney absurd endorse finger chat firm boost idea once video tattoo transfer",
      address: "cPNWUU9oB4NaxFagHDafkD2p54phRGSwqh",
      publicKey: "911d42df97077a6606e10758f88ed686bea506c5439feccd7a6dc26199b1caed",
      username: "bfchain49",
    },
    {
      secret:
        "agree cinnamon orient like throw cave giggle dream vanish fossil vast inmate orange tourist cute coconut super donate moment either base novel cook inside",
      address: "cNqpoUrBTpPvGzpFsimJRMm1uDjvDPpigj",
      publicKey: "8d53e03e096279ce7a69b3a60334353e1973fd6d3a3f11142546b5705a23f66f",
      username: "bfchain50",
    },
    {
      secret:
        "industry alpha million runway say matter captain hero fade hole phone anger limit plate bacon cinnamon crumble crumble transfer syrup early coral twelve tone",
      address: "c7y8jqVoAmP9uHA6bYxT66KSPXz14tSahH",
      publicKey: "b96ebea4ec99ba11d4a08f42f6fbe4f6b41d097ee1ea0a01f0544be7980dfb84",
      username: "bfchain51",
    },
    {
      secret:
        "fork garment cactus supreme uncover when prefer mule brain unveil exile lake reflect pulp buddy mom stomach food better gap chat garden mean athlete",
      address: "cMyZAA4V27jEmysddCxCqXKAeN2bBvDsVU",
      publicKey: "d186a66dd2614656120c410d7073ae7b471ba53f2c3581a5a14efb6ab5d7585f",
      username: "bfchain52",
    },
    {
      secret:
        "river cruel meat office story health laptop wild juice crush uncle setup remain tattoo opera awesome pattern shuffle apple electric prosper fence present match",
      address: "cMtCaC4WmjBjZYbzrGZREJ9imX479XxpsM",
      publicKey: "b2b20bf7a4babc63e15f254efe5d5187e520ebfabb54d8108906a798f1e24da1",
      username: "bfchain53",
    },
    {
      secret:
        "fragile reject struggle record sleep force once cost record movie fan viable exotic ten will evoke truth meadow toy music arrest person business harvest",
      address: "c2LMjYRGQbGAuNWBNyWrRr81WXzaZJqMdW",
      publicKey: "27a5d41a21b7781aab6f303385c918f4e6d0b419ad18d1c6e2e1e50248044d60",
      username: "bfchain54",
    },
    {
      secret:
        "arrow dial manual grocery salute family adapt layer mimic surprise beyond coil category gesture nasty mixture above borrow mosquito seminar soon coconut stage body",
      address: "c6XZmkn23mSbiVVydY8WcEJSebM9RpRq8V",
      publicKey: "5e93e1c686bd5a65dc20690690a344a8f8e076bc23b1b472bb90b2411fdbb841",
      username: "bfchain55",
    },
    {
      secret:
        "smoke produce theme lab atom border trap tobacco soldier flash idea pave gossip jungle arm ask profit month banner fluid pyramid salmon diary amazing",
      address: "cERnwrsCNpy4b8hQ683zpRFPw88yXuVXES",
      publicKey: "16e8eccdef3089a8a189251341d51173708991909e4f6afe53c57f2048d8dc1f",
      username: "bfchain56",
    },
    {
      secret:
        "below bonus pill prevent upgrade develop medal genuine fitness cube enemy town swim drill cement marriage casino dad practice page trick diet illegal police",
      address: "cBgQkrwMZdQzu3QgtkN4vTbDB2Zf7F9ndm",
      publicKey: "f2faca39268368be239a05fcea34cf167e6edbc53a05b918e548c6c0d574b7d5",
      username: "bfchain57",
    },
    {
      secret:
        "escape shaft october main library snow fury alone demand work number muscle message slot armed custom dawn alone search isolate erase unfair scheme wing",
      address: "c9JpYqYPy5ZwkP9dqP7uYsW2jUqjWK12Zy",
      publicKey: "075ffcc87fc76629ff299fc43deb626c49ceb8338a39f3aade91c51fa60beb01",
      username: "bfchain58",
    },
    {
      secret:
        "tackle lava stool cousin dress head math report wide bicycle flat half clog round arrest impose armor shove sock okay narrow slot adjust first",
      address: "cBX5XCMHodUGz6xHPKkS5jeb7kt1rrgqwb",
      publicKey: "529ce0a0387d4ca1eea1a8960e05f3148b810a8e6f231441fd54cd9790d94640",
      username: "bfchain59",
    },
    {
      secret:
        "ancient crew glory intact enroll toy comic taste risk into index fortune first tiger physical gas whisper route broccoli joke congress leg grid cycle",
      address: "cKyVC3hXc7ffCzEjDq1RHxqwi7DWiWSWRX",
      publicKey: "e954b7d9da27a1fa24a19b50363057385cee1ed1fe36342f13f6e2e4d5333c26",
      username: "bfchain60",
    },
    {
      secret:
        "brain deny pulp adapt need mercy play birth color ladder denial other offer travel melody bag theory drive detect vacant chunk know cause ozone",
      address: "cKgAdasSHc1T6zUXPnmYEEtjeX7qKi11xb",
      publicKey: "68ec954b3482bc57d9e2b91cc3d8dd5f5c96e40f33362785352776f39b078418",
      username: "bfchain61",
    },
    {
      secret:
        "champion young machine album input raven slice poem inform man palm enlist scrub private country social seven cabin elevator evolve abuse million cream crew",
      address: "c2pWhtuBZWGZHJVSoNJ3FYJfdjp1iyv8dr",
      publicKey: "a32afd128a1304aef88b4711939efa502c80cfa1aac3e043caafe99c08772e6e",
      username: "bfchain62",
    },
    {
      secret:
        "add moon noise practice scene actor general nasty journey glimpse must display chronic pact solve shallow accident vicious suffer river stand glide describe leisure",
      address: "cJXJ15YBxQ4zFU7vSUbeRwxgTmQncJy1CJ",
      publicKey: "2097332ece5c2f18b669164e1e74ff0951f71100d5c5b0f48fb1b62d27ed40eb",
      username: "bfchain63",
    },
    {
      secret:
        "visual divert fantasy reward baby submit fever source night social awful manage tornado silly nest expect ensure hazard foot number weasel swear adapt garden",
      address: "cD4uXeU9Aj7EpN9XLo5M5FqTMWofEjkuGT",
      publicKey: "fac1bac5476868ac44e9a03b05c5ac0cd785c155b42d086c3c3d74149b267070",
      username: "bfchain64",
    },
    {
      secret:
        "slender aisle miracle mimic helmet rubber claw check upper taste wire lake tunnel scheme develop talent all chef destroy allow claim draft equal clerk",
      address: "cFxUbicQgwjsrHQj5JzP5GabZQ5Ep8vTUi",
      publicKey: "39984010265035b1a9d51fcc104e9f5e5ee1578c18022cb59a853ae64af3c4bb",
      username: "bfchain65",
    },
    {
      secret:
        "cup swear vault aerobic submit puzzle camera work stomach push vibrant buddy bachelor clog wife you build misery feel garment mother river tribe roast",
      address: "cPZUAVCxZSwrodndzmCsVcP38BskQRF1ny",
      publicKey: "ed326b9daa5d56758e30b4a860f51ff2ae7ae5a4453f3222f7b6d2424a6e2bf7",
      username: "bfchain66",
    },
    {
      secret:
        "head island judge rely betray raven pass steak marble economy sketch pave tail tattoo one enhance vault cliff deer pause toilet absent energy almost",
      address: "cEo8s28oP5BLE1vEG6VRTmZbfdJD4M1Coe",
      publicKey: "2dad8daf2fe3b1f50198621f3455e71ff177fcc0673a4613dcc47c7b277ebbee",
      username: "bfchain67",
    },
    {
      secret:
        "cereal roast ticket clarify picture thank merge rally blast bag wide shrug famous hover fee bone junk denial dirt helmet roof saddle infant capable",
      address: "c2KFmSdk8PcqcWuwDFhATW5VRJcs6xM4gn",
      publicKey: "812b61874cef62fb5e432da2bf803117bb24b7df8fa0a87baac47b96a9f3c07a",
      username: "bfchain68",
    },
    {
      secret:
        "minimum mimic fly win valley cash mosquito genuine exotic reason toward royal omit tiny slim naive help duty link noodle smile squirrel hire buyer",
      address: "c3z5iLu15V6dfX988fugq2vP1FRgda1DEk",
      publicKey: "6fa5a782acd2d463376fdc75001c2230fd9d10fca5a37be0fbebab917fa518c1",
      username: "bfchain69",
    },
    {
      secret:
        "toast love rude breeze charge reduce happy explain cry eye surround canvas swallow say impact crush glide hope radar legal own base arrive obey",
      address: "cGELZtTz3qzbcAS9svzQjesXTB46ytduwg",
      publicKey: "47fefc1b8c63859932d539e1b4380dde9a60b458a6533d67ee6469449c859432",
      username: "bfchain70",
    },
    {
      secret:
        "frame kidney donkey lazy symptom buyer talk hello purpose obey noodle toy caught job chapter broom alcohol scrub oppose joke later seven negative punch",
      address: "c6YdR5inKH4ZCWMiLS8MYYq1fGGXGE4mUw",
      publicKey: "db36c47807706549763e6e21ac6d5ca5b9c8fdce473041f466469c7fa3ef7079",
      username: "bfchain71",
    },
    {
      secret:
        "rally soul battle right crane index drive bike climb tank mule list fragile angle lion arch host plug object coin panic oval dad load",
      address: "cNtaqym4McrXt5pQZPtQCR7LyhE5pUsUCe",
      publicKey: "c705283d0ea0280987632d4b26f15bbae1a691d027159c2472bac89df3afe7dc",
      username: "bfchain72",
    },
    {
      secret:
        "total object clever rose topple fit fame barely angle wrist next collect easily install hotel kind image aware enhance release law clean tuition option",
      address: "cBsvWnbQtMhGvzj3BDpFpr3A4EZiPXXrRQ",
      publicKey: "cde905baa5c522a4cfbf1e4476b621216b515dc7c72f48fe392237081ae220f1",
      username: "bfchain73",
    },
    {
      secret:
        "woman sentence cabbage woman vault mandate honey parade earn angry flame inflict fault picnic night chest small bitter expire duty focus belt vault put",
      address: "cPBhhsQsNTKKkQw4DaYESjmBGFZZgiXJrK",
      publicKey: "2b20ab388cbc0dd96d8c4fcbf9af115331c3619e0991222d19e1a480c9040187",
      username: "bfchain74",
    },
    {
      secret:
        "pair bounce patient autumn damage dish finger grass silver measure license holiday tortoise whale knife peasant confirm emotion chapter shaft motor vehicle cave impose",
      address: "cQ88bJLhefXDhHwUorVeHKQhJrm2tDqkgM",
      publicKey: "a76e7a915618babf6aafe62d99790a324df69b90bf38195e8af8ef9114c58446",
      username: "bfchain75",
    },
    {
      secret:
        "toward foam best truly coil purse bone shallow truck symptom what armed crystal stumble plate fault poverty deputy toy damp bubble betray follow swift",
      address: "c5q6xxt1RkYYM1EXZGjwhPoU8y3K5uAkpX",
      publicKey: "0a307e1dd662b7c3ea79eb5798cf12694eed06a7dd1c6e6b6f05a94536b9e64e",
      username: "bfchain76",
    },
    {
      secret:
        "poem before nominee bulk pride parade rack embark arctic sausage secret business unfold walk denial sound cousin soon despair wedding brave toast jealous quantum",
      address: "c7ij2QbLpRFSuZGB9bD7zPf8WYHg82ZY53",
      publicKey: "c22c3f6cd2dcd3b5ba955682dc7ce1a730548a70700f22904bafdddde1c1a816",
      username: "bfchain77",
    },
    {
      secret:
        "attract below remember nominee canvas before demand absent kiwi agree refuse dry obtain knife sample cabbage tongue address hurdle discover impulse century remind cricket",
      address: "c37jstTJJLuNuvERbc6MJbMkU1mPegQUoA",
      publicKey: "baaec8156685f700067d9d0a3907a6a12815aa83bbd27820e22ab4733ddb7735",
      username: "bfchain78",
    },
    {
      secret:
        "result patrol budget release profit bridge undo mother nominee digital flash model issue post noodle smile athlete program small left goose cage mail scissors",
      address: "cF6DjxtfzvJjbqvwWGb2AvUcwEkk6rBFm9",
      publicKey: "f7ac89e06dc27281f1ad04985693c10da5a4a9c6c16bddce146598524167b8ef",
      username: "bfchain79",
    },
    {
      secret:
        "picnic length planet inside warfare ordinary category pony coin warrior join novel capable absent favorite rich clean next enhance coconut zone seven grape annual",
      address: "c8PLVcgfgeMreGxVQxi8r42W4ZDukEB3M3",
      publicKey: "d9dea28e2ecc20af58d717a7172cf2fa18916f1e04533dac155b0fce5b37e199",
      username: "bfchain80",
    },
    {
      secret:
        "lady draft south video oppose true castle turkey because win bid group bus morning raw omit boy echo cruel include pilot film sort ramp",
      address: "cFybQsjHqiX1DUbtZFXDPihvDeTveZQKkw",
      publicKey: "3ab4859059291b9bccdaa7c8dc1b149d3401117d6aafe06949790831689328dc",
      username: "bfchain81",
    },
    {
      secret:
        "forward before tent weasel poet ecology assist mesh lyrics winner ramp isolate soccer embrace feel forget salt second limit borrow mass walk flock fold",
      address: "c2ffGmyB8nMhkemELfsjNDsdG4t1EMeomv",
      publicKey: "8e269c84069fea87b1e13d94cc8860af5e1d3d2159a15c0449dab7455f4380e8",
      username: "bfchain82",
    },
    {
      secret:
        "wood police public notice twice subway dose ginger album radar helmet term orange that infant wife matter duck select fiscal hunt divert lady priority",
      address: "c6bVeNUiLwSW3SGz38yv6w54JXphzxY3d3",
      publicKey: "79617acf3c8d1d2bd2b7298b109eb7259f3503d29b56f0631d464186267237f6",
      username: "bfchain83",
    },
    {
      secret:
        "winter burger auction orange today accuse assume save color artefact bonus stand choose miss double crowd bulb gun fatal enrich essence subway practice captain",
      address: "cFyn4v8T5ckT28MW17iUvvuK4Uk7nrpdZj",
      publicKey: "9187f22777d893d27b0da5c80d49fa63ed7dae55776b6f1f5fafce3264197b6d",
      username: "bfchain84",
    },
    {
      secret:
        "flee rapid bird trend rent student olive narrow raw ecology slush wish day improve blame alone cliff unfair reunion merry cabin puppy dirt journey",
      address: "cMHuDEGM4CUE1wDbY2chPWjP8P1KJMWsVN",
      publicKey: "ba56048e7e7c36c8bb48deb4ad66f97acb818585ae1fb7a9ac7a6c6071a4a71f",
      username: "bfchain85",
    },
    {
      secret:
        "rent icon voice orphan nominee slide shiver slogan diagram hour pyramid attack spawn reunion industry illegal script purity clerk soup issue wall sail path",
      address: "c9Hzte1gK9ekxMaXDfAS7SH8cTZ2ZaTip4",
      publicKey: "2793e087ff4646146bc8d2e0b3c3977cbad6c165b3e97c71b4b9c37ebd88e7b0",
      username: "bfchain86",
    },
    {
      secret:
        "alter hero inform refuse feature guitar thumb bottom refuse caution increase refuse desk dance child shaft tell document lens chalk keep cart same fossil",
      address: "cDGZW6UisKZtt61rFmdMGZufCqtbWP9sLe",
      publicKey: "307755af307d4952afe1dd833377a2c2307b2bd604ddb0d8256e06b19dfad7bc",
      username: "bfchain87",
    },
    {
      secret:
        "behind tell nephew share decline pill couple ivory silly bounce undo portion address wonder human eagle pill bounce fiction luggage mouse stock material crash",
      address: "cGqWH1HYoZmFcpRbPfrE63u9SBxxLxN4Cp",
      publicKey: "20141cef3e129cec822726a84b79f617370554a53636acf5ad1dbd15e22c15d6",
      username: "bfchain88",
    },
    {
      secret:
        "cart equal strategy very town river course edge small erode violin remain reform scorpion odor drip build trophy aware zebra unveil equal jeans bird",
      address: "cLShHjVpQwRFy2pTLZ5wxDUBuULPXgNd5w",
      publicKey: "fb5fae3da253f5a2c0c55c09376694efb13cd9d34401b4610e49f1f8bead26d8",
      username: "bfchain89",
    },
    {
      secret:
        "pretty huge copy again across inform excuse release since burst spray display rib shock pond luxury one tool dumb scrap pizza album okay pledge",
      address: "cJQtvwgB96A7fZMppeRE6tkNsykg7KQEsJ",
      publicKey: "b32e3c4c0476b888f52823e9367c5e829739239fb199f716febef1a3c448dec0",
      username: "bfchain90",
    },
    {
      secret:
        "dutch humor pepper cave slogan vanish absorb merit pen bid decrease level chuckle ride job harbor lonely cash awake broom erosion tattoo fatal diary",
      address: "c3pPiHJASHMkxFxzStA1WLnagHxHnsZcD1",
      publicKey: "ccd86ffb72624af1320b292c36fde85232b130814c34c8f19ed4c78adbd71d45",
      username: "bfchain91",
    },
    {
      secret:
        "meat engine blouse maid live best apple latin rough act goat clerk ladder foam live blue witness embody system recycle cup marble amused water",
      address: "c32KRhr1wZc8MKRPrEy1LBdojmAFLwpDN9",
      publicKey: "b0ec90d73d241400359e784b573c162a58c209a3d8d0e1568411512c621d2810",
      username: "bfchain92",
    },
    {
      secret:
        "entry reopen quick inflict appear foam chest spider artefact satoshi fringe cluster twist hill crime novel vault protect term virtual news unique merit future",
      address: "cHtrhRxSd6HgoFApv3Ww5T9BJSpzunrK74",
      publicKey: "d5eebd5a5e2aa0db54635ff339e5389ed0249105d2fd7cc504b8cb59e56acca7",
      username: "bfchain93",
    },
    {
      secret:
        "remind hard argue keep brown primary clap silk grass snap pen fancy party maid shy size rent always creek analyst mix adjust country bicycle",
      address: "cEo4bdeV2XJ3kUKp9EeTGGAC6rTejSg1Ny",
      publicKey: "2132cc765a20ac50940a42e949b04b44f904424c8a9675c1ddd69c421aed168f",
      username: "bfchain94",
    },
    {
      secret:
        "fog region clean room mammal debate because pencil wrestle sure priority royal castle industry code solve rich riot destroy axis execute bulb ceiling ancient",
      address: "cDhdyM63XaEsjsfrgU2CsN8Cn63Ni5QAzc",
      publicKey: "6b946d6940475b437d2127406090bb85165066a184061c7e384f7b7933b2cf41",
      username: "bfchain95",
    },
    {
      secret:
        "love swarm buzz east blouse pave media invite kind violin jelly refuse voice sword derive lion census circle asset idle staff lab oppose orange",
      address: "cALZico86XyeSaK3zTXMVtq6AUPqmrh6JV",
      publicKey: "68e6b1b3090aa52650b4216374c8ac386ac644eb50bcc625f65c65b28bf96951",
      username: "bfchain96",
    },
    {
      secret:
        "shrimp local act arrange idle book ship again calm penalty private summer whale give grain three oyster where dumb just wisdom atom over problem",
      address: "c5qUNZkdEgg62fGSWwU29yya7vVQET7xkt",
      publicKey: "f61913ec3508f1a83091ec35cbe10a9d5a94ce25c9acf7d2b220d8f2d531c64c",
      username: "bfchain97",
    },
    {
      secret:
        "license mountain practice neutral have ginger engage crunch about decide december lonely rack report speak injury rate correct grape cannon original blanket supreme atom",
      address: "cMbuszd6xHhsXa4qrSNHVEe7Z8Pr3TNneP",
      publicKey: "a541af049fc00965a0371a7fe002ca65f77245b36a33fe7b439311ac46025e42",
      username: "bfchain98",
    },
    {
      secret:
        "subway assault impose citizen miss organ fee nephew police custom thank cruise atom typical palace melt canoe bench trust earth dwarf fitness verify trend",
      address: "cN1r6YA2rpKwqyUQBo5eBfcbETXSYK8aWn",
      publicKey: "b59f6332d2d2085bcac3a38bddd52cb4b26b74f3fbefb2dc680cf3c4c42f3f51",
      username: "bfchain99",
    },
    {
      secret:
        "naive ecology prefer detail this original weather garage home panic vanish today believe develop volume uniform acoustic exist pyramid poet faint poem detail nephew",
      address: "cP3KZJfNBYLxVjR6Mi3CG8LAEgt97N8t55",
      publicKey: "59757853034371e5694df709f5040693502357f6997ba6b6c1502952f19d423c",
      username: "bfchain100",
    },
    {
      secret:
        "sort over wave loop joke space shy impulse media shop laugh such super board kid ten midnight you october tiny alley lobster assist capable",
      address: "cFf3VzWCjKv5VvYmLhzRkQZPhNQn8vANLz",
      publicKey: "aba071279e07adb5f36860b97a4e14d88647870d76f74f5affff853611e9ec07",
      username: "bfchain101",
    },
    {
      secret:
        "knock tray cereal arrange gaze wet tattoo empty winner magnet author civil curve random stone luxury visa depart holiday fresh inherit unable inhale cushion",
      address: "cCtpNbbApgDAuX38sJqLG2PERUsor94MHz",
      publicKey: "52f747eefbd33cf59152e0ac7cc96e5f108bf6c019de41e531cadee87372e244",
      username: "bfchain102",
    },
    {
      secret:
        "finish vibrant cattle dry program clump throw fiction awake enact special coin initial first merit melody toss edit rule observe change tribe own try",
      address: "c4giVDb2U9jr5WVUGg294bGwgCSKDz2xzJ",
      publicKey: "57344eec65bd9781b75ec76cac91ec3628c3518fdebcdfaad76d3ee39242b224",
      username: "bfchain103",
    },
    {
      secret:
        "toy ketchup iron cotton hobby advice ankle where soap dune favorite run august club ordinary shell state state side silver vocal ceiling cute banner",
      address: "cHMAxcAu6u3LEpfpCqJHD39unJtHCppfa7",
      publicKey: "f5d4b9364b3dfc501bc30084ba653c8be0fc4bc8110b15501166efa636ec4651",
      username: "bfchain104",
    },
    {
      secret:
        "cinnamon trophy frown witness oblige because pizza awake give mutual hurt orphan any cross have manual calm chimney pluck measure rather hunt split brand",
      address: "cNdBX3dCDfPGyvuAbbuBmWfSfXJ5D32xK1",
      publicKey: "402098d9dd301504e20ecb064263599390c31dec39ffdad63415b3aa433d64a3",
      username: "bfchain105",
    },
    {
      secret:
        "sort sign time exchange crystal paper bonus private fancy vicious insane arch turn hard normal fly legal crane sight bubble human situate moment buzz",
      address: "cMg3Pj5Mb8YnwQeeWmBKsPt8Zjgu4FHL9Y",
      publicKey: "76f185b29ae7f0b4b5e7c65433393badbbdc58025df9f5061eae2f7c709983e6",
      username: "bfchain106",
    },
    {
      secret:
        "pelican erode butter now napkin pulse mimic record sport update curtain casual plug segment person couple outer olympic term resource little penalty keen treat",
      address: "cAkwj6utxuRKErXYHYnisXGJjqsQVdsuqA",
      publicKey: "94b179b6151d1f1a3e64336f97b0be20e6413ab360f438d4f95732726f1be48f",
      username: "bfchain107",
    },
    {
      secret:
        "pact banana jealous twin north bright flash behind limb drum differ common journey climb cotton indoor lady senior slogan olive approve maximum clump fit",
      address: "c5RqaMzZGzMsmgQb533GSLWG64uKHJSJjB",
      publicKey: "d87a19061e09d97768626b69999d361f950f072395bae7f9351f98c01c2e1323",
      username: "bfchain108",
    },
    {
      secret:
        "skin phone web there strong diagram interest bachelor issue wide air harbor music quantum ability daughter that review water promote buyer wire company wide",
      address: "c4q2hHccaS3qcXGMqsGcasjbvj9aJsCuuy",
      publicKey: "cbb4a2b850722afbab9cd3ee7052d39f3a49c90fefdb6ba2003dc9b599dd5cce",
      username: "bfchain109",
    },
    {
      secret:
        "violin random grab swarm pave dumb analyst ozone issue grit cargo demise excuse exact cactus roast memory parrot impact expect often hold gospel expect",
      address: "curtHB91mSGD2bK3SPXzS8vAfctvB5ZGc",
      publicKey: "bb4ab0000e32777b8b1c6357b5726c53ab029946285baa71d0d6a351b663e544",
      username: "bfchain110",
    },
    {
      secret:
        "leisure festival ugly cruel expire lunar ten where wing wreck display cloth scrap museum tube fee half rain reopen answer win neck bomb bag",
      address: "cD6KwXfyUCPSscZoy3HeFuM3bFp4EvDpbe",
      publicKey: "c6f85e5bc1d483ba75de1623294de65b51fc72037b95b18a42883264b2cc7b28",
      username: "bfchain111",
    },
    {
      secret:
        "business firm reflect before ridge bounce keen special hidden film wash ensure captain stem flame second firm affair casino rude recipe social slogan pet",
      address: "cQEA1sRwbNVzMJTD85oGKQF87bX7xTet6d",
      publicKey: "34e519b37e76abe8f73035d90e5165f052d4c1a5383fec0a3c264c76316c08a2",
      username: "bfchain112",
    },
    {
      secret:
        "learn east letter dizzy segment obscure shove reopen upset impact sort fun sing trade cinnamon regret aunt citizen beach truly drift eternal cube stamp",
      address: "cLR1q2Xobq6SLdbcGSmzx3USwuEReKyKdN",
      publicKey: "8bc5e9062bf0dff4ecd4a58e960b2741d7e8a7d223f154f12f45f16cad6130e2",
      username: "bfchain113",
    },
    {
      secret:
        "very found ice guilt what inform arm relief reopen talent traffic drill flash inner donate salad vote scout ghost desk alter later cycle suffer",
      address: "cLwXBhfqd6PR2R6JdjkGc3LSwMPjsK1gKF",
      publicKey: "b97f8d327a9cc247a4d8c48154f20d722b3245ff9431b12db61198a1d92af3ab",
      username: "bfchain114",
    },
  ];
  /** 随机获取下一轮的打块人*/
  const randomNextGenerators = (
    generators: string[] = bfchainCore.transactionHelper.genesisDelegates(),
  ) => {
    const randoms: number[] = [];
    while (true) {
      const random = Math.floor(Math.random() * generators.length);
      if (!randoms.includes(random)) {
        randoms.push(random);
      }
      if (randoms.length === bfchainCore.config.blockPerRound) {
        break;
      }
    }
    return randoms.map((v) => generators[v]);
  };
  const blockMap = new Map<number, BFChainCore.BlockJSON<any>>();
  blockMap.set(1, bfchainCore.config.genesisBlock);

  function getChainOnChainHash(height: number) {
    let lastRoundLastBlockHeight =
      bfchainCore.blockHelper.calcRoundStartHeight(
        bfchainCore.blockHelper.calcRoundByHeight(height),
      ) - 1;
    lastRoundLastBlockHeight = lastRoundLastBlockHeight === 0 ? 1 : lastRoundLastBlockHeight;
    const blocks: BFChainCore.BlockJSON<any>[] = [];
    for (let _height = lastRoundLastBlockHeight; _height < height; _height++) {
      const block = blockMap.get(_height);
      if (block) {
        blocks.push(block);
      }
    }
    const payloadHash = bfchainCore.cryptoHelper.sha256();
    const firstRow = blocks[0];
    if (firstRow.height === 1) {
      payloadHash.update(Buffer.from(firstRow.signature, "hex"));
    } else {
      payloadHash.update(Buffer.from(firstRow.asset.roundLastAsset.chainOnChainHash, "hex"));
    }
    for (let i = 1; i < blocks.length; i++) {
      payloadHash.update(Buffer.from(blocks[i].signature, "hex"));
    }

    const hashString = payloadHash.digest().toString("hex");
    return hashString;
  }

  const generatorsMap = new Map<
    string,
    { pk: string; address: string; keypair: BFChainCore.Keypair }
  >();
  for (const v of generatorsArr) {
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(v.secret);
    generatorsMap.set(v.address, { pk: v.publicKey, address: v.address, keypair });
  }

  //const map = new Map();
  const lastBlock = {
    signature: bfchainCore.config.genesisBlock.signature,
    timestamp: bfchainCore.config.genesisBlock.timestamp,
    height: bfchainCore.config.genesisBlock.height,
    previousBlockSignature: bfchainCore.config.genesisBlock.signature,
  };
  let count = 0;

  const tryGenerateBlock = async (
    result: {
      address: string;
      timestamp: number;
    },
    label = "",
    disableLog?: boolean,
  ) => {
    if (pickGenerators.includes(result.address)) {
      lastBlock.timestamp = result.timestamp;
      lastBlock.height += 1;
      const generator = generatorsMap.get(result.address);
      if (generator) {
        const asyncIteratorGenerator = new AsyncIteratorGenerator<TransactionInBlock>();
        asyncIteratorGenerator.done();
        const newBlock: BFChainCore.BlockBody = {
          version: bfchainCore.config.version,
          height: lastBlock.height,
          timestamp: result.timestamp,
          generatorPublicKey: generator.pk,
          previousBlockSignature: lastBlock.previousBlockSignature,
        };
        const generateBlockEventEmitter: any = new QueneEventEmitter<any>();
        generateBlockEventEmitter.startTindexGetter = async () => {
          return 0;
        };
        if (lastBlock.height % bfchainCore.config.blockPerRound !== 0) {
          const commonBlock = await bfchainCore.block.generateBlock<CommonBlock>(
            CommonBlockFactory,
            newBlock,
            {
              commonAsset: {
                assetChangeHash: "",
              },
            },
            asyncIteratorGenerator,
            generator.keypair,
            undefined,
            generateBlockEventEmitter,
            {} as any,
          );
          lastBlock.previousBlockSignature = lastBlock.signature;
          lastBlock.signature = commonBlock.signature;
          blockMap.set(lastBlock.height, commonBlock);
        } else if (lastBlock.height % bfchainCore.config.blockPerRound === 0) {
          // 本轮打块的人
          const roundStartHeight = bfchainCore.blockHelper.calcRoundStartHeight(
            bfchainCore.blockHelper.calcRoundByHeight(lastBlock.height),
          );
          const thisRoundGenerators: string[] = [];

          for (let _h = roundStartHeight; _h < lastBlock.height; _h++) {
            if (_h === 1) {
              continue;
            }
            const _block = blockMap.get(_h);
            if (_block) {
              thisRoundGenerators.push(
                await bfchainCore.accountBaseHelper.getAddressFromPublicKeyString(
                  _block.generatorPublicKey,
                ),
              );
            }
          }

          thisRoundGenerators.push(generator.address);
          const _pickGenerators: string[] = [];
          generatorsArr.forEach((v) => {
            if (!thisRoundGenerators.includes(v.address)) {
              _pickGenerators.push(v.address);
            }
          });

          let chosenAddress: string[];
          if (bfchainCore.blockHelper.calcRoundByHeight(lastBlock.height) % 2 === 0) {
            chosenAddress = bfchainCore.transactionHelper.genesisDelegates().slice(0, 57);
          } else {
            chosenAddress = bfchainCore.transactionHelper.genesisDelegates().slice(57, 114);
          }
          const nextRoundGenerators = chosenAddress.map((v) => {
            return { address: v, numberOfEntities: 0 };
          });
          // const nextRoundGenerators = randomNextGenerators(_pickGenerators,).map(v => {
          //   return { address: v, equity: "0" };
          // });
          // print(`height: ${lastBlock.height} nextRoundGenerators`);
          // print(nextRoundGenerators);
          const roundLastBlock = await bfchainCore.block.generateBlock<RoundLastBlock>(
            RoundLastBlockFactory,
            newBlock,
            {
              roundLastAsset: {
                nextRoundGenerators: nextRoundGenerators,
                chainOnChainHash: getChainOnChainHash(lastBlock.height),
                assetChangeHash: "",
              },
            },
            asyncIteratorGenerator,
            generator.keypair,
            undefined,
            generateBlockEventEmitter,
            {} as any,
          );
          lastBlock.previousBlockSignature = roundLastBlock.signature;
          lastBlock.signature = roundLastBlock.signature;
          blockMap.set(lastBlock.height, roundLastBlock);
        }
      }
      disableLog ||
        print(
          `${label}生成区块 ${lastBlock.signature.substr(0, 5)} ${lastBlock.height}. ${
            result.address
          } time: ${result.timestamp} `,
        );
      return generator;
    } else {
      disableLog ||
        print(`${label}这个人掉线了 ${result.address} ${lastBlock.height}. ${result.timestamp} `);
    }
  };

  const MAX_TO_TIMESTAMP = fakeTimestamp - bfchainCore.config.forgeInterval;
  let missTimestamp = MAX_TO_TIMESTAMP;

  console.time("zz");
  zz: while (true) {
    let hasResult = false;

    if (lastBlock.height === 9) {
      debugger;
    }
    for await (const result of bfchainCore.block.blockGeneratorCalculator.calcGenerateBlockGeneratorIterator(
      {
        timestamp: lastBlock.timestamp,
        height: lastBlock.height,
      },
      { toTimestamp: MAX_TO_TIMESTAMP },
    )) {
      hasResult = true;
      if (result.timestamp % (bfchainCore.config.forgeInterval * 1000) === 0) {
        console.line(
          `预生成中:${Math.min(100, (result.timestamp / MAX_TO_TIMESTAMP) * 100).toFixed(2)}%  `,
        );
      }
      const fastResult =
        await bfchainCore.block.blockGeneratorCalculator.fastCalcGenerateBlockGenerator(
          {
            timestamp: lastBlock.timestamp,
            height: lastBlock.height,
          },
          { toTimestamp: result.timestamp },
        );
      console.assert(
        fastResult.timestamp === result.timestamp && fastResult.address === result.address,
        `${[fastResult.timestamp, result.timestamp]},
        ${[fastResult.address, result.address]}`,
      );

      if (await tryGenerateBlock(result, `BLOCK[${lastBlock.height + 1}]:`, true)) {
        // console.log(`~`);
        break;
      }

      if (result.timestamp >= MAX_TO_TIMESTAMP) {
        missTimestamp = result.timestamp;
        break zz;
      }
    }

    // if (lastBlock.height >= generateCount) {
    //   console.log(lastBlock.height, generateCount);
    //   console.log(lastBlock.height, generateCount);
    //   console.log(lastBlock.height, generateCount);
    //   console.log(lastBlock.height, generateCount);
    //   break zz;
    // }
    if (!hasResult) {
      break;
    }
  }
  console.timeEnd("zz");

  // do {
  //   count++;
  //   const result = await bfchainCore.block.blockGeneratorCalculator.calcGenerateBlockDelegate({
  //     timestamp: lastBlock.timestamp,
  //     height: lastBlock.height,
  //   });
  //   // if (lastBlock.height > 1) {
  //   //   if (map.get(lastBlock.height - 1).missAddress.length > 0) {
  //   //     print(map.get(lastBlock.height - 1).missAddress);
  //   //   }
  //   // }
  //   await tryGenerateBlock(result);

  //   bfchainCore.time.time_offset_ms += bfchainCore.config.forgeInterval * 1000;
  //   if (lastBlock.height >= generateCount) {
  //     break;
  //   }
  //   // if(c
  // } while (true);

  // const countMap = new Map<string, { length: number; block: number[] }>();
  // for (const [k, v] of blockMap) {
  //   const address = await bfchainCore.accountBaseHelper.getAddressFromPublicKeyString(
  //     v.generatorPublicKey,
  //   );
  //   const count = countMap.get(address);
  //   if (count) {
  //     count.block.push(k);
  //     count.length = count.block.length;
  //   } else {
  //     countMap.set(address, { block: [k], length: 1 });
  //   }
  // }
  // // print(countMap);
  // let total = 0;
  // countMap.forEach((v, k) => {
  //   // print(`${k}: ${v.length}`);
  //   total += v.length;
  // });
  // print(`共循环${count} . 区块: ${total}`);
  // console.log(blockMap)
  console.log(isVerify);
  let addressCount: { [address: string]: number } = {};
  if (isVerify) {
    for (let i = 2; i < blockMap.size; i++) {
      const block = blockMap.get(i);
      const _lastBlock = blockMap.get(i - 1);
      // console.time(`cost`);
      if (block && _lastBlock) {
        // print(`开始验证${block.height}`);
        const calcGenerateBlockGenerator =
          bfchainCore.block.blockGeneratorCalculator.calcGenerateBlockGeneratorIterator({
            timestamp: _lastBlock.timestamp,
            height: _lastBlock.height,
          });
        for await (const { address, timestamp } of calcGenerateBlockGenerator) {
          // print(timestamp,block.timestamp)
          if (timestamp === block.timestamp) {
            const _address = await bfchainCore.accountBaseHelper.getAddressFromPublicKeyString(
              block.generatorPublicKey,
            );
            if (addressCount[_address]) {
              addressCount[_address]++;
            } else {
              addressCount[_address] = 1;
            }
            // print(`verify ${i} right address: ${address} timestamp: ${timestamp}`);
            if (address !== _address) {
              throw new Error(`${i} eee ${address} .. ${_address}`);
            }
            break;
          }
        }
      }
      // console.timeEnd(`cost`);
    }
  }
  console.log(addressCount);
})().catch((e) => {
  print(e);
});
// {
//   test("calcGenerateBlockDelegate", async t => {
//     const currentHeight = 98;
//     const curBlock = await bfchainCore.blockHelper.forceGetBlockByHeight(currentHeight);
//     const curTime = 1557388690881;
//     let usedPublicKeys = new Map();
//     const res = await bfchainCore.block.blockGeneratorCalculator.calcGenerateBlockDelegate(
//       curBlock,
//       {
//         usedPublicKeys,
//         curTime,
//       },
//     );
//     // print("res:", res);
//     const signature = (await bfchainCore.blockHelper.forceGetBlockByHeight(currentHeight)).signature;
//     const index =
//       _getStringASCIICodeSum(signature + curTime) % (blockPerRound - (currentHeight % blockPerRound));
//     // print("signature:11111", signature, index, addressArr[index].address, usedPublicKeys.length);
//     t.deepEqual(res, {
//       address: "rey9zvi66m9yzxhb845ipey98ojw96wokcwdd81duvcgy9amqsf1mubr4j889dl5",
//       timestamp: 11116690,
//     });
//   });
// }
// {
//   test("calcGenerateBlockDelegate_genesisBlock", async t => {
//     const currentHeight = 3;
//     const curBlock = await bfchainCore.blockHelper.forceGetBlockByHeight(currentHeight);
//     const curTime = 1557388690881;
//     let usedPublicKeys = new Map();
//     const res = await bfchainCore.block.blockGeneratorCalculator.calcGenerateBlockDelegate(
//       curBlock,
//       {
//         usedPublicKeys,
//         curTime,
//       },
//     );
//     // print("res2:", res);
//     const signature = (await bfchainCore.blockHelper.forceGetBlockByHeight(currentHeight)).signature;
//     const index =
//       _getStringASCIICodeSum(signature + curTime) % (blockPerRound - (currentHeight % blockPerRound) + 1);
//     // print("signature:22222", signature, index, addressArr[index].address, usedPublicKeys.length);
//     t.deepEqual(res, { address: "cM8wVfYBZq6KtXCKAobMH9g9jLTcSfCiw5", timestamp: 11116690 });
//   });
// }
