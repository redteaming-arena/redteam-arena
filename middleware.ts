import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session"; // Ensure the path is correct
import { cookies } from "next/headers";
import { NextURL } from "next/dist/server/web/next-url";

const privateRoutes = ["/profile", "/build"];

export default async function middleware(req: NextRequest) {
  // Check if the current route is /magic_link
  const path = req.nextUrl.pathname;
  if (path === "/magic_link") {
    const token = req.nextUrl.searchParams.get("token");

    if (token) {
      try {
        // Decrypt the token
        const session = await decrypt(token);

        if (session) {
          // Token is valid; you can proceed or handle the session as needed
          console.log("Valid session:", session);
          return NextResponse.next();
        } else {
          // Invalid token, redirect to /login
          console.log("Invalid session");
          return NextResponse.redirect(new URL('/', req.nextUrl));
        }
      } catch (error) {
        console.error("Error decrypting token:", error);
        return NextResponse.redirect(new URL('/', req.nextUrl));
      }
    } else {
      // Token not found, redirect to /login
      console.log("Token not found");
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
  }

    // Check session for private routes
    if (privateRoutes.includes(path)) {
      // Assuming you store the session token in a cookie named 'session_token'
      const sessionToken = req.cookies.get('session_token')?.value;
  
      if (!sessionToken) {
        // No session token found, redirect to login
        return NextResponse.redirect(new URL('/login', req.nextUrl));
      }
  
      try {
        const session = await decrypt(sessionToken);
        if (!session) {
          // Invalid session, redirect to login
          return NextResponse.redirect(new URL('/login', req.nextUrl));
        }
        // Valid session, proceed
        return NextResponse.next();
      } catch (error) {
        console.error("Error decrypting session token:", error);
        return NextResponse.redirect(new URL('/login', req.nextUrl));
      }
    }

    let cookie = req.cookies.get('ra_token_verification')
  
  if (cookie && path === "/login"){
    return NextResponse.redirect(
      new URL(`/`, req.nextUrl)
    )
  }
  // For other routes, simply proceed
  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/magic_link", "/", "/login"],
};
