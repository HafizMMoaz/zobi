import { Button, type OnClickHandler } from '@zobi-ui/core/components';
import { FC } from 'react';
import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';

const RemovedContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px; // arbitrary
  text-align: center;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colorText};
`;

type RemovedFilterProps = {
  onClick: OnClickHandler;
};

const RemovedFilter: FC<RemovedFilterProps> = ({ onClick }) => (
  <RemovedContent>
    <p>{t('You have removed this filter.')}</p>
    <div>
      <Button
        data-test="restore-filter-button"
        buttonStyle="primary"
        onClick={onClick}
      >
        {t('Restore filter')}
      </Button>
    </div>
  </RemovedContent>
);

export default RemovedFilter;
