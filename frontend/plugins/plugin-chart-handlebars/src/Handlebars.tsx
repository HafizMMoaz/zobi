import { styled } from '@zobi/core/theme';
import { createRef } from 'react';
import { HandlebarsViewer } from './components/Handlebars/HandlebarsViewer';
import { HandlebarsProps, HandlebarsStylesProps } from './types';

const Styles = styled.div<HandlebarsStylesProps>`
  padding: ${({ theme }) => theme.sizeUnit * 4}px;
  border-radius: ${({ theme }) => theme.borderRadius}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  overflow: auto;
`;

export default function Handlebars(props: HandlebarsProps) {
  const { data, height, width, formData } = props;
  const styleTemplateSource = formData.styleTemplate
    ? `<style>${formData.styleTemplate}</style>`
    : '';
  const handlebarTemplateSource = formData.handlebarsTemplate
    ? formData.handlebarsTemplate
    : '{{data}}';
  const templateSource = `${handlebarTemplateSource}\n${styleTemplateSource} `;

  const rootElem = createRef<HTMLDivElement>();

  return (
    <Styles ref={rootElem} height={height} width={width}>
      <HandlebarsViewer data={{ data }} templateSource={templateSource} />
    </Styles>
  );
}
