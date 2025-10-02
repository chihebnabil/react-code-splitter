#!/usr/bin/env node

const { Command } = require('commander');
const { run: runJscodeshift } = require('jscodeshift/src/Runner');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const inquirer = require('inquirer');

const program = new Command();

program
  .name('react-split')
  .description('Split React components into smaller subcomponents')
  .version('2.0.1');

program
  .command('auto')
  .description('Automatically extract subcomponents from React files')
  .argument('<files...>', 'Files or glob patterns to process')
  .option('-i, --interactive', 'Interactive mode (name each component)', false)
  .option('-d, --dry', 'Dry run (no files written)', false)
  .option('-o, --output-dir <dir>', 'Output directory for extracted components', './components')
  .option('-m, --min-elements <number>', 'Minimum JSX elements to extract', '3')
  .option('-p, --parser <parser>', 'Parser to use (babel, tsx, flow, ts)', 'tsx')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (files, options) => {
    if (options.interactive) {
      // Interactive mode - process one file at a time
      await runInteractiveMode(files, options);
    } else {
      // Non-interactive mode (original behavior)
      await runAutoMode(files, options);
    }
  });

async function runAutoMode(files, options) {
  const spinner = ora('Analyzing components...').start();
  
  try {
    const transformPath = path.resolve(__dirname, '../split-components.js');
    
    const runOptions = {
      dry: options.dry,
      print: true,
      verbose: options.verbose ? 2 : 0,
      parser: options.parser,
      outputDir: options.outputDir,
      minElements: options.minElements,
    };

    if (options.dry) {
      spinner.text = 'Running in dry mode...';
    }

    const result = await runJscodeshift(transformPath, files, runOptions);
    
    spinner.stop();
    
    // Display results
    console.log('\n' + chalk.bold('Results:'));
    console.log(chalk.green(`✓ ${result.ok} file(s) modified`));
    console.log(chalk.gray(`- ${result.nochange} file(s) unchanged`));
    console.log(chalk.yellow(`⊘ ${result.skip} file(s) skipped`));
    if (result.error > 0) {
      console.log(chalk.red(`✗ ${result.error} error(s)`));
    }
    console.log(chalk.gray(`Time: ${result.timeElapsed}`));
    
    if (options.dry) {
      console.log('\n' + chalk.yellow('ℹ This was a dry run. No files were modified.'));
      console.log(chalk.gray('Remove --dry flag to apply changes.'));
    }
    console.log('\n' + chalk.dim('💡 Tip: Use --interactive flag to manually name each component'));
    
  } catch (error) {
    spinner.fail('Failed to process files');
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}

async function runInteractiveMode(files, options) {
  const jscodeshift = require('jscodeshift');
  const transformPath = path.resolve(__dirname, '../split-components-interactive.js');
  const transform = require(transformPath);
  
  console.log(chalk.bold('\n🎯 Interactive Component Extraction\n'));
  
  // Expand glob patterns to actual files
  const glob = require('glob');
  let expandedFiles = [];
  for (const pattern of files) {
    if (pattern.includes('*')) {
      const matched = glob.sync(pattern);
      expandedFiles.push(...matched);
    } else {
      expandedFiles.push(pattern);
    }
  }
  
  for (const file of expandedFiles) {
    console.log(chalk.cyan(`\n📄 Processing: ${file}\n`));
    
    try {
      const source = fs.readFileSync(file, 'utf8');
      const fileInfo = { path: file, source };
      
      // Determine parser based on file extension
      const parser = options.parser || (file.endsWith('.tsx') || file.endsWith('.ts') ? 'tsx' : 'babel');
      
      // Create jscodeshift with proper parser
      const api = { 
        jscodeshift: jscodeshift.withParser(parser),
        j: jscodeshift.withParser(parser),
        stats: () => {},
        report: () => {}
      };
      
      // Phase 1: Identify candidates
      const firstPassOptions = {
        ...options,
        interactive: true,
        minElements: options.minElements || '3',
        parser: parser
      };
      
      transform(fileInfo, api, firstPassOptions);
      
      const candidates = firstPassOptions._candidates;
      
      if (!candidates || candidates.length === 0) {
        continue;
      }
    
    console.log(chalk.green(`✓ Found ${candidates.length} extractable component(s)\n`));
    
    // Phase 2: Interactive prompts
    const decisions = [];
    
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      
      console.log(chalk.bold(`\nCandidate ${i + 1}/${candidates.length}:`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.dim(candidate.preview));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.dim(`(${candidate.elementCount} JSX elements)\n`));
      
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'extract',
          message: 'Extract this component?',
          default: true
        },
        {
          type: 'input',
          name: 'name',
          message: 'Component name:',
          default: candidate.suggestedName,
          when: (answers) => answers.extract,
          validate: (input) => {
            if (!input || input.trim() === '') {
              return 'Component name cannot be empty';
            }
            if (!/^[A-Z]/.test(input)) {
              return 'Component name must start with uppercase letter';
            }
            if (!/^[A-Za-z0-9]+$/.test(input)) {
              return 'Component name can only contain letters and numbers';
            }
            return true;
          }
        }
      ]);
      
      decisions.push({
        extract: answers.extract,
        name: answers.name,
        node: candidate.node
      });
    }
    
    const extractCount = decisions.filter(d => d.extract).length;
    
    if (extractCount === 0) {
      console.log(chalk.yellow('\n⊘ Skipped all components\n'));
      continue;
    }
    
    // Phase 3: Apply extractions
    console.log(chalk.cyan(`\n🔨 Extracting ${extractCount} component(s)...\n`));
    
    const applyOptions = {
      ...options,
      interactive: true,
      _applyDecisions: true,
      _decisions: decisions,
      dry: options.dry,
      outputDir: options.outputDir || './components'
    };
    
      const modifiedSource = transform(fileInfo, api, applyOptions);
      
      if (modifiedSource && !options.dry) {
        fs.writeFileSync(file, modifiedSource, 'utf8');
        console.log(chalk.green(`\n✓ Updated ${file}\n`));
      }
      
      if (options.dry) {
        console.log(chalk.yellow('\nℹ Dry run - no files written'));
      }
    } catch (error) {
      console.error(chalk.red(`\n✗ Error processing ${file}:`));
      console.error(chalk.red(error.message));
      if (options.verbose) {
        console.error(error.stack);
      }
      console.log(chalk.yellow('\n💡 Tip: Try specifying parser with --parser tsx or --parser babel\n'));
    }
  }
  
  console.log(chalk.bold.green('\n✨ Interactive extraction complete!\n'));
}

program
  .command('extract')
  .description('Extract specific component by selector')
  .argument('<files...>', 'Files to process')
  .requiredOption('-s, --selector <selector>', 'CSS selector or element name to extract')
  .requiredOption('-n, --name <name>', 'Name for the extracted component')
  .option('-d, --dry', 'Dry run (no files written)', false)
  .option('-o, --output-dir <dir>', 'Output directory for extracted components', './components')
  .option('-p, --parser <parser>', 'Parser to use (babel, tsx, flow, ts)', 'tsx')
  .action(async (files, options) => {
    const spinner = ora(`Extracting ${options.name}...`).start();
    
    try {
      const transformPath = path.resolve(__dirname, '../split-by-selector.js');
      
      const runOptions = {
        dry: options.dry,
        print: true,
        verbose: 0,
        parser: options.parser,
        selector: options.selector,
        name: options.name,
        outputDir: options.outputDir,
      };

      const result = await runJscodeshift(transformPath, files, runOptions);
      
      spinner.stop();
      
      console.log('\n' + chalk.bold('Results:'));
      console.log(chalk.green(`✓ ${result.ok} file(s) modified`));
      console.log(chalk.gray(`- ${result.nochange} file(s) unchanged`));
      
      if (options.dry) {
        console.log('\n' + chalk.yellow('ℹ This was a dry run. No files were modified.'));
      }
      
    } catch (error) {
      spinner.fail('Failed to extract component');
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize configuration file')
  .action(() => {
    const configPath = path.join(process.cwd(), '.react-splitter.json');
    
    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow('⚠ Configuration file already exists'));
      return;
    }
    
    const config = {
      outputDir: './components',
      minElements: 3,
      parser: 'tsx',
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green('✓ Created .react-splitter.json'));
    console.log(chalk.gray('\nYou can now customize the configuration.'));
  });

// Add examples to help
program.on('--help', () => {
  console.log('');
  console.log(chalk.bold('Examples:'));
  console.log('');
  console.log('  # Interactive mode (RECOMMENDED - name each component)');
  console.log('  $ react-split auto --interactive src/App.jsx');
  console.log('');
  console.log('  # Preview in interactive mode (no files written)');
  console.log('  $ react-split auto --interactive --dry src/App.jsx');
  console.log('');
  console.log('  # Automatic extraction with generic names');
  console.log('  $ react-split auto src/App.jsx');
  console.log('');
  console.log('  # Extract specific component with custom name');
  console.log('  $ react-split extract --selector header --name Header src/App.jsx');
  console.log('');
  console.log('  # Initialize config file');
  console.log('  $ react-split init');
  console.log('');
});

program.parse();
