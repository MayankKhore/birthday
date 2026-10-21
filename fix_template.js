const fs = require('fs');
let content = fs.readFileSync('src/components/experience/BirthdayExperience.tsx', 'utf8');

// Fix the mangled template literal in photo gallery
content = content.replace(/style=\{\{ animationDelay: \\\\\\\\ms\\\\\\\\ \}\}/g, 'style={{ animationDelay: \ms }}');

// Fix any other similar patterns
content = content.replace(/\\\\\\\\ms\\\\\\\\/g, '\ms');

// Fix escaped backticks in style attributes
content = content.replace(/style=\{\{ animationDelay: \\\\\\$\\{150 \\+ idx \\* 100\\}ms \}\}/g, 'style={{ animationDelay: \ms }}');

// Fix any remaining double-escaped backslashes before backticks
content = content.replace(/\\\\\\\\/g, '');

fs.writeFileSync('src/components/experience/BirthdayExperience.tsx', content);
console.log('Fixed template literals');
