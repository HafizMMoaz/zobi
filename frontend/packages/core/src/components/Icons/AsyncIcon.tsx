import { FC, SVGProps, useEffect, useRef, useState } from 'react';
import TransparentIcon from './svgs/transparent.svg';
import { IconType } from './types';
import { BaseIconComponent } from './BaseIcon';

const AsyncIcon = (props: IconType) => {
  const [, setLoaded] = useState(false);
  const ImportedSVG = useRef<FC<SVGProps<SVGSVGElement>>>();
  const { fileName, customIcons, iconSize, iconColor, viewBox, ...restProps } =
    props;

  useEffect(() => {
    let cancelled = false;
    async function importIcon(): Promise<void> {
      ImportedSVG.current = (
        await import(`!!@svgr/webpack!src/assets/images/icons/${fileName}.svg`)
      ).default;
      if (!cancelled) {
        setLoaded(true);
      }
    }
    importIcon();
    return () => {
      cancelled = true;
    };
  }, [fileName, ImportedSVG]);

  return (
    <BaseIconComponent
      component={ImportedSVG.current || TransparentIcon}
      fileName={fileName}
      customIcons={customIcons}
      iconSize={iconSize}
      iconColor={iconColor}
      viewBox={viewBox}
      {...restProps}
    />
  );
};

export default AsyncIcon;
