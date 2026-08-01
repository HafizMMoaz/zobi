import RowCountLabel, { RowCountLabelProps } from '.';

export default {
  title: 'Components/RowCountLabel',
  component: RowCountLabel,
};

const options: { [key in string]: RowCountLabelProps } = {
  loading: {
    loading: true,
  },
  single: {
    rowcount: 1,
    limit: 100,
  },
  full: {
    rowcount: 100,
    limit: 100,
  },
  medium: {
    rowcount: 50,
    limit: 100,
  },
};

export const RowCountLabelGallery = () => (
  <>
    {Object.keys(options).map(name => (
      <>
        <h4>{name}</h4>
        <RowCountLabel
          loading={options[name].loading}
          rowcount={options[name].rowcount}
          limit={options[name].limit}
        />
      </>
    ))}
  </>
);
