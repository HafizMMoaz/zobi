const loadModule = () => {
  try {
    // eslint-disable-next-line global-require, import/no-unresolved
    return require('../../../zobi_text') || {};
  } catch (e) {
    return {};
  }
};

const zobiText = loadModule();

export default zobiText;
