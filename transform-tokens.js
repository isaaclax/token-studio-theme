const fs = require('fs');

// Load the token file
const rawData = fs.readFileSync('tokens.json');
const tokens = JSON.parse(rawData);

// Extract the primitive token set
const primitive = tokens['primitive'] || {};

// Validate required keys
const requiredKeys = ['palette', 'typography', 'dimension'];
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

// Build base theme object
const baseTheme = {
  palette: extractValues(primitive['palette']),
  typography: extractValues(primitive['typography']),
  spacing: extractValues(primitive['dimension'])
};

// Add raw references (like h1, h2, h3) to the theme before resolving
if (primitive.typography.h1) baseTheme.typography.h1 = primitive.typography.h1['$value'];
if (primitive.typography.h2) baseTheme.typography.h2 = primitive.typography.h2['$value'];
if (primitive.typography.h3) baseTheme.typography.h3 = primitive.typography.h3['$value'];

// Helper function to resolve token references like "{typography.fontSize.5xl}"
function resolveReference(ref, theme) {
  const path = ref.replace(/[{}]/g, '').split('.');
  let value = theme;
  for (const key of path) {
    value = value?.[key];
    if (value === undefined) return ref; // fallback to original if not found
  }
  return value;
}

// Recursively resolve references in theme object
function resolveNestedReferences(obj, theme) {
  if (typeof obj === 'string' && obj.match(/^\\{[^}]+\\}$/)) {
    return resolveReference(obj, theme);
  } else if (Array.isArray(obj)) {
    return obj.map(item => resolveNestedReferences(item, theme));
  } else if (typeof obj === 'object' && obj !== null) {
    const resolved = {};
    for (const key in obj) {
      resolved[key] = resolveNestedReferences(obj[key], theme);
    }
    return resolved;
  }
  return obj;
}

// Apply reference resolution to the entire theme
const resolvedTheme = resolveNestedReferences(baseTheme, baseTheme);

// Output to theme.js
const output = `const theme = ${JSON.stringify(resolvedTheme, null, 2)};\n\nexport default theme;`;
fs.writeFileSync('theme.js', output);

console.log('MUI theme with resolved references successfully generated in theme.js.');
