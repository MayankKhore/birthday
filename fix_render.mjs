import fs from "fs";
let content = fs.readFileSync("src/components/experience/BirthdayExperience.tsx", "utf8");

// The renderScene function is missing its closing };
// Find the end of the switch statement (before the main return)
const switchEnd = content.lastIndexOf("      default:\n        return null;\n    }\n  };");  
console.log("Switch end index:", switchEnd);

// Check what comes after the switch
const afterSwitch = content.indexOf("  };", content.indexOf("const renderScene = () => {"));
console.log("First }; after renderScene:", afterSwitch);

// Add the missing }; before the main return
const mainReturnIdx = content.indexOf("  return (\n    <div className");
console.log("Main return index:", mainReturnIdx);

// Insert the missing }; before the main return
const beforeMainReturn = content.substring(0, mainReturnIdx);
const afterMainReturn = content.substring(mainReturnIdx);

// Check if }; already exists right before main return
if (!beforeMainReturn.trimEnd().endsWith("};")) {
  content = beforeMainReturn.trimEnd() + "\n  };\n\n" + afterMainReturn;
  fs.writeFileSync("src/components/experience/BirthdayExperience.tsx", content);
  console.log("Added missing }; before main return");
} else {
  console.log("}; already exists");
}
