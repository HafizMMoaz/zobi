// A safe alternative to JS's eval
import vm, { Context, RunningScriptOptions } from 'vm';
import _ from 'underscore';
/* eslint-disable-next-line no-restricted-syntax */
import * as d3array from 'd3-array';
/* eslint-disable-next-line no-restricted-syntax */
import * as colors from './colors';

// Objects exposed here should be treated like a public API
// if `underscore` had backwards incompatible changes in a future release, we'd
// have to be careful about bumping the library as those changes could break user charts
const GLOBAL_CONTEXT = {
  console,
  _,
  colors,
  d3array,
};

type GlobalContext = {
  console: Console;
  _: _.UnderscoreStatic;
  colors: typeof colors;
  d3array: typeof d3array;
};

// Copied/modified from https://github.com/hacksparrow/safe-eval/blob/master/index.js
export default function sandboxedEval(
  code: string,
  context?: Context,
  opts?: RunningScriptOptions | string,
) {
  const sandbox: Context = {};
  const resultKey = `SAFE_EVAL_${Math.floor(Math.random() * 1000000)}`;
  sandbox[resultKey] = {};
  const codeToEval = `${resultKey}=${code}`;
  const sandboxContext: GlobalContext = { ...GLOBAL_CONTEXT, ...context };
  Object.keys(sandboxContext).forEach(key => {
    sandbox[key] = sandboxContext[key as keyof GlobalContext];
  });
  try {
    vm.runInNewContext(codeToEval, sandbox, opts);

    return sandbox[resultKey];
  } catch (error) {
    return () => error;
  }
}
