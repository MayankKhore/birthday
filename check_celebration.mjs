import fs from "fs";
let content = fs.readFileSync("src/components/experience/BirthdayExperience.tsx", "utf8");
const lines = content.split("\n");
// celebration case starts at line 267 (0-indexed: 266)
for (let i = 266; i < 290; i++) {
  console.log("Line " + (i+1) + ": " + lines[i]);
}
