"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck, AlertTriangle, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [message, setMessage] = useState("Please check your email to verify your account. If you haven't received an email, you can request a new one below.");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    const errorParam = searchParams.get("error");
    if(errorParam === "manual_verification_required") {
        setMessage("Your email requires verification. Please check your inbox or request a new verification email.")
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    setError(null);
    if (!email) {
      setError("Email address not found. Please try logging in again to trigger a new verification email or contact support if the issue persists.");
      return;
    }
    setLoading(true);
    const { error: resendError } = await supabase.auth.resend({ // Using resend
      type: "signup", // or 'email_change'
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`, // Same as in signup
      }
    });
    setLoading(false);
    if (resendError) {
      setError(`Failed to resend verification email: ${resendError.message}`);
    } else {
      setMessage("A new verification email has been sent. Please check your inbox.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl text-center">
        <div>
          <MailCheck className="mx-auto h-16 w-auto text-purple-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center justify-center">
              <AlertTriangle size={20} className="mr-2" /> {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-blue-100 text-blue-700 rounded-md text-sm">
              {message}
            </div>
          )}

          {email && (
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="mt-6 group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </button>
          )}

          <div className="mt-6 text-sm">
            <p className="text-gray-600">
              Already verified?{" "}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                Sign In
              </Link>
            </p>
          </div>
           <div className="mt-2 text-sm">
             <Link href="/register" className="font-medium text-purple-600 hover:text-purple-500">
                Or, create a new account
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}

