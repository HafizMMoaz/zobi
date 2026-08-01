
import { ReactElement } from 'react';

interface TelemetryPixelProps {
  version?: string;
  sha?: string;
  build?: string;
}

/**
 * Renders a telemetry pixel component to capture anonymous, aggregated telemetry via Scarf.
 * This can be disabled by setting the SCARF_ANALYTICS environment variable to false.
 *
 * @component
 * @param {TelemetryPixelProps} props - The props for the TelemetryPixel component.
 * @param {string} props.version - The version of  Zobi that's currently in use.
 * @param {string} props.sha - The SHA of Zobi that's currently in use.
 * @param {string} props.build - The build of Zobi that's currently in use.
 * @returns {JSX.Element | null} The rendered TelemetryPixel component.
 */

const PIXEL_ID = '0d3461e1-abb1-4691-a0aa-5ed50de66af0';

export const TelemetryPixel = ({
  version = 'unknownVersion',
  sha = 'unknownSHA',
  build = 'unknownBuild',
}: TelemetryPixelProps): ReactElement | null => {
  const pixelPath = `https://zobi.gateway.scarf.sh/pixel/${PIXEL_ID}/${version}/${sha}/${build}`;
  return process.env.SCARF_ANALYTICS === 'false' ? null : (
    <img
      referrerPolicy="no-referrer-when-downgrade"
      src={pixelPath}
      width={0}
      height={0}
      alt=""
    />
  );
};
