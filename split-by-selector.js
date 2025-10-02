/**
 * Simplified version - Extract components by selector
 * 
 * This transform extracts specific JSX elements based on CSS selectors or element patterns.
 * 
 * Usage:
 *   jscodeshift -t split-by-selector.js --selector="header" --name="Header" <file>
 */

const fs = require('fs');
const path = require('path');

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  const selector = options.selector; // e.g., "header", "nav", "footer"
  const componentName = options.name || 'ExtractedComponent';
  const outputDir = options.outputDir || './components';
  
  if (!selector) {
    console.log('Please provide --selector option');
    return null;
  }
  
  let extracted = false;
  let targetJSX = null;
  let extractedProps = new Set();
  
  // Find the first JSX element matching the selector
  root.find(j.JSXElement).forEach(path => {
    if (extracted) return;
    
    const openingElement = path.node.openingElement;
    if (j.JSXIdentifier.check(openingElement.name)) {
      const elementName = openingElement.name.name;
      
      // Check if element matches selector
      if (elementName === selector) {
        targetJSX = path.node;
        
        // Extract props by finding all identifiers
        j(path).find(j.Identifier).forEach(identPath => {
          const name = identPath.node.name;
          if (name !== 'React' && !name.match(/^[A-Z]/)) {
            extractedProps.add(name);
          }
        });
        
        extracted = true;
      }
      
      // Also check className attribute
      const classNameAttr = openingElement.attributes.find(attr =>
        j.JSXAttribute.check(attr) && 
        attr.name.name === 'className' &&
        j.Literal.check(attr.value) &&
        attr.value.value.includes(selector)
      );
      
      if (classNameAttr && !extracted) {
        targetJSX = path.node;
        
        j(path).find(j.Identifier).forEach(identPath => {
          const name = identPath.node.name;
          if (name !== 'React' && !name.match(/^[A-Z]/)) {
            extractedProps.add(name);
          }
        });
        
        extracted = true;
      }
    }
  });
  
  if (!extracted) {
    console.log(`No element matching selector "${selector}" found`);
    return null;
  }
  
  // Generate component code
  const props = Array.from(extractedProps);
  const propsString = props.length > 0 ? `{ ${props.join(', ')} }` : '';
  
  const componentCode = `import React from 'react';

function ${componentName}(${propsString}) {
  return (
    ${j(targetJSX).toSource()}
  );
}

export default ${componentName};
`;
  
  // Write component file
  if (!options.dry) {
    const baseDir = path.dirname(fileInfo.path);
    const outputPath = path.join(baseDir, outputDir);
    
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    const filepath = path.join(outputPath, `${componentName}.jsx`);
    fs.writeFileSync(filepath, componentCode, 'utf8');
    console.log(`Created: ${filepath}`);
    
    // Add import to original file
    const importPath = `./${outputDir}/${componentName}`;
    const importStatement = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier(componentName))],
      j.literal(importPath)
    );
    
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.length > 0) {
      firstImport.insertAfter(importStatement);
    } else {
      root.get().node.program.body.unshift(importStatement);
    }
    
    // Replace JSX with component
    root.find(j.JSXElement).forEach(path => {
      if (path.node === targetJSX) {
        j(path).replaceWith(
          j.jsxElement(
            j.jsxOpeningElement(
              j.jsxIdentifier(componentName),
              props.map(prop =>
                j.jsxAttribute(
                  j.jsxIdentifier(prop),
                  j.jsxExpressionContainer(j.identifier(prop))
                )
              ),
              true
            )
          )
        );
      }
    });
    
    return root.toSource({ quote: 'single' });
  } else {
    console.log('[DRY RUN]');
    console.log(`Would create: ${componentName}.jsx`);
    console.log(`Props: ${props.join(', ')}`);
    console.log(componentCode);
  }
  
  return null;
};

module.exports.parser = 'tsx';
