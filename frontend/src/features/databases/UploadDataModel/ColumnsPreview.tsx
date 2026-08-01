import { FC } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { Typography } from '@zobi.dev/core/components';
import { type TagType, TagsList } from 'src/components';

interface ColumnsPreviewProps {
  columns: string[];
  maxColumnsToShow?: number;
}

export const StyledDivContainer = styled.div`
  //margin-top: 10px;
  //margin-bottom: 10px;
`;

const ColumnsPreview: FC<ColumnsPreviewProps> = ({
  columns,
  maxColumnsToShow = 4,
}) => {
  const tags: TagType[] = columns.map(column => ({ name: column }));

  return (
    <StyledDivContainer>
      <Typography.Text type="secondary">{t('Columns')}:</Typography.Text>
      {columns.length === 0 ? (
        <p className="help-block">{t('Upload file to preview columns')}</p>
      ) : (
        <TagsList tags={tags} maxTags={maxColumnsToShow} />
      )}
    </StyledDivContainer>
  );
};

export default ColumnsPreview;
