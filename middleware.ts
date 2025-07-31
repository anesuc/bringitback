import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create",
    "/api/bounties/:path*",
    "/api/user/:path*",
  ],
}