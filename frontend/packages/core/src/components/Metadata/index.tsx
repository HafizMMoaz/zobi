
import { styled } from '@zobi.dev/extension-api/theme';

const MetadataWrapper = styled.div`
  display: flex;
  width: 100%;
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: ${({ theme }) => theme.sizeUnit}px;
`;

const MetadataText = styled.span`
  font-size: ${({ theme }) => theme.fontSizeXS}px;
  color: ${({ theme }) => theme.colorTextSecondary};
  font-weight: ${({ theme }) => theme.fontWeightStrong};
`;

export type MetadataProps = {
  value: string;
};

const Metadata: React.FC<MetadataProps> = ({ value }) => (
  <MetadataWrapper>
    <MetadataText>{value}</MetadataText>
  </MetadataWrapper>
);

export default Metadata;
