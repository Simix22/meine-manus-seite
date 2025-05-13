import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define public routes that do not require authentication
  const publicRoutes = ["/login", "/register", "/verify-email", "/auth/callback"];

  // Define routes accessible to authenticated users even if email is not verified
  const partiallyProtectedRoutes = ["/profile", "/verify-email", "/api/auth/logout"]; // Logout API should be accessible

  // If the route is public, let them proceed
  if (publicRoutes.includes(pathname) || pathname.startsWith("/_next/") || pathname.startsWith("/static/") || pathname.endsWith(".ico") || pathname.endsWith(".png") || pathname.endsWith(".jpg") || pathname.endsWith(".svg")) {
    return response;
  }

  // If no session (user not logged in) and trying to access a protected route, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname); // Save intended path
    return NextResponse.redirect(loginUrl);
  }

  // If session exists (user logged in)
  const user = session.user;

  // If email is not verified and they are trying to access a route not in partiallyProtectedRoutes
  if (!user.email_confirmed_at && !partiallyProtectedRoutes.includes(pathname)) {
    const verifyEmailUrl = new URL("/verify-email", request.url);
    verifyEmailUrl.searchParams.set("email", user.email || "");
    verifyEmailUrl.searchParams.set("error", "manual_verification_required");
    return NextResponse.redirect(verifyEmailUrl);
  }

  // If user is authenticated and email is verified (or route is allowed for unverified), allow access
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder if you have one)
     * - assets (public assets folder if you have one)
     * Match all paths that are not static assets or API routes.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|auth/callback).*)",
  ],
};

