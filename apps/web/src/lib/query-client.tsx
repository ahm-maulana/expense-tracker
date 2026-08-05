"use client";

import {
	environmentManager,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				retry: 1,
			},
		},
	});
}

let browserQueryClient: QueryClient;

function getQueryClient() {
	if (environmentManager.isServer()) {
		return makeQueryClient();
	} else {
		if (!browserQueryClient) browserQueryClient = makeQueryClient();
		return browserQueryClient;
	}
}

export default function QueryProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
