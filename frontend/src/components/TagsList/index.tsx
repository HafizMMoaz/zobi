
import { useMemo, useState } from 'react';
import { styled } from '@zobi/core/theme';
import type { TagType } from 'src/types/TagType';
import { Tag } from 'src/components/Tag';

export type TagsListProps = {
  tags: TagType[];
  editable?: boolean;
  /**
   * OnDelete:
   * Only applies when editable is true
   * Callback for when a tag is deleted
   */
  onDelete?: ((index: number) => void) | undefined;
  maxTags?: number | undefined;
};

const TagsDiv = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const TagsList = ({
  tags,
  editable = false,
  onDelete,
  maxTags,
}: TagsListProps) => {
  const sortedTags = useMemo(
    () =>
      tags.toSorted((a, b) => {
        const nameA = a.name ?? '';
        const nameB = b.name ?? '';
        return nameA.localeCompare(nameB);
      }),
    [tags],
  );
  const [tempMaxTags, setTempMaxTags] = useState<number | undefined>(maxTags);

  const handleDelete = (index: number) => {
    onDelete?.(index);
  };

  const expand = () => setTempMaxTags(undefined);

  const collapse = () => setTempMaxTags(maxTags);

  const tagsIsLong: boolean | null = useMemo(
    () => (tempMaxTags ? sortedTags.length > tempMaxTags : null),
    [sortedTags.length, tempMaxTags],
  );

  const extraTags: number | null = useMemo(
    () =>
      typeof tempMaxTags === 'number'
        ? sortedTags.length - tempMaxTags + 1
        : null,
    [tagsIsLong, sortedTags.length, tempMaxTags],
  );

  return (
    <TagsDiv className="tag-list">
      {tagsIsLong && typeof tempMaxTags === 'number' ? (
        <>
          {sortedTags.slice(0, tempMaxTags - 1).map((tag: TagType, index) => (
            <Tag
              id={tag.id}
              key={tag.id}
              name={tag.name}
              index={index}
              onDelete={handleDelete}
              editable={editable}
            />
          ))}
          {sortedTags.length > tempMaxTags ? (
            <Tag
              name={`+${extraTags}...`}
              onClick={expand}
              toolTipTitle={sortedTags.map(t => t.name).join(', ')}
            />
          ) : null}
        </>
      ) : (
        <>
          {sortedTags.map((tag: TagType, index) => (
            <Tag
              id={tag.id}
              key={tag.id}
              name={tag.name}
              index={index}
              onDelete={handleDelete}
              editable={editable}
            />
          ))}
          {maxTags ? (
            sortedTags.length > maxTags ? (
              <Tag name="..." onClick={collapse} />
            ) : null
          ) : null}
        </>
      )}
    </TagsDiv>
  );
};
