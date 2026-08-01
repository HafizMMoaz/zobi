/**
 * Parse multipart form data sent via POST requests.
 */
export default function parsePostForm(requestBody: ArrayBuffer) {
  type ParsedFields = Record<string, string[] | string>;
  if (requestBody.constructor.name !== 'ArrayBuffer') {
    return requestBody;
  }
  const lines = new TextDecoder('utf-8').decode(requestBody).split('\n');
  const fields: ParsedFields = {};
  let key = '';
  let value: string[] = [];

  function addField(key: string, value: string) {
    if (key in fields) {
      if (Array.isArray(fields[key])) {
        (fields[key] as string[]).push(value);
      } else {
        fields[key] = [fields[key] as string, value];
      }
    } else {
      fields[key] = value;
    }
  }

  lines.forEach(line => {
    const nameMatch = line.match(/Content-Disposition: form-data; name="(.*)"/);
    if (nameMatch) {
      if (key) {
        addField(key, value.join('\n'));
      }
      key = nameMatch[1];
      value = [];
    } else if (!/----.*FormBoundary/.test(line)) {
      value.push(line);
    }
  });
  if (key && value) {
    addField(key, value.join('\n'));
  }
  return fields;
}
