const fs = require("fs");
/*
//readFileSync
console.log("A");
const result = fs.readFileSync("syntax/sample.txt", "utf-8");
// 'utf-8' 사람이 읽을수 있는 형식으로 변환
console.log(result);
console.log("c");
> abc
*/

// 비동기
console.log("A");
fs.readFile("syntax/sample.txt", "utf-8", (err, result) => {
  console.log(result);
});
console.log("c");
// acb
