const testFolder = "data"; //same ./data
const fs = require("fs");

fs.readdir(testFolder, (error, filelist) => {
  console.log(filelist);
});
