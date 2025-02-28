test("Nome do Teste", function () {
  console.log("alo");
});

test("Nome do Teste2", () => {
  console.log("alo 2");
});

test("Espera que 1 seja 1", () => {
  expect(1).toBe(1);
});
