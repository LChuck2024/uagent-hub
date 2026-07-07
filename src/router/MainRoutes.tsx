import { Routes, Route } from "react-router-dom";
import { Storefront } from "../pages/Storefront";
import { AgentPlayground } from "../pages/AgentPlayground";

export function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="/try/:agentId" element={<AgentPlayground />} />
    </Routes>
  );
}
