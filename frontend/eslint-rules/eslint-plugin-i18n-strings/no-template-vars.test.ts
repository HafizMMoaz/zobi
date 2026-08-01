/* eslint-disable no-template-curly-in-string */
import type { Rule } from 'eslint';

const { RuleTester } = require('eslint');
const plugin: { rules: Record<string, Rule.RuleModule> } = require('.');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
const rule: Rule.RuleModule = plugin.rules['no-template-vars'];

const errors: Array<{ type: string }> = [
  {
    type: 'CallExpression',
  },
];

ruleTester.run('no-template-vars', rule, {
  valid: [
    't(`foo`)',
    'tn(`foo`)',
    't(`foo %s bar`)',
    'tn(`foo %s bar`)',
    't(`foo %s bar %s`)',
    'tn(`foo %s bar %s`)',
  ],
  invalid: [
    {
      code: 't(`foo${bar}`)',
      errors,
    },
    {
      code: 't(`foo${bar} ${baz}`)',
      errors,
    },
    {
      code: 'tn(`foo${bar}`)',
      errors,
    },
    {
      code: 'tn(`foo${bar} ${baz}`)',
      errors,
    },
  ],
});
