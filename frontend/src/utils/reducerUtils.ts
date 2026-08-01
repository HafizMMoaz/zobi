import { nanoid } from 'nanoid';

interface ObjectWithId {
  id?: string;
  [key: string]: any;
}

interface StateWithObject {
  [key: string]: { [id: string]: ObjectWithId } | any;
}

interface StateWithArray {
  [key: string]: ObjectWithId[] | any;
}

export function addToObject<T extends ObjectWithId>(
  state: StateWithObject,
  arrKey: string,
  obj: T,
): StateWithObject {
  const newObject = { ...state[arrKey] };
  const copiedObject = { ...obj };

  if (!copiedObject.id) {
    copiedObject.id = nanoid();
  }
  newObject[copiedObject.id] = copiedObject;
  return { ...state, [arrKey]: newObject };
}

export function alterInObject<T extends ObjectWithId>(
  state: StateWithObject,
  arrKey: string,
  obj: T,
  alterations: Partial<T>,
): StateWithObject {
  const newObject = { ...state[arrKey] };
  newObject[obj.id!] = { ...newObject[obj.id!], ...alterations };
  return { ...state, [arrKey]: newObject };
}

export function alterInArr<T extends ObjectWithId>(
  state: StateWithArray,
  arrKey: string,
  obj: T,
  alterations: Partial<T>,
): StateWithArray {
  // Finds an item in an array in the state and replaces it with a
  // new object with an altered property
  const idKey = 'id';
  const newArr: T[] = [];
  state[arrKey].forEach((arrItem: T) => {
    if (obj[idKey] === arrItem[idKey]) {
      newArr.push({ ...arrItem, ...alterations });
    } else {
      newArr.push(arrItem);
    }
  });
  return { ...state, [arrKey]: newArr };
}

export function removeFromArr<T extends ObjectWithId>(
  state: StateWithArray,
  arrKey: string,
  obj: T,
  idKey = 'id',
): StateWithArray {
  const newArr: T[] = [];
  state[arrKey].forEach((arrItem: T) => {
    if (!(obj[idKey as keyof T] === arrItem[idKey as keyof T])) {
      newArr.push(arrItem);
    }
  });
  return { ...state, [arrKey]: newArr };
}

export function addToArr<T extends ObjectWithId>(
  state: StateWithArray,
  arrKey: string,
  obj: T,
): StateWithArray {
  const newObj = { ...obj };
  if (!newObj.id) {
    newObj.id = nanoid();
  }
  const newState: { [key: string]: T[] } = {};
  newState[arrKey] = [...state[arrKey], newObj];
  return { ...state, ...newState };
}
