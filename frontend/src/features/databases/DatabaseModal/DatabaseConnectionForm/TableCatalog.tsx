import { t } from '@zobi/core/translation';
import { css, ZobiTheme } from '@zobi/core/theme';
import {
  FormLabel,
  LabeledErrorBoundInput as ValidatedInput,
} from '@zobi-ui/core/components';
import { Icons } from '@zobi-ui/core/components/Icons';
import { Typography } from '@zobi-ui/core/components/Typography';
import { StyledFooterButton, StyledCatalogTable } from '../styles';
import { CatalogObject, FieldPropTypes } from '../../types';

export const TableCatalog = ({
  required,
  changeMethods,
  getValidation,
  validationErrors,
  db,
}: FieldPropTypes) => {
  const tableCatalog = db?.catalog || [];
  const catalogError = validationErrors || {};
  return (
    <StyledCatalogTable>
      <Typography.Title level={4} className="gsheet-title">
        {t('Connect Google Sheets as tables to this database')}
      </Typography.Title>
      <div>
        {tableCatalog?.map((sheet: CatalogObject, idx: number) => (
          <>
            <FormLabel className="catalog-label">
              {t('Google Sheet Name and URL')}
            </FormLabel>
            <div className="catalog-name">
              <ValidatedInput
                className="catalog-name-input"
                required={required}
                validationMethods={{ onBlur: getValidation }}
                errorMessage={catalogError[idx]?.name}
                placeholder={t('Enter a name for this sheet')}
                onChange={(e: { target: { value: any } }) => {
                  changeMethods.onParametersChange({
                    target: {
                      type: `catalog-${idx}`,
                      name: 'name',
                      value: e.target.value,
                    },
                  });
                }}
                value={sheet.name}
              />
              {tableCatalog?.length > 1 && (
                <Icons.CloseOutlined
                  css={(theme: ZobiTheme) => css`
                    align-self: center;
                    background: ${theme.colorFillSecondary};
                    margin: 5px 5px 8px 5px;

                    &.anticon > * {
                      line-height: 0;
                    }
                  `}
                  iconSize="m"
                  onClick={() => changeMethods.onRemoveTableCatalog(idx)}
                />
              )}
            </div>
            <ValidatedInput
              className="catalog-name-url"
              required={required}
              validationMethods={{ onBlur: getValidation }}
              errorMessage={catalogError[idx]?.url}
              placeholder={t('Paste the shareable Google Sheet URL here')}
              onChange={(e: { target: { value: any } }) =>
                changeMethods.onParametersChange({
                  target: {
                    type: `catalog-${idx}`,
                    name: 'value',
                    value: e.target.value,
                  },
                })
              }
              value={sheet.value}
            />
          </>
        ))}
        <StyledFooterButton
          className="catalog-add-btn"
          onClick={() => {
            changeMethods.onAddTableCatalog();
          }}
        >
          + {t('Add sheet')}
        </StyledFooterButton>
      </div>
      <div className="helper">
        <div>
          {t(
            'In order to connect to non-public sheets you need to either provide a service account or configure an OAuth2 client.',
          )}
        </div>
      </div>
    </StyledCatalogTable>
  );
};
