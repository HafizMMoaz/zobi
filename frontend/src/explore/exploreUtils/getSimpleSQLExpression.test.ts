import { cleanup } from 'spec/helpers/testing-library';
import { EMPTY_STRING, NULL_STRING } from 'src/utils/common';
import { getSimpleSQLExpression } from '.';
import { Operators } from '../constants';

// Add cleanup after each test
afterEach(async () => {
  cleanup();
  // Wait for any pending effects to complete
  await new Promise(resolve => setTimeout(resolve, 0));
});

const params = {
  subject: 'subject',
  operator: 'operator',
  comparator: 'comparator',
};

test('Should return "" if subject is falsy', () => {
  expect(getSimpleSQLExpression('', params.operator, params.comparator)).toBe(
    '',
  );
  expect(
    getSimpleSQLExpression(undefined, params.operator, params.comparator),
  ).toBe('');
});

test('Should return null string and empty string', () => {
  expect(getSimpleSQLExpression(params.subject, Operators.In, [null, ''])).toBe(
    `subject ${Operators.In} (${NULL_STRING}, ${EMPTY_STRING})`,
  );
});

test('Should return subject if operator is falsy', () => {
  expect(getSimpleSQLExpression(params.subject, '', params.comparator)).toBe(
    params.subject,
  );
  expect(
    getSimpleSQLExpression(params.subject, undefined, params.comparator),
  ).toBe(params.subject);
});

test('Should return correct string when subject and operator are valid values', () => {
  expect(
    getSimpleSQLExpression(params.subject, params.operator, params.comparator),
  ).toBe("subject operator 'comparator'");

  expect(
    getSimpleSQLExpression(params.subject, params.operator, [
      params.comparator,
      'comparator-2',
    ]),
  ).toBe("subject operator 'comparator', 'comparator-2'");
});

test('Should handle boolean false comparator as a string value', () => {
  expect(getSimpleSQLExpression(params.subject, params.operator, false)).toBe(
    "subject operator 'FALSE'",
  );
});

test('Should handle boolean true comparator as a string value', () => {
  expect(getSimpleSQLExpression(params.subject, params.operator, true)).toBe(
    "subject operator 'TRUE'",
  );
});
