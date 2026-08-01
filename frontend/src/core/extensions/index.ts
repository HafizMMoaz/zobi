import { extensions as extensionsApi } from '@zobi/core';
import ExtensionsLoader from 'src/extensions/ExtensionsLoader';

const getExtension: typeof extensionsApi.getExtension = id =>
  ExtensionsLoader.getInstance().getExtension(id);

const getAllExtensions: typeof extensionsApi.getAllExtensions = () =>
  ExtensionsLoader.getInstance().getExtensions();

export const extensions: typeof extensionsApi = {
  getExtension,
  getAllExtensions,
};
