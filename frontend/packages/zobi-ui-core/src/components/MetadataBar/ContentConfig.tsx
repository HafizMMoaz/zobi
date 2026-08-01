import { t } from '@zobi/core-legacy/translation';
import { ensureIsArray } from '@zobi-ui/core';
import { styled } from '@zobi/core-legacy/theme';
import { Icons } from '@zobi-ui/core/components/Icons';
import { ContentType, MetadataType } from '.';

const Header = styled.div`
  font-weight: ${({ theme }) => theme.fontWeightBold};
`;

const Info = ({
  text,
  header,
}: {
  text?: string | string[];
  header?: string;
}) => {
  const values = ensureIsArray(text);
  return (
    <>
      {header && <Header>{header}</Header>}
      {values.map(value => (
        <div key={value}>{value}</div>
      ))}
    </>
  );
};

const config = (contentType: ContentType) => {
  const { type } = contentType;

  /**
   * Tooltips are very similar. It's pretty much blocks
   * of header/text pairs. That's why they are implemented here.
   * If more complex tooltips emerge, then we should extract the different
   * types of tooltips to their own components and reference them here.
   */

  switch (type) {
    case MetadataType.Dashboards:
      return {
        icon: Icons.FundProjectionScreenOutlined,
        title: contentType.title,
        tooltip: contentType.description ? (
          <div>
            <Info header={contentType.title} text={contentType.description} />
          </div>
        ) : undefined,
      };

    case MetadataType.Description:
      return {
        icon: Icons.BookOutlined,
        title: contentType.value,
      };

    case MetadataType.LastModified:
      return {
        icon: Icons.EditOutlined,
        title: contentType.value,
        tooltip: (
          <div>
            <Info header={t('Last modified')} text={contentType.value} />
            <Info header={t('Modified by')} text={contentType.modifiedBy} />
          </div>
        ),
      };

    case MetadataType.Owner:
      return {
        icon: Icons.UserOutlined,
        title: contentType.createdBy,
        tooltip: (
          <div>
            <Info header={t('Created by')} text={contentType.createdBy} />
            {!!contentType.owners && (
              <Info header={t('Owners')} text={contentType.owners} />
            )}
            <Info header={t('Created on')} text={contentType.createdOn} />
          </div>
        ),
      };

    case MetadataType.Rows:
      return {
        icon: Icons.InsertRowBelowOutlined,
        title: contentType.title,
        tooltip: contentType.title,
      };

    case MetadataType.Sql:
      return {
        icon: Icons.ConsoleSqlOutlined,
        title: contentType.title,
        tooltip: contentType.title,
      };

    case MetadataType.Table:
      return {
        icon: Icons.InsertRowAboveOutlined,
        title: contentType.title,
        tooltip: contentType.title,
      };

    case MetadataType.Tags:
      return {
        icon: Icons.TagsOutlined,
        title: contentType.values.join(', '),
        tooltip: (
          <div>
            <Info header={t('Tags')} text={contentType.values} />
          </div>
        ),
      };

    default:
      throw new Error(`Invalid type provided: ${type}`);
  }
};

export { config };
