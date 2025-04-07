import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  methodOrUrl: string,
  urlOrData?: string | unknown,
  data?: unknown | undefined,
): Promise<any> {
  let method = 'GET';
  let url = methodOrUrl;
  let body = undefined;

  // Handle both forms: apiRequest(url) and apiRequest(method, url, data)
  if (urlOrData && typeof urlOrData === 'string') {
    method = methodOrUrl;
    url = urlOrData;
    body = data ? JSON.stringify(data) : undefined;
  }

  const res = await fetch(url, {
    method,
    headers: (data || (urlOrData && typeof urlOrData !== 'string')) ? 
      { "Content-Type": "application/json" } : {},
    body: body || (urlOrData && typeof urlOrData !== 'string' ? 
      JSON.stringify(urlOrData) : undefined),
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
