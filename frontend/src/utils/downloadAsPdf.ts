import { SyntheticEvent } from 'react';
import domToPdf from 'dom-to-pdf';
import { kebabCase } from 'lodash';
import { t } from '@zobi.dev/extension-api/translation';
import { logging } from '@zobi.dev/extension-api/utils';
import { addWarningToast } from 'src/components/MessageToasts/actions';
import getBootstrapData from 'src/utils/getBootstrapData';

const pdfCompressionLevel = getBootstrapData().common.pdf_compression_level;

/**
 * generate a consistent file stem from a description and date
 *
 * @param description title or description of content of file
 * @param date date when file was generated
 */
const generateFileStem = (description: string, date = new Date()) =>
  `${kebabCase(description)}-${date.toISOString().replace(/[: ]/g, '-')}`;

/**
 * Create an event handler for turning an element into an image
 *
 * @param selector css selector of the parent element which should be turned into image
 * @param description name or a short description of what is being printed.
 *   Value will be normalized, and a date as well as a file extension will be added.
 * @param isExactSelector if false, searches for the closest ancestor that matches selector.
 * @returns event handler
 */
export default function downloadAsPdf(
  selector: string,
  description: string,
  isExactSelector = false,
) {
  return (event: SyntheticEvent) => {
    const elementToPrint = isExactSelector
      ? document.querySelector(selector)
      : event.currentTarget.closest(selector);

    if (!elementToPrint) {
      return addWarningToast(
        t('PDF download failed, please refresh and try again.'),
      );
    }

    const options = {
      margin: 10,
      compression: pdfCompressionLevel,
      filename: `${generateFileStem(description)}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      excludeClassNames: ['header-controls'],
    };
    return domToPdf(elementToPrint, options)
      .then(() => {
        // nothing to be done
      })
      .catch((e: Error) => {
        logging.error('PDF generation failed', e);
      });
  };
}
