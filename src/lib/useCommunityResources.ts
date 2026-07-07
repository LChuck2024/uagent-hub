import { useCallback, useEffect, useState } from "react";
import { Agent, Workflow } from "../types";
import { initialAgents, initialWorkflows } from "../data/communityResources";
import { readJsonResponse } from "./api";

export function useCommunityResources() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFallback = useCallback(() => {
    setAgents(initialAgents);
    setWorkflows(initialWorkflows);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/community/resources");
      if (!res.ok) {
        loadFallback();
        return;
      }
      const data = await readJsonResponse<{ agents?: Agent[]; workflows?: Workflow[] }>(
        res,
        "资源接口返回异常，已使用内置资源。",
      );
      const nextAgents = data.agents || [];
      const nextWorkflows = data.workflows || [];
      if (nextAgents.length === 0 && nextWorkflows.length === 0) {
        loadFallback();
        return;
      }
      setAgents(nextAgents);
      setWorkflows(nextWorkflows);
    } catch (err) {
      console.error("Error fetching community resources:", err);
      loadFallback();
    } finally {
      setIsLoading(false);
    }
  }, [loadFallback]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { agents, workflows, isLoading, refresh, setAgents };
}
