import { logging } from '@zobi.dev/extension-api/utils';
import { commands as commandsApi } from '@zobi.dev/extension-api';
import { Disposable } from '../models';

type Command = commandsApi.Command;

const commandsMap: Map<string, Command> = new Map();

const commandRegistry: Map<string, (...args: any[]) => any> = new Map();

const registerCommand: typeof commandsApi.registerCommand = (
  command: Command,
  callback: (...args: any[]) => any,
  thisArg?: any,
): Disposable => {
  const { id } = command;

  if (commandRegistry.has(id)) {
    logging.warn(
      `Command "${id}" is already registered. Overwriting the existing command.`,
    );
  }

  commandsMap.set(id, command);
  const boundCallback = thisArg ? callback.bind(thisArg) : callback;
  commandRegistry.set(id, boundCallback);

  return new Disposable(() => {
    commandsMap.delete(id);
    commandRegistry.delete(id);
  });
};

const executeCommand: typeof commandsApi.executeCommand = async <T>(
  command: string,
  ...args: any[]
): Promise<T> => {
  const callback = commandRegistry.get(command);
  if (!callback) {
    throw new Error(`Command "${command}" not found.`);
  }
  return callback(...args) as T;
};

const getCommands: typeof commandsApi.getCommands = (): Command[] =>
  Array.from(commandsMap.values());

const getCommand: typeof commandsApi.getCommand = (
  id: string,
): Command | undefined => commandsMap.get(id);

export const resetContributions = (): void => {
  commandsMap.clear();
  commandRegistry.clear();
};

export const commands: typeof commandsApi = {
  registerCommand,
  executeCommand,
  getCommands,
  getCommand,
};
