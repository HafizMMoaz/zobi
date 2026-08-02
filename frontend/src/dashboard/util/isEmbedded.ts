export const isEmbedded = () => {
  try {
    return window.self !== window.top || window.frameElement !== null;
  } catch (e) {
    return true;
  }
};
