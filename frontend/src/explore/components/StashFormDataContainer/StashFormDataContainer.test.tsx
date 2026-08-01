import { defaultState } from 'src/explore/store';
import { render, waitFor } from 'spec/helpers/testing-library';
import { useSelector } from 'react-redux';
import { ExplorePageState } from 'src/explore/types';
import StashFormDataContainer from '.';

const FormDataMock = () => {
  const formData = useSelector(
    (state: ExplorePageState) => state.explore.form_data,
  );

  return <div>{Object.keys(formData).join(':')}</div>;
};

test('should stash form data from fieldNames', () => {
  const { rerender, container } = render(
    <StashFormDataContainer
      shouldStash={false}
      fieldNames={['granularity_sqla']}
    >
      <FormDataMock />
    </StashFormDataContainer>,
    {
      useRedux: true,
      initialState: { explore: { form_data: defaultState.form_data } },
    },
  );
  expect(container.querySelector('div')).toHaveTextContent('granularity_sqla');

  rerender(
    <StashFormDataContainer shouldStash fieldNames={['granularity_sqla']}>
      <FormDataMock />
    </StashFormDataContainer>,
  );
  expect(container.querySelector('div')).not.toHaveTextContent(
    'granularity_sqla',
  );
});

test('should restore form data from fieldNames', async () => {
  const { granularity_sqla, ...formData } = defaultState.form_data;
  const { container } = render(
    <StashFormDataContainer
      shouldStash={false}
      fieldNames={['granularity_sqla']}
    >
      <FormDataMock />
    </StashFormDataContainer>,
    {
      useRedux: true,
      initialState: {
        explore: {
          form_data: formData,
          hiddenFormData: {
            granularity_sqla,
          },
        },
      },
    },
  );
  await waitFor(() =>
    expect(container.querySelector('div')).toHaveTextContent(
      'granularity_sqla',
    ),
  );
});
