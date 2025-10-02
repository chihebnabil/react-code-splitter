#!/usr/bin/env node

const { Command } = require('commander');
const { run: runJscodeshift } = require('jscodeshift/src/Runner');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');

const program = new Command();

program
  .name('react-split')
  .description('Split React components into smaller subcomponents')
  .version('1.0.0');

program
  .command('auto')
  .description('Automatically extract subcomponents from React files')
  .argument('<files...>', 'Files or glob patterns to process')
  .option('-d, --dry', 'Dry run (no files written)', false)
  .option('-o, --output-dir <dir>', 'Output directory for extracted components', './components')
  .option('-m, --min-elements <number>', 'Minimum JSX elements to extract', '3')
  .option('-p, --parser <parser>', 'Parser to use (babel, tsx, flow, ts)', 'tsx')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (files, options) => {
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
      
    } catch (error) {
      spinner.fail('Failed to process files');
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

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
  console.log('  # Automatic extraction (dry run)');
  console.log('  $ react-split auto --dry src/App.jsx');
  console.log('');
  console.log('  # Extract all complex components');
  console.log('  $ react-split auto src/**/*.jsx');
  console.log('');
  console.log('  # Extract with custom threshold');
  console.log('  $ react-split auto --min-elements 5 src/App.jsx');
  console.log('');
  console.log('  # Extract specific component');
  console.log('  $ react-split extract --selector header --name Header src/App.jsx');
  console.log('');
  console.log('  # Initialize config file');
  console.log('  $ react-split init');
  console.log('');
});

program.parse();
