/**
 * `fetch` for multipart uploads, over React Native's XMLHttpRequest.
 *
 * Expo replaces the global `fetch` with `expo/fetch`, which can't send React Native's local-file
 * form parts (`{ uri, name, type }`): it throws "Unsupported FormDataPart implementation" before
 * the request leaves the device. RN's XMLHttpRequest streams those files natively.
 */
export function xhrFetch(url: string, init: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const signal = init.signal;
    const onAbort = () => xhr.abort();

    xhr.open(init.method ?? 'GET', url);
    for (const [key, value] of Object.entries((init.headers ?? {}) as Record<string, string>)) {
      xhr.setRequestHeader(key, value);
    }
    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort);
      // Statuses that can't carry a body make `new Response` throw if given one.
      const body = [204, 205, 304].includes(xhr.status) ? null : xhr.responseText;
      resolve(new Response(body, { status: xhr.status, headers: parseHeaders(xhr) }));
    };
    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new TypeError('Network request failed'));
    };
    xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));

    if (signal?.aborted) return xhr.abort();
    signal?.addEventListener('abort', onAbort);
    xhr.send(init.body as XMLHttpRequestBodyInit);
  });
}

function parseHeaders(xhr: XMLHttpRequest): Headers {
  const headers = new Headers();
  for (const line of xhr
    .getAllResponseHeaders()
    .trim()
    .split(/[\r\n]+/)) {
    const at = line.indexOf(':');
    if (at > 0) headers.append(line.slice(0, at).trim(), line.slice(at + 1).trim());
  }
  return headers;
}
