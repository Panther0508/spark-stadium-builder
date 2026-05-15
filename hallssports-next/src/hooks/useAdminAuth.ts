import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Role = "scout" | "media" | "verifier";

interface AdminAuthState {
  user: null;
  role: Role | null;
  loading: boolean;
}

export function useAdminAuth(expectedRole?: Role): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    role: null,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAuth = () => {
      const role = localStorage.getItem('hallssports_admin_role') as Role | null;

      if (!role || !["scout", "media", "verifier"].includes(role)) {
        router.push("/admin-login");
        return;
      }

      // Check if user is accessing the correct role path
      if (expectedRole && role !== expectedRole) {
        router.push(`/admin/${role}`);
        return;
      }

      setState({ user: null, role, loading: false });
    };

    checkAuth();
  }, [router, expectedRole]);

  return state;
}
