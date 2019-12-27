// import test from "ava";
// function getBenefitRate(N: number, hash: number, hash_max: number, n = 0): number {
//   if (N === 1) {
//     return 1;
//   }
//   const unit = hash_max / N;
//   if (unit < 1) {
//     if (hash > hash_max / 2) {
//       return 1;
//     } else {
//       return 0;
//     }
//   }
//   const x_start = Math.floor(hash / unit);
//   const x_end = x_start + 1;
//   let x_start_rate = 0;
//   let x_end_rate = 1;
//   for (let i = N, i_rate = 1; i >= 0; i -= 1) {
//     if (i === x_end) {
//       x_end_rate = i_rate;
//       x_start_rate = i_rate / 2;
//       break;
//     } else {
//       i_rate /= 2;
//     }
//   }
//   const end = x_end * unit;
//   const start = x_start * unit;
//   console.log("n", ++n);
//   if (Math.ceil(end) === Math.ceil(hash)) {
//     return x_end_rate;
//   } else if (Math.floor(start) == Math.floor(hash)) {
//     return x_start_rate;
//   }
//   const x_diff_rate = x_start_rate; //x_end_rate - x_start_rate;
//   return getBenefitRate(N, hash % unit, unit, n) * x_diff_rate + x_start_rate;
// }

// test("red-envelop benefit", t => {
//   console.log = t.log;
//   t.is(getBenefitRate(1, 2 ** 32 / 2, 2 ** 32), 1);
//   t.is(getBenefitRate(2, 2 ** 32 / 2, 2 ** 32), 0.5);
//   t.is(getBenefitRate(4, 2 ** 32 / 2, 2 ** 32), 0.25);
//   t.log(getBenefitRate(100, 2 ** 32 / 2, 2 ** 32));
// });
