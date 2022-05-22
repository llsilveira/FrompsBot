"use strict";

const errors = require("../errors");

module.exports = async function userErrorMessage(error) {
  if (error instanceof errors.FrompsBotError) {
    // TODO: implement more specific messages
    return error.message;
  }

  // TODO: log and send message to someone(?)
  return "Um erro inesperado aconteceu. " +
    "Por favor, espere alguns minutos e tente novamente. " +
    "Se o erro persistir, informe um moderador.";
};
