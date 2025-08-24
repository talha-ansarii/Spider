import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ProjectsListView from "@/modules/projects/ui/views/projects-list-view";

export default async function ProjectsPage() {
	const queryClient = getQueryClient();
	// Prefetch first page without query
	void queryClient.prefetchQuery(
		trpc.projects.getManyByUserId.queryOptions({ query: "", page: 1, perPage: 12 })
	);
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ProjectsListView />
		</HydrationBoundary>
	);
}
