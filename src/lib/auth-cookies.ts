// Dunz's sign-in lives only in cookies the browser sends back to the server. Nothing in the
// page needs to read them, so scripts can't (httpOnly), they only travel over HTTPS, and they
// lapse after a week without use (the library's own default is 400 days). Findings 3, #1.
const WEEK = 7 * 24 * 60 * 60;

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function shapeAuthCookie<T extends { maxAge?: number }>(options: T): T {
  return { ...options, ...authCookieOptions, maxAge: options.maxAge === 0 ? 0 : Math.min(options.maxAge ?? WEEK, WEEK) };
}
