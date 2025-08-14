import { ServiceError, UnauthorizedError } from "infra/errors/errors";
import user from "./user";
import password from "./password";
import session from "./session";

async function authenticate(userInputValues) {
  try {
    const storedUser = await user.findOneByEmail(userInputValues.email);

    if (
      !(await password.compare(userInputValues.password, storedUser.password))
    ) {
      throw new UnauthorizedError({});
    }

    return await session.create(storedUser.id);
  } catch (error) {
    if (error.name === "UnauthorizedError" || error.name === "NotFoundError") {
      throw new UnauthorizedError({
        cause: error,
      });
    }

    throw new ServiceError({});
  }
}

const authentication = {
  authenticate,
};

export default authentication;
