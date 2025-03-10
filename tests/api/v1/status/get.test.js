test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http:localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  const parsetUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toBeDefined();
  expect(responseBody.updated_at).toEqual(parsetUpdatedAt);

  expect(responseBody.dependencies.database.version).toBeDefined();
  expect(typeof responseBody.dependencies.database.version).toBe("string");
  expect(responseBody.dependencies.database.version).toEqual("16.0");

  expect(responseBody.dependencies.database.max_connections).toBeDefined();
  expect(responseBody.dependencies.database.max_connections).toBe(100);
  expect(typeof responseBody.dependencies.database.max_connections).toBe(
    "number",
  );

  expect(responseBody.dependencies.database.active_connections).toBeDefined();
  expect(responseBody.dependencies.database.active_connections).toEqual(1);
  expect(typeof responseBody.dependencies.database.active_connections).toBe(
    "number",
  );

  expect(responseBody.dependencies.database.idle_connections).toBeDefined();
  expect(typeof responseBody.dependencies.database.idle_connections).toBe(
    "number",
  );
});
