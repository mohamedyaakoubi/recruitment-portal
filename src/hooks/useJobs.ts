import { useQuery } from "@tanstack/react-query";
import { Job } from "@/types";

async function fetchJobs(activeOnly: boolean = true): Promise<Job[]> {
    const response = await fetch(`/api/jobs?activeOnly=${activeOnly}`);
    if (!response.ok) {
        throw new Error("Failed to fetch jobs");
    }
    const data = await response.json();
    return data.jobs || [];
}

export function useJobs(activeOnly: boolean = true) {
    return useQuery({
        queryKey: ["jobs", activeOnly],
        queryFn: () => fetchJobs(activeOnly),
    });
}
