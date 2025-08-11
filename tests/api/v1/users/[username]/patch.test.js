import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent `username`", async () => {
      const response = await fetch("http:localhost:3000/api/v1/users/user", {
        method: "PATCH",
      });

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se o `username` esta digitado corretamente",
        message: "Username não encontrado no sistema",
        name: "NotFoundError",
        status_code: 404,
      });
    });

    test("With duplicated `username`", async () => {
      await orchestrator.createUser({
        username: "UsernameTest1",
      });

      await orchestrator.createUser({
        username: "UsernameTest2",
      });

      const response = await fetch(
        "http:localhost:3000/api/v1/users/UsernameTest1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "UsernameTest2",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Utilize outro username para realizar esta operação.",
        message: "O username informado já está sendo utilizado.",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With duplicated `email`", async () => {
      const user1 = await orchestrator.createUser({
        email: "emailtest3@curso.dev",
      });

      await orchestrator.createUser({
        email: "emailtest4@curso.dev",
      });

      const response = await fetch(
        `http:localhost:3000/api/v1/users/${user1.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "emailtest4@curso.dev",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Utilize outro email para realizar esta operação.",
        message: "O email informado já está sendo utilizado.",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With unique `username`", async () => {
      await orchestrator.createUser({
        username: "UsernameTest5",
      });

      const response = await fetch(
        "http:localhost:3000/api/v1/users/UsernameTest5",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "UsernameTest6",
            email: "emailtest5@curso.dev",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "UsernameTest6",
        email: "emailtest5@curso.dev",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique `email`", async () => {
      const response = await fetch(
        "http:localhost:3000/api/v1/users/UsernameTest6",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "UsernameTest6",
            email: "emailtest6@curso.dev",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "UsernameTest6",
        email: "emailtest6@curso.dev",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new `password`", async () => {
      const response = await fetch(
        "http:localhost:3000/api/v1/users/UsernameTest6",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "senhanova@123",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "UsernameTest6",
        email: "emailtest6@curso.dev",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(
        await password.compare("senhanova@123", responseBody.password),
      ).toBe(true);
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
