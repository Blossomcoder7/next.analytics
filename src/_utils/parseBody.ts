import { NextRequest } from "next/server";

/**
 * Parse the body of a NextRequest into a JavaScript value.
 * @param request The request to parse the body of.
 * @returns A Promise that resolves to the parsed body.
 * The type of the parsed body depends on the content type of the request.
 * If the content type is application/json, the parsed body will be a JSON object.
 * If the content type is application/x-www-form-urlencoded, the parsed body will be an object with the same keys as the form data.
 * If the content type is multipart/form-data, the parsed body will be an object with the same keys as the form data.
 * If the content type is text/plain, the parsed body will be a string.
 * Otherwise, the parsed body will be an array buffer.
 */
export default async function parseBody(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return Object.fromEntries(formData);
  }
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return Object.fromEntries(formData);
  }
  if (contentType.includes("text/plain")) {
    return request.text();
  }
  return request.arrayBuffer();
}
