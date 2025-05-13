// app/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

// Mock function to simulate Supabase sign in
const mockSignIn = async (email: string, password: string) => {
  console.log("Attempting mock sign in with:", email); // Keep password out of logs
  await new Promise(resolve => setTimeout(resolve, 300));
  // Basic mock validation
  if (email === "user@example.com" && password === "password123") {
    const mockSession = {
      user: {
        id: "123",
        email: "user@example.com",
        username: "TestUser", // Or fetch/set this appropriately
        profile_picture_url: null
      },
    };
    // Store mock session in localStorage to be picked up by profile page
    if (typeof window !== "undefined") {
      localStorage.setItem("mockSession", JSON.stringify(mockSession));
    }
    return { data: { session: mockSession }, error: null };
  }
  return { data: null, error: { message: "Invalid credentials (mock)" } };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: signInError } = await mockSignIn(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else if (data?.session) {
      router.push("/profile");
    } else {
      setError("An unexpected error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
        <div>
          <Link href="/" className="flex justify-center mb-6">
            {/* Replace with your logo component or an img tag if you have one */}
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
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address (user@example.com)"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Password (password123)"
              />
            </div>
          </div>

          {/* <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                Remember me
              </label>
            </div>
            <div className="">
              <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                Forgot your password?
              </a>
            </div>
          </div> */}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className={`h-5 w-5 text-purple-500 group-hover:text-purple-400 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              </span>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
            Sign up (mock link)
          </Link>
        </p>
      </div>
    </div>
  );
}

