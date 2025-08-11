import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import { faker } from "@faker-js/faker";
import user from "models/user";

async function waitForAllServices() {
  await waitForWebService();

  async function waitForWebService() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 5000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public ");
}

async function runPendingMigrations() {
  await migrator.runMigrations();
}

async function createUser(newUser) {
  return await user.create({
    username:
      newUser.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: newUser.email || faker.internet.email(),
    password: newUser.password || "validpassword",
  });
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
