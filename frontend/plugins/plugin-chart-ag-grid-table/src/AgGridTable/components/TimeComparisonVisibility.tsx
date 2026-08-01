/* eslint-disable import/no-extraneous-dependencies */
import { useState } from 'react';
import { Dropdown } from 'antd';
import { TableOutlined, DownOutlined, CheckOutlined } from '@ant-design/icons';
import { t } from '@zobi/core/translation';
import { InfoText, ColumnLabel, CheckIconWrapper } from '../../styles';

interface ComparisonColumn {
  key: string;
  label: string;
}

interface TimeComparisonVisibilityProps {
  comparisonColumns: ComparisonColumn[];
  selectedComparisonColumns: string[];
  onSelectionChange: (selectedColumns: string[]) => void;
}

const TimeComparisonVisibility: React.FC<TimeComparisonVisibilityProps> = ({
  comparisonColumns,
  selectedComparisonColumns,
  onSelectionChange,
}) => {
  const [showComparisonDropdown, setShowComparisonDropdown] = useState(false);

  const allKey = comparisonColumns[0].key;

  const handleOnClick = (data: any) => {
    const { key } = data;
    // Toggle 'All' key selection
    if (key === allKey) {
      onSelectionChange([allKey]);
    } else if (selectedComparisonColumns.includes(allKey)) {
      onSelectionChange([key]);
    } else {
      // Toggle selection for other keys
      onSelectionChange(
        selectedComparisonColumns.includes(key)
          ? selectedComparisonColumns.filter((k: string) => k !== key) // Deselect if already selected
          : [...selectedComparisonColumns, key],
      ); // Select if not already selected
    }
  };

  const handleOnBlur = () => {
    if (selectedComparisonColumns.length === 3) {
      onSelectionChange([comparisonColumns[0].key]);
    }
  };

  return (
    <Dropdown
      placement="bottomRight"
      open={showComparisonDropdown}
      onOpenChange={(flag: boolean) => {
        setShowComparisonDropdown(flag);
      }}
      menu={{
        multiple: true,
        onClick: handleOnClick,
        onBlur: handleOnBlur,
        selectedKeys: selectedComparisonColumns,
        items: [
          {
            key: 'all',
            label: (
              <InfoText>
                {t(
                  'Select columns that will be displayed in the table. You can multiselect columns.',
                )}
              </InfoText>
            ),
            type: 'group',
            children: comparisonColumns.map((column: ComparisonColumn) => ({
              key: column.key,
              label: (
                <>
                  <ColumnLabel>{column.label}</ColumnLabel>
                  <CheckIconWrapper>
                    {selectedComparisonColumns.includes(column.key) && (
                      <CheckOutlined />
                    )}
                  </CheckIconWrapper>
                </>
              ),
            })),
          },
        ],
      }}
      trigger={['click']}
    >
      <span>
        <TableOutlined /> <DownOutlined />
      </span>
    </Dropdown>
  );
};

export default TimeComparisonVisibility;
