/**
 * jscodeshift transform for splitting React component files into subcomponents
 * 
 * This transform identifies JSX elements that could be extracted into separate
 * components and creates new component files for them.
 * 
 * Usage:
 *   jscodeshift -t split-components.js <path-to-file>
 * 
 * Options:
 *   --dry          Run in dry mode (no files written)
 *   --outputDir    Directory to output split components (default: './components')
 *   --minElements  Minimum JSX elements to extract (default: 3)
 */

const fs = require('fs');
const path = require('path');

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // Configuration
  const outputDir = options.outputDir || './components';
  const minElements = parseInt(options.minElements) || 3;
  const componentsToExtract = [];
  
  /**
   * Check if a node is a React component (function or class)
   */
  function isReactComponent(path) {
    const node = path.node;
    
    // Function component
    if (
      (j.FunctionDeclaration.check(node) || 
       j.ArrowFunctionExpression.check(node) ||
       j.FunctionExpression.check(node)) &&
      hasJSXReturn(path)
    ) {
      return true;
    }
    
    // Class component
    if (j.ClassDeclaration.check(node)) {
      const hasRenderMethod = j(path)
        .find(j.ClassMethod, { key: { name: 'render' } })
        .length > 0;
      return hasRenderMethod;
    }
    
    return false;
  }
  
  /**
   * Check if function returns JSX
   */
  function hasJSXReturn(path) {
    return j(path)
      .find(j.ReturnStatement)
      .filter(returnPath => {
        const argument = returnPath.node.argument;
        return (
          j.JSXElement.check(argument) ||
          j.JSXFragment.check(argument)
        );
      })
      .length > 0;
  }
  
  /**
   * Extract component name from JSX element
   */
  function getComponentName(jsxElement) {
    if (j.JSXElement.check(jsxElement)) {
      const openingElement = jsxElement.openingElement;
      if (j.JSXIdentifier.check(openingElement.name)) {
        return openingElement.name.name;
      }
    }
    return null;
  }
  
  /**
   * Count JSX elements in a subtree
   */
  function countJSXElements(node) {
    let count = 0;
    j(node).find(j.JSXElement).forEach(() => {
      count++;
    });
    return count;
  }
  
  /**
   * Extract props used in JSX element
   */
  function extractPropsFromJSX(jsxElement) {
    const props = new Set();
    
    // Find all identifiers in the JSX
    j(jsxElement).find(j.Identifier).forEach(identPath => {
      const name = identPath.node.name;
      // Skip JSX element names and common keywords
      if (
        name !== 'React' &&
        name !== 'Fragment' &&
        !name.match(/^[A-Z]/) // Skip component names
      ) {
        props.add(name);
      }
    });
    
    // Find JSXExpressionContainer to get variables used
    j(jsxElement).find(j.JSXExpressionContainer).forEach(exprPath => {
      j(exprPath).find(j.Identifier).forEach(identPath => {
        const name = identPath.node.name;
        if (
          name !== 'React' &&
          name !== 'Fragment' &&
          !name.match(/^[A-Z]/)
        ) {
          props.add(name);
        }
      });
    });
    
    return Array.from(props);
  }
  
  /**
   * Generate component code from JSX
   */
  function generateComponentCode(componentName, jsxElement, props, imports) {
    const propsString = props.length > 0 ? `{ ${props.join(', ')} }` : '';
    const importStatements = imports.join('\n');
    
    return `${importStatements ? importStatements + '\n\n' : ''}function ${componentName}(${propsString}) {
  return (
    ${j(jsxElement).toSource()}
  );
}

export default ${componentName};
`;
  }
  
  /**
   * Extract imports needed for a component
   */
  function extractImports(componentName) {
    const imports = [];
    
    // Check if React is needed
    const needsReact = true; // For JSX transform
    if (needsReact) {
      imports.push("import React from 'react';");
    }
    
    return imports;
  }
  
  /**
   * Convert camelCase or other format to PascalCase
   */
  function toPascalCase(str) {
    return str
      .replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  }
  
  /**
   * Find candidate JSX elements to extract
   */
  function findExtractableCandidates(componentPath) {
    const candidates = [];
    
    // Find JSX elements that could be components
    j(componentPath.node)
      .find(j.JSXElement)
      .forEach(jsxPath => {
        const elementCount = countJSXElements(jsxPath.node);
        
        // Only consider elements with enough complexity
        if (elementCount >= minElements) {
          const jsxElement = jsxPath.node;
          const openingElement = jsxElement.openingElement;
          
          // Generate a meaningful component name
          let suggestedName = 'ExtractedComponent';
          if (j.JSXIdentifier.check(openingElement.name)) {
            const elementName = openingElement.name.name;
            // Create name based on element type and context
            if (elementName === 'div' || elementName === 'section') {
              // Try to get a name from className or id
              const classNameAttr = openingElement.attributes.find(attr =>
                j.JSXAttribute.check(attr) && attr.name.name === 'className'
              );
              if (classNameAttr && j.Literal.check(classNameAttr.value)) {
                const className = classNameAttr.value.value;
                suggestedName = toPascalCase(className.split(' ')[0]);
              }
            } else {
              suggestedName = toPascalCase(elementName) + 'Component';
            }
          }
          
          const props = extractPropsFromJSX(jsxElement);
          
          candidates.push({
            name: suggestedName,
            jsxElement,
            props,
            jsxPath,
            elementCount
          });
        }
      });
    
    return candidates;
  }
  
  /**
   * Main transform logic
   */
  
  // Find the main component in the file
  let mainComponentFound = false;
  
  // Check for function components
  root.find(j.FunctionDeclaration).forEach(path => {
    if (isReactComponent(path) && !mainComponentFound) {
      mainComponentFound = true;
      const candidates = findExtractableCandidates(path);
      
      candidates.forEach((candidate, index) => {
        const uniqueName = `${candidate.name}${index > 0 ? index : ''}`;
        const imports = extractImports(uniqueName);
        const componentCode = generateComponentCode(
          uniqueName,
          candidate.jsxElement,
          candidate.props,
          imports
        );
        
        componentsToExtract.push({
          name: uniqueName,
          code: componentCode,
          props: candidate.props,
          jsxPath: candidate.jsxPath
        });
      });
    }
  });
  
  // Check for arrow function components
  if (!mainComponentFound) {
    root.find(j.VariableDeclaration).forEach(path => {
      const declaration = path.node.declarations[0];
      if (
        declaration &&
        j.ArrowFunctionExpression.check(declaration.init)
      ) {
        // Check if it returns JSX
        const returnsJSX = j(declaration.init)
          .find(j.ReturnStatement)
          .filter(returnPath => {
            const argument = returnPath.node.argument;
            return j.JSXElement.check(argument) || j.JSXFragment.check(argument);
          })
          .length > 0;
        
        if (returnsJSX) {
          mainComponentFound = true;
          const candidates = findExtractableCandidates(path);
        
          candidates.forEach((candidate, index) => {
            const uniqueName = `${candidate.name}${index > 0 ? index : ''}`;
            const imports = extractImports(uniqueName);
            const componentCode = generateComponentCode(
              uniqueName,
              candidate.jsxElement,
              candidate.props,
              imports
            );
            
            componentsToExtract.push({
              name: uniqueName,
              code: componentCode,
              props: candidate.props,
              jsxPath: candidate.jsxPath
            });
          });
        }
      }
    });
  }
  
  // Check for class components
  if (!mainComponentFound) {
    root.find(j.ClassDeclaration).forEach(path => {
      if (isReactComponent(path)) {
        mainComponentFound = true;
        const renderMethods = j(path)
          .find(j.ClassMethod, { key: { name: 'render' } });
        
        if (renderMethods.length > 0) {
          const renderMethod = renderMethods.paths()[0];
          const candidates = findExtractableCandidates(renderMethod);
          
          candidates.forEach((candidate, index) => {
            const uniqueName = `${candidate.name}${index > 0 ? index : ''}`;
            const imports = extractImports(uniqueName);
            const componentCode = generateComponentCode(
              uniqueName,
              candidate.jsxElement,
              candidate.props,
              imports
            );
            
            componentsToExtract.push({
              name: uniqueName,
              code: componentCode,
              props: candidate.props,
              jsxPath: candidate.jsxPath
            });
          });
        }
      }
    });
  }
  
  // Write extracted components to files
  if (componentsToExtract.length > 0 && !options.dry) {
    const baseDir = path.dirname(fileInfo.path);
    const outputPath = path.join(baseDir, outputDir);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    componentsToExtract.forEach(component => {
      const filename = `${component.name}.jsx`;
      const filepath = path.join(outputPath, filename);
      fs.writeFileSync(filepath, component.code, 'utf8');
      console.log(`Created component: ${filepath}`);
    });
    
    // Replace JSX elements with component references in original file
    componentsToExtract.forEach(component => {
      const propsObj = component.props.length > 0
        ? `{ ${component.props.join(', ')} }`
        : '';
      
      // Create import statement
      const importPath = `./${outputDir}/${component.name}`;
      const importExists = root
        .find(j.ImportDeclaration, {
          source: { value: importPath }
        })
        .length > 0;
      
      if (!importExists) {
        const importStatement = j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier(component.name))],
          j.literal(importPath)
        );
        
        // Add import at the top
        const firstImport = root.find(j.ImportDeclaration).at(0);
        if (firstImport.length > 0) {
          firstImport.insertAfter(importStatement);
        } else {
          root.get().node.program.body.unshift(importStatement);
        }
      }
      
      // Replace JSX with component reference
      j(component.jsxPath).replaceWith(
        j.jsxElement(
          j.jsxOpeningElement(
            j.jsxIdentifier(component.name),
            component.props.map(prop =>
              j.jsxAttribute(
                j.jsxIdentifier(prop),
                j.jsxExpressionContainer(j.identifier(prop))
              )
            ),
            true
          )
        )
      );
    });
  }
  
  // Report statistics
  if (options.dry) {
    api.stats('components-found', componentsToExtract.length);
    componentsToExtract.forEach(component => {
      console.log(`[DRY RUN] Would create: ${component.name} with props: ${component.props.join(', ')}`);
    });
  }
  
  // Return nothing (file not modified) if no components to extract or in dry mode
  if (componentsToExtract.length === 0 || options.dry) {
    return undefined;
  }
  
  // Return modified source
  return root.toSource({ quote: 'single' });
};

module.exports.parser = 'tsx';
