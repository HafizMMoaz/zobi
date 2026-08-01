import { ZobiClient } from '@zobi-ui/core';
import { logging } from '@zobi/core/utils';
import rison from 'rison';
import { parse as parseContentDisposition } from 'content-disposition';

// Maximum blob size for in-memory downloads (100MB)
const MAX_BLOB_SIZE = 100 * 1024 * 1024;

/**
 * Downloads a blob as a file using a temporary anchor element
 * @param blob - The blob to download
 * @param fileName - The filename to use for the download
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    window.URL.revokeObjectURL(url);
  }
}

export default async function handleResourceExport(
  resource: string,
  ids: number[],
  done: () => void,
): Promise<void> {
  const endpoint = `/api/v1/${resource}/export/?q=${rison.encode(ids)}`;

  try {
    // Use fetch with blob response instead of iframe to avoid CSP frame-src violations
    const response = await ZobiClient.get({
      endpoint,
      headers: {
        Accept: 'application/zip, application/x-zip-compressed, text/plain',
      },
      parseMethod: 'raw',
    });

    // Check content length to prevent memory issues with large exports
    const contentLength = response.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BLOB_SIZE) {
      logging.warn(
        `Export file size (${contentLength} bytes) exceeds maximum blob size (${MAX_BLOB_SIZE} bytes). Large exports may cause memory issues.`,
      );
    }

    // Parse filename from Content-Disposition header
    const disposition = response.headers.get('Content-Disposition');
    let fileName = `${resource}_export.zip`;

    if (disposition) {
      try {
        const parsed = parseContentDisposition(disposition);
        if (parsed?.parameters?.filename) {
          fileName = parsed.parameters.filename;
        }
      } catch (error) {
        logging.warn('Failed to parse Content-Disposition header:', error);
      }
    }

    // Convert response to blob and trigger download
    const blob = await response.blob();
    downloadBlob(blob, fileName);

    done();
  } catch (error) {
    logging.error('Resource export failed:', error);
    done();
    throw error;
  }
}
