import fs from "fs";
let content = fs.readFileSync("src/components/experience/BirthdayExperience.tsx", "utf8");
const lines = content.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("case")) {
    console.log("Line " + (i+1) + ": " + lines[i].trim());
  }
}
