
/**
 * This component is needed to be able to style GeoStyler
 * via emotion. Emotion can only be used on a component that
 * accepts a className property.
 */
import { CardStyle } from 'geostyler';
import { FC } from 'react';
import { GeoStylerWrapperProps } from './types';
import 'geostyler/dist/index.css';

export const GeoStylerWrapper: FC<GeoStylerWrapperProps> = ({
  className,
  ...passThroughProps
}) => (
  <div className={className}>
    <CardStyle {...passThroughProps} />
  </div>
);

export default GeoStylerWrapper;
