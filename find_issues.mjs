import fs from "fs";
let content = fs.readFileSync("src/components/experience/BirthdayExperience.tsx", "utf8");
const lines = content.split("\n");
lines.forEach((line, i) => {
  if (line.includes("\\") && !line.includes("\\\\") && !line.startsWith("//")) {
    console.log("Line " + (i+1) + ": " + line.trim());
  }
});
