
import PropTypes from 'prop-types';

import { ColumnMeta } from '@zobi-ui/chart-controls';
import { InfoTooltip } from '@zobi-ui/core/components';

const propTypes = {
  option: PropTypes.object.isRequired,
};

// This component provides a general tooltip for options
// in a SelectControl
// TODO use theme.sizeUnit once theme can be imported in plugins
export default function OptionDescription({ option }: { option: ColumnMeta }) {
  return (
    <span>
      <span className="option-label" style={{ marginRight: 4 }}>
        {option.label}
      </span>
      {option.description && (
        <InfoTooltip
          type="question"
          tooltip={option.description}
          label={`descr-${option.label}`}
        />
      )}
    </span>
  );
}
OptionDescription.propTypes = propTypes;
