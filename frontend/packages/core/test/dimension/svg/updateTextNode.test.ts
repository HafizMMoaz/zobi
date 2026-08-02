// do not use react-testing-library in plugins
/* eslint-disable jest-dom/prefer-to-have-attribute */
/* eslint-disable jest-dom/prefer-to-have-text-content */
/* eslint-disable jest-dom/prefer-to-have-style */

import updateTextNode from '../../../src/dimension/svg/updateTextNode';
import createTextNode from '../../../src/dimension/svg/createTextNode';

describe('updateTextNode(node, options)', () => {
  test('handles empty options', () => {
    const node = updateTextNode(createTextNode());
    expect(node.getAttribute('class')).toEqual('');
    expect(node.style.font).toEqual('');
    expect(node.style.fontWeight).toEqual('');
    expect(node.style.fontSize).toEqual('');
    expect(node.style.fontStyle).toEqual('');
    expect(node.style.fontFamily).toEqual('');
    expect(node.style.letterSpacing).toEqual('');
    expect(node.textContent).toEqual('');
  });

  test('handles setting class', () => {
    const node = updateTextNode(createTextNode(), { className: 'abc' });
    expect(node.getAttribute('class')).toEqual('abc');
    expect(node.style.font).toEqual('');
    expect(node.style.fontWeight).toEqual('');
    expect(node.style.fontSize).toEqual('');
    expect(node.style.fontStyle).toEqual('');
    expect(node.style.fontFamily).toEqual('');
    expect(node.style.letterSpacing).toEqual('');
    expect(node.textContent).toEqual('');
  });

  test('handles setting text', () => {
    const node = updateTextNode(createTextNode(), { text: 'abc' });
    expect(node.getAttribute('class')).toEqual('');
    expect(node.style.font).toEqual('');
    expect(node.style.fontWeight).toEqual('');
    expect(node.style.fontSize).toEqual('');
    expect(node.style.fontStyle).toEqual('');
    expect(node.style.fontFamily).toEqual('');
    expect(node.style.letterSpacing).toEqual('');
    expect(node.textContent).toEqual('abc');
  });

  test('handles setting font', () => {
    const node = updateTextNode(createTextNode(), {
      style: {
        font: 'italic 700 30px Lobster',
      },
    });
    expect(node.getAttribute('class')).toEqual('');
    expect(node.style.fontWeight).toEqual('700');
    expect(node.style.fontSize).toEqual('30px');
    expect(node.style.fontStyle).toEqual('italic');
    expect(node.style.fontFamily).toEqual('Lobster');
    expect(node.style.letterSpacing).toEqual('');
    expect(node.textContent).toEqual('');
  });

  test('handles setting specific font style', () => {
    const node = updateTextNode(createTextNode(), {
      style: {
        fontFamily: 'Lobster',
        fontStyle: 'italic',
        fontWeight: '700',
        fontSize: '30px',
        letterSpacing: 1.1,
      },
    });
    expect(node.getAttribute('class')).toEqual('');
    expect(node.style.fontWeight).toEqual('700');
    expect(node.style.fontSize).toEqual('30px');
    expect(node.style.fontStyle).toEqual('italic');
    expect(node.style.fontFamily).toEqual('Lobster');
    expect(node.style.letterSpacing).toEqual('1.1');
    expect(node.textContent).toEqual('');
  });
});

/* eslint-enable jest-dom/prefer-to-have-attribute */
/* eslint-enable jest-dom/prefer-to-have-text-content */
/* eslint-enable jest-dom/prefer-to-have-style */
