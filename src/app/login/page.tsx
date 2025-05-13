"use client";

import { useState, FormEvent, useEffect } from "react"; // Added useEffect
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react"; // Added Mail, Lock
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // For messages like verification sent
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verificationMessage = searchParams.get("message");
    if (verificationMessage === "verification_sent") {
      setMessage("Registration successful! A verification email has been sent. Please check your inbox and verify your email before logging in.");
    }
    const errorParam = searchParams.get("error");
    if (errorParam) {
        setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null); // Clear any previous messages
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message === "Email not confirmed") {
        setError("Your email address has not been verified. Please check your inbox for the verification link, or request a new one.");
        // Optionally, provide a button/link to resend verification email
        // router.push("/verify-email?email=" + encodeURIComponent(email)); // Example redirect
      } else {
        setError(signInError.message);
      }
    } else if (data?.user) {
      // Supabase Auth Helpers (if configured with middleware) will set cookies for session persistence.
      // Check if email is verified (though Supabase might handle this at a higher level with RLS or redirects)
      if (!data.user.email_confirmed_at) {
        setError("Your email address has not been verified. Please check your inbox.");
        // Optionally sign them out again if you strictly want to prevent access
        // await supabase.auth.signOut(); 
        // router.push("/verify-email?email=" + encodeURIComponent(email));
        return; 
      }
      // Redirect to profile or intended page
      const redirectTo = searchParams.get("redirectTo") || "/profile";
      router.push(redirectTo);
      router.refresh(); // Ensure layout re-renders with new auth state
    } else {
      setError("An unexpected error occurred during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
        <div>
          <Link href="/" className="flex justify-center mb-6">
            <span className="text-3xl font-bold text-purple-600">FANFIX</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-blue-100 text-blue-700 rounded-md text-sm">
              {message}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="you@example.com"
                    disabled={loading}
                />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="••••••••"
                    disabled={loading}
                />
            </div>
          </div>

          {/* TODO: Add forgot password link later */}
          {/* <div className="flex items-center justify-end text-sm">
            <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
              Forgot your password?
            </a>
          </div> */}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LogIn className="h-5 w-5 text-purple-300 group-hover:text-purple-200" aria-hidden="true" />
                  </span>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          No account yet?{" "}
          <Link href="/register" className="font-medium text-purple-600 hover:text-purple-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

