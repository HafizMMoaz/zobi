import type { Rule } from 'eslint';
import type { Node } from 'estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

interface JSXAttribute {
  name?: { name: string };
  value?: { type: string; value?: string; expression?: { value: string } };
}

interface JSXOpeningElement {
  name: { name: string };
  attributes: JSXAttribute[];
}

interface JSXElementNode {
  type: string;
  openingElement: JSXOpeningElement;
}

const plugin: { rules: Record<string, Rule.RuleModule> } = {
  rules: {
    'no-fa-icons-usage': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Disallow the usage of FontAwesome icons in the codebase',
          category: 'Best Practices',
        },
        schema: [],
      },
      create(context: Rule.RuleContext): Rule.RuleListener {
        return {
          // Check for JSX elements with class names containing "fa"
          JSXElement(node: Node): void {
            const jsxNode = node as unknown as JSXElementNode;
            if (
              jsxNode.openingElement &&
              jsxNode.openingElement.name.name === 'i' &&
              jsxNode.openingElement.attributes &&
              jsxNode.openingElement.attributes.some((attr: JSXAttribute) => {
                if (attr.name?.name !== 'className') return false;
                // Handle className="fa fa-home"
                if (attr.value?.type === 'Literal') {
                  return /fa fa-/.test(attr.value.value ?? '');
                }
                // Handle className={'fa fa-home'}
                if (attr.value?.type === 'JSXExpressionContainer') {
                  return /fa fa-/.test(attr.value.expression?.value ?? '');
                }
                return false;
              })
            ) {
              context.report({
                node,
                message:
                  'FontAwesome icons should not be used. Use the src/components/Icons component instead.',
              });
            }
          },
        };
      },
    },
  },
};

module.exports = plugin;
