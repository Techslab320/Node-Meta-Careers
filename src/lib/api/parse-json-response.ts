export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const fallbackText = (await response.text()).trim();
    const message = fallbackText
      ? fallbackText.slice(0, 200)
      : response.ok
        ? "Unexpected server response. Please refresh and try again."
        : "Request failed. Please try again.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}
