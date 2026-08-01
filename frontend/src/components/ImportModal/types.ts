import {
  FileEncryptedExtraFields,
  ImportResourceName,
} from 'src/views/CRUD/types';

export interface ImportModelsModalProps {
  resourceName: ImportResourceName;
  resourceLabel: string;
  passwordsNeededMessage: string;
  confirmOverwriteMessage: string;
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  onModelImport: () => void;
  show: boolean;
  onHide: () => void;
  passwordFields?: string[];
  setPasswordFields?: (passwordFields: string[]) => void;
  sshTunnelPasswordFields?: string[];
  setSSHTunnelPasswordFields?: (sshTunnelPasswordFields: string[]) => void;
  sshTunnelPrivateKeyFields?: string[];
  setSSHTunnelPrivateKeyFields?: (sshTunnelPrivateKeyFields: string[]) => void;
  sshTunnelPrivateKeyPasswordFields?: string[];
  setSSHTunnelPrivateKeyPasswordFields?: (
    sshTunnelPrivateKeyPasswordFields: string[],
  ) => void;
  encryptedExtraFields?: FileEncryptedExtraFields[];
  setEncryptedExtraFields?: (
    encryptedExtraFields: FileEncryptedExtraFields[],
  ) => void;
}
