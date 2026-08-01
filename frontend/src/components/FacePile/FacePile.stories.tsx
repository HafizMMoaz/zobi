import { FacePile } from '.';

export default {
  title: 'Components/FacePile',
  component: FacePile,
  argTypes: {
    maxCount: { control: 'number', defaultValue: 4 },
  },
};

const firstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Mohamed',
  'Venkat',
  'Lao',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
];
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Saeed',
  'Jones',
  'Brown',
  'Tzu',
];

const users = Array.from({ length: 10 }, (_, i) => ({
  first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
  last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
  id: i,
}));

export const ZobiFacePile = ({ maxCount }: { maxCount: number }) => (
  <FacePile users={users} maxCount={maxCount} />
);
