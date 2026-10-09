const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'LandingPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  'bg-[#F6F8FB] dark:bg-[#05070B]': 'bg-background',
  'bg-[#F6F8FB]/80 dark:bg-[#05070B]/80': 'bg-background/80',
  'bg-white/50 dark:bg-white/5': 'bg-input', 
  'bg-[#0B1220] text-white dark:bg-white dark:text-[#0B1220]': 'bg-primary text-primary-foreground',
  'bg-[#0B1220]/5 dark:hover:bg-white/5': 'bg-primary/5 hover:bg-primary/10',
  'hover:bg-[#0B1220]/5 dark:hover:bg-white/5': 'hover:bg-accent hover:text-accent-foreground',
  'text-[#0B1220] dark:text-[#FFFFFF]': 'text-foreground',
  'text-[#0B1220] dark:text-white': 'text-foreground',
  'hover:text-[#0B1220] dark:hover:text-white': 'hover:text-foreground',
  'text-[#5B6575] dark:text-[#9AA3B2]': 'text-muted-foreground',
  'text-[#1D4ED8] dark:text-[#4FA3FF]': 'text-primary',
  'bg-[#1D4ED8]/5 dark:bg-[#4FA3FF]/10': 'bg-primary/10',
  'bg-[#1D4ED8]/10 dark:bg-[#4FA3FF]/10': 'bg-primary/10',
  'border-[#0B1220]/10 dark:border-white/10': 'border-border',
  'border-[#0B1220]/15 dark:border-white/15': 'border-border',
  'border-[#1D4ED8] dark:border-[#4FA3FF]': 'border-primary',
  'focus:ring-[#1D4ED8] dark:focus:ring-[#4FA3FF]': 'focus:ring-ring',
  'focus:border-[#1D4ED8] dark:focus:border-[#4FA3FF]': 'focus:border-primary',
  'via-[#F6F8FB]/50 to-[#F6F8FB] dark:via-[#05070B]/50 dark:to-[#05070B]': 'via-background/50 to-background',
  'bg-[#0B1220]/50 dark:bg-[#05070B]/80': 'bg-background/80',
  "isDark ? 'rgba(79, 163, 255, 0.4)' : 'rgba(29, 78, 216, 0.3)'": "isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'", 
  "isDark ? 'rgba(79, 163, 255, 0.9)' : 'rgba(29, 78, 216, 0.8)'": "isDark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.8)'",
};

for (const [oldStr, newStr] of Object.entries(replacements)) {
  content = content.split(oldStr).join(newStr);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced hardcoded classes in LandingPage.jsx');
