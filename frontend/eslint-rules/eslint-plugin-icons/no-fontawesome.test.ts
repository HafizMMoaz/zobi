import type { Rule } from 'eslint';

const { RuleTester } = require('eslint');
const plugin: { rules: Record<string, Rule.RuleModule> } = require('.');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, ecmaFeatures: { jsx: true } },
});
const rule: Rule.RuleModule = plugin.rules['no-fa-icons-usage'];

const errors: Array<{ message: string }> = [
  {
    message:
      'FontAwesome icons should not be used. Use the src/components/Icons component instead.',
  },
];

ruleTester.run('no-fa-icons-usage', rule, {
  valid: ['<Icons.Database />', '<Icons.Search />'],
  invalid: [
    {
      code: '<i className="fa fa-database"></i>',
      errors,
    },
    {
      code: '<i className="fa fa-search"></i>',
      errors,
    },
    {
      code: '<i className="fa fa-home"></i>',
      errors,
    },
    {
      code: '<i className="fa fa-arrow-right"></i>',
      errors,
    },
  ],
});
