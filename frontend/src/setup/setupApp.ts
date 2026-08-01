/* eslint global-require: 0 */
import $ from 'jquery';
import {
  ZobiClient,
  getClientErrorObject,
  ClientErrorObject,
} from '@zobi-ui/core';
import setupErrorMessages from 'src/setup/setupErrorMessages';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

function showApiMessage(resp: ClientErrorObject) {
  const template =
    '<div class="alert"> ' +
    '<button type="button" class="close" ' +
    'data-dismiss="alert">\xD7</button> </div>';
  const severity = resp.severity || 'info';
  $(template)
    .addClass(`alert-${severity}`)
    .append(resp.message || '')
    .appendTo($('#alert-container'));
}

function toggleCheckbox(apiUrlPrefix: string, selector: string) {
  ZobiClient.get({
    endpoint: apiUrlPrefix + ($(selector)[0] as HTMLInputElement).checked,
  })
    .then(() => undefined)
    .catch(response =>
      getClientErrorObject(response).then(parsedResp => {
        if (parsedResp?.message) {
          showApiMessage(parsedResp);
        }
      }),
    );
}

export default function setupApp() {
  $(document).ready(function () {
    $(':checkbox[data-checkbox-api-prefix]').change(function (
      this: HTMLElement,
    ) {
      const $this = $(this);
      const prefix = $this.data('checkbox-api-prefix');
      const id = $this.attr('id');
      toggleCheckbox(prefix, `#${id}`);
    });

    // for language picker dropdown
    $<HTMLAnchorElement>('#language-picker a').click(function (
      ev: JQuery.ClickEvent<
        HTMLAnchorElement,
        null,
        HTMLAnchorElement,
        HTMLAnchorElement
      >,
    ) {
      ev.preventDefault();
      ZobiClient.get({
        url: ev.currentTarget.href,
        parseMethod: null,
      }).then(() => {
        window.location.reload();
      });
    });
  });

  // A set of hacks to allow apps to run within a FAB template
  // this allows for the server side generated menus to function
  window.$ = $;
  window.jQuery = $;

  // set up app wide custom error messages
  setupErrorMessages();
}
