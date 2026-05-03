import { Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

export function isSecureRequest(req: Request): boolean {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: Request) {
  return {
    httpOnly: true,
    path: "/" as const,
    sameSite: "none" as const,
    secure: isSecureRequest(req),
  };
}
