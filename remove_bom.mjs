import fs from "fs";
let content = fs.readFileSync("src/components/experience/BirthdayExperience.tsx", "utf8");
// Remove BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
  fs.writeFileSync("src/components/experience/BirthdayExperience.tsx", content);
  console.log("Removed BOM");
} else {
  console.log("No BOM found");
}
