
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: () => apiRequest("/api/user"),
  });
}
