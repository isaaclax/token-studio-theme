const fs = require('fs');

// Load the token file
const rawData = fs.readFileSync('tokens.json');
const tokens = JSON.parse(rawData);

// Extract the primitive token set
const primitive = tokens['primitive'] || {};

// Validate required keys
const requiredKeys = ['palette', 'typography'];
const missingKeys = requiredKeys.filter(key => !(key in primitive));
if (missingKeys.length > 0) {
  throw new Error(`Missing required keys in token file: ${missingKeys.join(', ')}`);
}

// Helper function to extract $value from nested token structure
function extractValues(tokenSection) {
  const result = {};
  for (const key in tokenSection) {
    const value = tokenSection[key];
    if (typeof value === 'object' && '$value' in value) {
      result[key] = value['$value'];
    } else if (typeof value === 'object') {
      result[key] = extractValues(value);
    }
  }
  return result;
}

// Build MUI theme object
const muiTheme = {
  breakpoints: extractValues(primitive['breakpoints']),
  palette: extractValues(primitive['palette']),
  typography: extractValues(primitive['typography']),
  spacing: extractValues(primitive['spacing']),
  shape: extractValues(primitive['shape']),
  iconSize: extractValues(primitive['iconSize'])
};

// Output to theme.js
const output = `const theme = ${JSON.stringify(muiTheme, null, 2)};\n\nexport default theme;`;
fs.writeFileSync('theme.js', output);

console.log('MUI theme successfully generated in theme.js.');
