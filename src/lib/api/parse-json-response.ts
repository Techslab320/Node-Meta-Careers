export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      response.ok
        ? "Unexpected server response. Please refresh and try again."
        : "Request failed. Please try again.",
    );
  }

  return (await response.json()) as T;
}
