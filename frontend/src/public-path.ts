import { staticAssetsPrefix } from './utils/getBootstrapData';

// Prefix the defined webpack public path with our configured prefix
__webpack_public_path__ = `${staticAssetsPrefix()}${__webpack_public_path__}`;
