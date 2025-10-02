/**
 * Interactive jscodeshift transform for splitting React components
 * 
 * This transform identifies candidates for extraction and prompts the user
 * to name each component, providing a preview of the JSX to be extracted.
 * 
 * Usage:
 *   node bin/cli.js auto --interactive <path-to-file>
 */

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

// Store extraction decisions globally for the interactive session
let extractionDecisions = [];
let currentFileInfo = null;

/**
 * Get a preview of JSX code (first few lines)
 */
function getJSXPreview(jsxElement, j) {
  const code = j(jsxElement).toSource();
  const lines = code.split('\n');
  const preview = lines.slice(0, 5).join('\n');
  return lines.length > 5 ? preview + '\n  ...' : preview;
}

/**
 * Generate a suggested component name from JSX element
 */
function suggestComponentName(jsxElement, j, index) {
  // Try to get className
  const classNameAttr = jsxElement.openingElement?.attributes?.find(
    attr => attr.name?.name === 'className'
  );
  
  if (classNameAttr) {
    const className = classNameAttr.value?.value || classNameAttr.value?.expression?.value;
    if (className) {
      // Convert "user-profile-card" to "UserProfileCard"
      return className
        .split(/[-_\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    }
  }
  
  // Use element name as fallback
  const elementName = jsxElement.openingElement?.name?.name;
  if (elementName && elementName !== 'div' && elementName !== 'span') {
    return elementName.charAt(0).toUpperCase() + elementName.slice(1) + 'Component';
  }
  
  // Last resort
  return `Component${index + 1}`;
}

/**
 * Count JSX elements in a tree
 */
function countJSXElements(jsxElement, j) {
  let count = 0;
  j(jsxElement).find(j.JSXElement).forEach(() => count++);
  return count;
}

/**
 * Check if JSX contains JSX return
 */
function hasJSXReturn(path) {
  const j = require('jscodeshift');
  let hasJSX = false;
  
  j(path).find(j.ReturnStatement).forEach(returnPath => {
    if (returnPath.value.argument) {
      if (
        j.JSXElement.check(returnPath.value.argument) ||
        j.JSXFragment.check(returnPath.value.argument)
      ) {
        hasJSX = true;
      }
    }
  });
  
  return hasJSX;
}

/**
 * Find the main component in the file
 */
function findMainComponent(root, j) {
  // Look for exported component first
  let mainComponent = null;
  
  // Check for default export
  root.find(j.ExportDefaultDeclaration).forEach(path => {
    if (j.FunctionDeclaration.check(path.value.declaration)) {
      if (hasJSXReturn(j(path.value.declaration))) {
        mainComponent = j(path.value.declaration);
      }
    } else if (j.Identifier.check(path.value.declaration)) {
      const name = path.value.declaration.name;
      const declaration = root.find(j.VariableDeclarator, { id: { name } });
      if (declaration.length > 0) {
        mainComponent = declaration;
      }
    }
  });
  
  // If no default export, look for any function component
  if (!mainComponent) {
    root.find(j.FunctionDeclaration).forEach(path => {
      if (!mainComponent && hasJSXReturn(j(path))) {
        mainComponent = j(path);
      }
    });
  }
  
  // Look for arrow function components
  if (!mainComponent) {
    root.find(j.VariableDeclarator).forEach(path => {
      if (!mainComponent && 
          j.ArrowFunctionExpression.check(path.value.init) &&
          hasJSXReturn(j(path))) {
        mainComponent = j(path);
      }
    });
  }
  
  return mainComponent;
}

/**
 * Find all direct child JSX elements in the component's return
 */
function findExtractableCandidates(component, j, minElements) {
  const candidates = [];
  
  // Find the return statement
  component.find(j.ReturnStatement).forEach(returnPath => {
    const returnArg = returnPath.value.argument;
    
    if (j.JSXElement.check(returnArg)) {
      // Get direct children of the root element
      const children = returnArg.children || [];
      
      children.forEach((child, index) => {
        if (j.JSXElement.check(child)) {
          const elementCount = countJSXElements(child, j);
          
          if (elementCount >= minElements) {
            candidates.push({
              node: child,
              elementCount,
              index
            });
          }
        }
      });
    }
  });
  
  return candidates;
}

/**
 * Extract props needed by the component
 */
function extractPropsFromJSX(jsxElement, j) {
  const props = new Set();
  
  // Find all identifiers in JSX expressions
  j(jsxElement).find(j.JSXExpressionContainer).forEach(path => {
    j(path).find(j.Identifier).forEach(idPath => {
      const name = idPath.value.name;
      // Exclude React, common globals, and lowercase (likely element names)
      if (
        name !== 'React' &&
        name !== 'useState' &&
        name !== 'useEffect' &&
        name !== 'props' &&
        name !== 'children' &&
        !/^[a-z]/.test(name) // lowercase = likely not a variable
      ) {
        props.add(name);
      }
    });
  });
  
  return Array.from(props);
}

/**
 * Generate component code
 */
function generateComponentCode(componentName, jsxElement, props, j) {
  const jsxCode = j(jsxElement).toSource();
  const propsParam = props.length > 0 ? `{ ${props.join(', ')} }` : '';
  
  return `import React from 'react';

function ${componentName}(${propsParam}) {
  return (
    ${jsxCode}
  );
}

export default ${componentName};
`;
}

/**
 * Main transform - runs in two phases
 */
module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // Configuration
  const minElements = parseInt(options.minElements) || 3;
  const isInteractive = options.interactive === true || options.interactive === 'true';
  
  if (!isInteractive) {
    // Non-interactive mode - shouldn't get here, but just in case
    console.log('This transform requires --interactive flag');
    return undefined;
  }
  
  // Phase 1: Identify candidates (synchronous)
  if (!options._applyDecisions) {
    currentFileInfo = fileInfo;
    extractionDecisions = [];
    
    const mainComponent = findMainComponent(root, j);
    
    if (!mainComponent) {
      console.log(`\n⚠️  No React component found in ${fileInfo.path}`);
      return undefined;
    }
    
    const candidates = findExtractableCandidates(mainComponent, j, minElements);
    
    if (candidates.length === 0) {
      console.log(`\n✓ No extractable components found in ${fileInfo.path}`);
      console.log(`  (Sections must have at least ${minElements} JSX elements)`);
      return undefined;
    }
    
    // Store candidates for interactive prompts
    options._candidates = candidates.map((candidate, index) => ({
      ...candidate,
      preview: getJSXPreview(candidate.node, j),
      suggestedName: suggestComponentName(candidate.node, j, index)
    }));
    
    // Signal that we need interactive input
    return undefined;
  }
  
  // Phase 2: Apply decisions (after user input)
  if (options._applyDecisions && options._decisions) {
    const decisions = options._decisions;
    const outputDir = options.outputDir || './components';
    const componentsToExtract = [];
    
    decisions.forEach(decision => {
      if (decision.extract) {
        const props = extractPropsFromJSX(decision.node, j);
        const code = generateComponentCode(decision.name, decision.node, props, j);
        
        componentsToExtract.push({
          name: decision.name,
          code,
          props,
          node: decision.node
        });
      }
    });
    
    if (componentsToExtract.length === 0) {
      console.log('\n✓ No components extracted (all skipped)');
      return undefined;
    }
    
    // Write component files (unless dry run)
    if (!options.dry) {
      const outputDirPath = path.resolve(process.cwd(), outputDir);
      if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
      }
      
      componentsToExtract.forEach(comp => {
        const filePath = path.join(outputDirPath, `${comp.name}.jsx`);
        fs.writeFileSync(filePath, comp.code);
        console.log(`  ✓ Created ${filePath}`);
      });
    }
    
    // Update the original file
    const mainComponent = findMainComponent(root, j);
    
    // Add imports at the top
    const imports = componentsToExtract.map(comp => {
      const importPath = `./${path.posix.join(outputDir, comp.name)}`;
      return j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier(comp.name))],
        j.literal(importPath)
      );
    });
    
    // Find the last import and add after it
    const lastImport = root.find(j.ImportDeclaration).at(-1);
    if (lastImport.length > 0) {
      lastImport.insertAfter(imports);
    } else {
      root.get().node.program.body.unshift(...imports);
    }
    
    // Replace JSX with component references
    mainComponent.find(j.ReturnStatement).forEach(returnPath => {
      const returnArg = returnPath.value.argument;
      
      if (j.JSXElement.check(returnArg)) {
        const children = returnArg.children || [];
        
        returnArg.children = children.map(child => {
          const extraction = componentsToExtract.find(comp => comp.node === child);
          
          if (extraction) {
            // Create <ComponentName prop={value} />
            const attributes = extraction.props.map(prop => 
              j.jsxAttribute(
                j.jsxIdentifier(prop),
                j.jsxExpressionContainer(j.identifier(prop))
              )
            );
            
            return j.jsxElement(
              j.jsxOpeningElement(
                j.jsxIdentifier(extraction.name),
                attributes,
                true // self-closing
              )
            );
          }
          
          return child;
        });
      }
    });
    
    return root.toSource();
  }
  
  return undefined;
};

module.exports.parser = 'tsx';
