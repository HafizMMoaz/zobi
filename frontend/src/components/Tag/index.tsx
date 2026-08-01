
import { styled } from '@zobi.dev/extension-api/theme';
import { Link } from 'react-router-dom';
import type { TagType } from 'src/types/TagType';
import { Tag as AntdTag } from '@zobi.dev/core/components/Tag';
import { Tooltip } from '@zobi.dev/core/components/Tooltip';
import type { TagProps } from 'antd/es';
import type { CheckableTagProps } from 'antd/es/tag';
import { useMemo } from 'react';

const StyledTag = styled(AntdTag)`
  ${({ theme }) => `
  margin-top: ${theme.sizeUnit}px;
  margin-bottom: ${theme.sizeUnit}px;
  `};
`;

const MAX_DISPLAY_CHAR = 20;

const ZobiTag = ({
  name,
  id,
  index = undefined,
  onDelete = undefined,
  editable = false,
  onClick = undefined,
  toolTipTitle = name,
  children,
  ...rest
}: TagType) => {
  const tagDisplay = useMemo(() => {
    if (!name) return null;
    const isLongTag = name.length > MAX_DISPLAY_CHAR;
    return isLongTag ? `${name.slice(0, MAX_DISPLAY_CHAR)}...` : name;
  }, [name]);

  const handleClose = () => (index !== undefined ? onDelete?.(index) : null);

  const whatRole = onClick ? (!id ? 'button' : 'link') : undefined;

  const tagElem = (
    <>
      {editable ? (
        <Tooltip title={toolTipTitle} key={toolTipTitle}>
          <StyledTag
            key={id}
            closable={editable}
            onClose={handleClose}
            closeIcon={editable}
            {...rest}
          >
            {children || tagDisplay}
          </StyledTag>
        </Tooltip>
      ) : (
        <Tooltip title={toolTipTitle} key={toolTipTitle}>
          <StyledTag
            data-test="tag"
            key={id}
            onClick={onClick}
            role={whatRole}
            {...rest}
          >
            {' '}
            {id ? (
              <Link
                to={`/zobi/all_entities/?id=${id}`}
                target="_blank"
                rel="noreferrer"
              >
                {children || tagDisplay}
              </Link>
            ) : (
              children || tagDisplay
            )}
          </StyledTag>
        </Tooltip>
      )}
    </>
  );

  return tagElem;
};

export const Tag = Object.assign(ZobiTag, {
  CheckableTag: AntdTag.CheckableTag,
});
export type { TagProps, CheckableTagProps, TagType };
