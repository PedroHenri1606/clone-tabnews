const calculadora = require("../models/calculator.js");

test("Nome do Teste", function () {
  console.log("alo");
});

test("Nome do Teste2", () => {
  console.log("alo 2");
});

test("Espera que 1 seja 1", () => {
  expect(1).toBe(1);
});

test("Somar 2 + 2 deve ser 4", () => {
  const resultado = calculadora.somar(2, 2);

  expect(resultado).toBe(4);
});

test("Somar 5 + 100 deve ser 105", () => {
  const resultado = calculadora.somar(5, 100);

  expect(resultado).toBe(105);
});

test("Somar 'banana' + 100 deveeria retornar 'Erro'", () => {
  const resultado = calculadora.somar("banana", 100);

  expect(resultado).toBe("Erro");
});
