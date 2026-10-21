import fs from "fs";
let content = fs.readFileSync("src/components/experience/BirthdayExperience.tsx", "utf8");

const bad = "animationDelay: ms\\ }";
const good = "animationDelay: `${150 + idx * 100}ms` }";
const escapedBad = bad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const regex = new RegExp(escapedBad, "g");
if (content.includes(bad)) {
  content = content.replace(regex, good);
  fs.writeFileSync("src/components/experience/BirthdayExperience.tsx", content);
  console.log("Fixed!");
} else {
  console.log("Pattern not found");
  const idx = content.indexOf("animationDelay");
  console.log("Found:", JSON.stringify(content.substring(idx, idx+30)));
}
