"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSignOut = async () => {
      setLoading(true);
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Error signing out:", signOutError);
        setError("Failed to sign out. Please try again.");
        setLoading(false);
      } else {
        // Clear any local user state if necessary (though Supabase client should handle cookies)
        // Redirect to login page
        router.refresh(); // Force a refresh to ensure server components re-evaluate auth state
        router.push("/login?message=logged_out");
      }
    };

    performSignOut();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {loading && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="mt-4 text-lg text-gray-700">Signing you out...</p>
        </>
      )}
      {error && (
        <>
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Go to Homepage
          </button>
        </>
      )}
      {/* If not loading and no error, user should have been redirected. 
          This content is a fallback or for the brief moment before redirect. */}
      {!loading && !error && (
        <p className="text-lg text-gray-700">Redirecting...</p>
      )}
    </div>
  );
}

