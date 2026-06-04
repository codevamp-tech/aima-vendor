// This bare layout overrides the parent app/admin/layout.tsx for the /admin/login route.
// It renders the login page with no header, nav, or footer — just the page itself.
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
