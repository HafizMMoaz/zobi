import { Label } from '@zobi.dev/core/components';
import { STATE_TYPE_MAP, STATE_TYPE_MAP_LOCALIZED } from 'src/SqlLab/constants';
import { Query } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';

interface QueryStateLabelProps {
  query: Pick<Query, 'state'>;
}

const StyledLabel = styled(Label)`
  margin-right: ${({ theme }) => theme.sizeUnit}px;
`;

export default function QueryStateLabel({ query }: QueryStateLabelProps) {
  return (
    <StyledLabel type={STATE_TYPE_MAP[query.state]}>
      {STATE_TYPE_MAP_LOCALIZED[query.state]}
    </StyledLabel>
  );
}
