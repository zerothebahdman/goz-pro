// thanks to chatjibiti
const ISO_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * Check if 2 full names are the same regardless of order
 * @param reference full name to use as reference
 * @param fullName full name to test
 */
export function isSameName(reference: string, fullName: string) {
  const [a, b] = [reference, fullName].map((x) => x.split(/\s+|,|-/g).map((y) => y.toLowerCase().trim()));
  let match = 0;

  for (let i = 0; i < a.length; i++) {
    if (b.includes(a[i])) {
      const matchIndex = b.indexOf(a[i]);
      b.splice(matchIndex, 1);
      match++;
    }
  }

  return match >= 2;
}

/**
 * JSON reviver to ensure dates get parsed
 * @param _key ignored
 * @param json value in JSON string
 */
export function dateReviver(_key: string, json: string) {
  if (typeof json !== 'string' || !ISO_REGEX.test(json)) {
    return json;
  }

  return new Date(json);
}

export function capitalCase(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
