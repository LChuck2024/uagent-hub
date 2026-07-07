import { Routes, Route } from "react-router-dom";
import { TenantLanding } from "../pages/TenantLanding";
import { TenantAdmin } from "../pages/TenantAdmin";

interface TenantRoutesProps {
  slug: string;
}

export function TenantRoutes({ slug }: TenantRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<TenantLanding slug={slug} />} />
      <Route path="/admin" element={<TenantAdmin slug={slug} />} />
    </Routes>
  );
}
