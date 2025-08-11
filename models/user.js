import database from "infra/database";
import password from "models/password.js";
import {
  NotFoundError,
  ServiceError,
  ValidationError,
} from "infra/errors/errors.js";

async function findOneByUsername(username) {
  const result = await database.query({
    text: `
        SELECT *
        FROM users
        WHERE users.username = $1
        LIMIT 1
      ;`,
    values: [username],
  });

  if (result.rowCount > 0) {
    return result.rows[0];
  }

  throw new NotFoundError({
    message: "Username não encontrado no sistema",
    action: "Verifique se o `username` esta digitado corretamente",
  });
}

async function create(userInputValues) {
  try {
    await hashPasswordInObject(userInputValues);

    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          ($1, $2, $3) 
        RETURNING 
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  } catch (error) {
    if (error.cause.code === "23505") {
      if (error.cause.constraint === "users_username_key") {
        throw new ValidationError({
          message: "O username informado já está sendo utilizado.",
          action: "Utilize outro username para realizar o cadastro.",
          cause: error,
        });
      }

      if (error.cause.constraint === "users_email_key") {
        throw new ValidationError({
          message: "O email informado já está sendo utilizado.",
          action: "Utilize outro email para realizar o cadastro.",
          cause: error,
        });
      }
    }

    throw new ServiceError();
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);

  userInputValues.password = hashedPassword;
}

async function update(username, userInputValues) {
  const user = await findOneByUsername(username);

  try {
    const userWithNewValues = { ...user, ...userInputValues };

    await hashPasswordInObject(userWithNewValues);

    const response = await database.query({
      text: `
        UPDATE users
        SET username = $2,
            email = $3,
            password = $4,
            updated_at = timezone('utc', now())
        WHERE id = $1
        RETURNING *;
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return response.rows[0];
  } catch (error) {
    if (error.cause.code === "23505") {
      if (error.cause.constraint === "users_username_key") {
        throw new ValidationError({
          message: "O username informado já está sendo utilizado.",
          action: "Utilize outro username para realizar esta operação.",
          cause: error,
        });
      }

      if (error.cause.constraint === "users_email_key") {
        throw new ValidationError({
          message: "O email informado já está sendo utilizado.",
          action: "Utilize outro email para realizar esta operação.",
          cause: error,
        });
      }
    }

    throw new ServiceError();
  }
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
