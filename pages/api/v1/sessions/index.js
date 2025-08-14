import controller from "infra/controller";
import * as cookie from "cookie";
import { createRouter } from "next-connect";
import authentication from "models/authentication";
import session from "models/session";

const router = createRouter();

export default router.handler(controller.errorHandlers);

router.post(async (request, response) => {
  const newSession = await authentication.authenticate(request.body);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  return response
    .setHeader("Set-Cookie", setCookie)
    .status(201)
    .json(newSession);
});
