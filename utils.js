/**
 * Utility functions for jscodeshift transforms
 */

/**
 * Check if a path represents a React component
 */
function isReactComponent(j, path) {
  const node = path.node;
  
  // Function component
  if (
    (j.FunctionDeclaration.check(node) || 
     j.ArrowFunctionExpression.check(node) ||
     j.FunctionExpression.check(node)) &&
    hasJSXReturn(j, path)
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
 * Check if a function returns JSX
 */
function hasJSXReturn(j, path) {
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
 * Get the name of a component from various node types
 */
function getComponentName(j, path) {
  const node = path.node;
  
  if (j.FunctionDeclaration.check(node) && node.id) {
    return node.id.name;
  }
  
  if (j.ClassDeclaration.check(node) && node.id) {
    return node.id.name;
  }
  
  // For variable declarations
  const parent = path.parent;
  if (parent && j.VariableDeclarator.check(parent.node)) {
    return parent.node.id.name;
  }
  
  return null;
}

/**
 * Count JSX elements in a node
 */
function countJSXElements(j, node) {
  let count = 0;
  j(node).find(j.JSXElement).forEach(() => {
    count++;
  });
  return count;
}

/**
 * Extract identifiers used in JSX (potential props)
 */
function extractIdentifiers(j, jsxElement, options = {}) {
  const identifiers = new Set();
  const {
    excludeComponents = true,
    excludeReact = true,
    excludePatterns = []
  } = options;
  
  j(jsxElement).find(j.Identifier).forEach(path => {
    const name = path.node.name;
    
    // Exclusion rules
    if (excludeReact && name === 'React') return;
    if (excludeComponents && name.match(/^[A-Z]/)) return;
    
    // Custom exclusions
    const excluded = excludePatterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(name);
      }
      return pattern === name;
    });
    
    if (!excluded) {
      identifiers.add(name);
    }
  });
  
  return Array.from(identifiers);
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
  return str
    .replace(/(?:^|[-_\s])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

/**
 * Convert string to camelCase
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Generate a meaningful component name from JSX element
 */
function generateComponentName(j, jsxElement, options = {}) {
  const { prefix = '', suffix = 'Component' } = options;
  
  if (!j.JSXElement.check(jsxElement)) {
    return prefix + 'Extracted' + suffix;
  }
  
  const openingElement = jsxElement.openingElement;
  
  if (!j.JSXIdentifier.check(openingElement.name)) {
    return prefix + 'Extracted' + suffix;
  }
  
  const elementName = openingElement.name.name;
  
  // Try to get name from className
  const classNameAttr = openingElement.attributes.find(attr =>
    j.JSXAttribute.check(attr) && 
    attr.name.name === 'className'
  );
  
  if (classNameAttr) {
    if (j.Literal.check(classNameAttr.value)) {
      const className = classNameAttr.value.value;
      const firstClass = className.split(/\s+/)[0];
      if (firstClass && !firstClass.includes('-')) {
        return prefix + toPascalCase(firstClass);
      }
    }
  }
  
  // Try to get name from id
  const idAttr = openingElement.attributes.find(attr =>
    j.JSXAttribute.check(attr) && 
    attr.name.name === 'id'
  );
  
  if (idAttr && j.Literal.check(idAttr.value)) {
    return prefix + toPascalCase(idAttr.value.value);
  }
  
  // Fallback to element name
  return prefix + toPascalCase(elementName) + suffix;
}

/**
 * Create a React component from JSX
 */
function createComponentCode(j, componentName, jsxElement, props = [], imports = []) {
  const propsString = props.length > 0 
    ? `{ ${props.join(', ')} }` 
    : '';
  
  const importStatements = imports.join('\n');
  
  const jsxCode = j(jsxElement).toSource();
  
  return `${importStatements ? importStatements + '\n\n' : ''}function ${componentName}(${propsString}) {
  return (
    ${jsxCode}
  );
}

export default ${componentName};
`;
}

/**
 * Create an import statement node
 */
function createImportDeclaration(j, componentName, importPath) {
  return j.importDeclaration(
    [j.importDefaultSpecifier(j.identifier(componentName))],
    j.literal(importPath)
  );
}

/**
 * Create a JSX element for a component with props
 */
function createComponentJSXElement(j, componentName, props = []) {
  return j.jsxElement(
    j.jsxOpeningElement(
      j.jsxIdentifier(componentName),
      props.map(prop =>
        j.jsxAttribute(
          j.jsxIdentifier(prop),
          j.jsxExpressionContainer(j.identifier(prop))
        )
      ),
      true // self-closing
    )
  );
}

/**
 * Check if an import already exists
 */
function hasImport(j, root, importPath) {
  return root
    .find(j.ImportDeclaration, {
      source: { value: importPath }
    })
    .length > 0;
}

/**
 * Add an import to the top of the file
 */
function addImport(j, root, componentName, importPath) {
  if (hasImport(j, root, importPath)) {
    return;
  }
  
  const importStatement = createImportDeclaration(j, componentName, importPath);
  
  const firstImport = root.find(j.ImportDeclaration).at(0);
  if (firstImport.length > 0) {
    firstImport.insertAfter(importStatement);
  } else {
    root.get().node.program.body.unshift(importStatement);
  }
}

/**
 * Get all React components in a file
 */
function findAllComponents(j, root) {
  const components = [];
  
  // Function declarations
  root.find(j.FunctionDeclaration).forEach(path => {
    if (isReactComponent(j, path)) {
      components.push({
        type: 'function',
        path,
        name: getComponentName(j, path)
      });
    }
  });
  
  // Variable declarations (arrow functions)
  root.find(j.VariableDeclaration).forEach(path => {
    path.node.declarations.forEach(declaration => {
      if (
        j.ArrowFunctionExpression.check(declaration.init) &&
        hasJSXReturn(j, j(declaration.init))
      ) {
        components.push({
          type: 'arrow',
          path: j(declaration.init),
          name: declaration.id.name
        });
      }
    });
  });
  
  // Class components
  root.find(j.ClassDeclaration).forEach(path => {
    if (isReactComponent(j, path)) {
      components.push({
        type: 'class',
        path,
        name: getComponentName(j, path)
      });
    }
  });
  
  return components;
}

module.exports = {
  isReactComponent,
  hasJSXReturn,
  getComponentName,
  countJSXElements,
  extractIdentifiers,
  toPascalCase,
  toCamelCase,
  generateComponentName,
  createComponentCode,
  createImportDeclaration,
  createComponentJSXElement,
  hasImport,
  addImport,
  findAllComponents
};
