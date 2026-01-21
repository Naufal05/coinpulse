"use server";

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error("Could not get base url");
if (!API_KEY) throw new Error("Could not get api key");

type QueryParams = Record<string, string | number | boolean | undefined>;

type CoinGeckoErrorBody = {
  error?: string;
};

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  // Build full URL with query params
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  // Call API
  const response = await fetch(url, {
    headers: {
      "x-cg-pro-api-key": API_KEY,
      "Content-Type": "application/json",
    } as Record<string, string>,
    next: { revalidate },
  });

  // Handle errors
  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      `API Error ${response.status}: ${errorBody.error || response.statusText}`,
    );
  }

  // Return parsed JSON
  return (await response.json()) as T;
}
