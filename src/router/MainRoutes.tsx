import { Routes, Route } from "react-router-dom";
import { Portal } from "../pages/Portal";
import { Storefront } from "../pages/Storefront";
import { AgentPlayground } from "../pages/AgentPlayground";

export function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Portal />} />
      <Route path="/agents" element={<Storefront />} />
      <Route path="/try/:agentId" element={<AgentPlayground />} />
    </Routes>
  );
}
