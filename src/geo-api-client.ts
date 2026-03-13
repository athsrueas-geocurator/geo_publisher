export const DEFAULT_GEO_API_ENDPOINT = "https://testnet-api.geobrowser.io/graphql";

export type GraphQLRequestOptions = {
  variables?: Record<string, unknown>;
  operationName?: string;
  endpoint?: string;
};

type GraphQLErrorPayload = {
  message?: string;
  [key: string]: unknown;
};

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: GraphQLErrorPayload[];
};

export class GeoApiRequestError extends Error {
  status: number;
  statusText: string;
  errors?: GraphQLErrorPayload[];

  constructor(message: string, status: number, statusText: string, errors?: GraphQLErrorPayload[]) {
    super(message);
    this.name = "GeoApiRequestError";
    this.status = status;
    this.statusText = statusText;
    this.errors = errors;
  }
}

export function resolveGeoApiEndpoint(customEndpoint?: string): string {
  return customEndpoint ?? process.env.GEO_API_ENDPOINT ?? DEFAULT_GEO_API_ENDPOINT;
}

export async function geoGraphqlRequest<TData>(
  query: string,
  options: GraphQLRequestOptions = {},
): Promise<TData> {
  const endpoint = resolveGeoApiEndpoint(options.endpoint);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: options.variables,
      operationName: options.operationName,
    }),
  });

  let json: GraphQLResponse<TData>;
  try {
    json = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    throw new GeoApiRequestError(
      `API error: ${response.status} ${response.statusText} (invalid JSON response)`,
      response.status,
      response.statusText,
    );
  }

  if (!response.ok) {
    throw new GeoApiRequestError(
      `API error: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText,
      json.errors,
    );
  }

  if (json.errors && json.errors.length > 0) {
    const firstMessage = json.errors[0]?.message ?? "Unknown GraphQL error";
    throw new GeoApiRequestError(
      `GraphQL: ${firstMessage}`,
      response.status,
      response.statusText,
      json.errors,
    );
  }

  if (json.data === undefined) {
    throw new GeoApiRequestError(
      "GraphQL response missing data",
      response.status,
      response.statusText,
      json.errors,
    );
  }

  return json.data;
}
