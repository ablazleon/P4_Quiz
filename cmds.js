

const model =require('./model');

const {log, biglog, errorlog, colorize} = require("./out");

/**
 * Muestra la ayuda.
 */
exports.helpCmd = rl=> {
    log("Comandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado ");
    log(" add - Añadir un nuevo quiz interactivamente");
    log(" delete <id> - Borrar el quiz indicado");
    log(" edit <id> - Editar el quiz indicado");
    log(" test <id> - Probar el quiz indicado");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log(" credits - Créditos");
    log(" q|quit - Salir del programa");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes en el modelo.
 */
exports.listCmd = rl=> {
    log('Listar todos los quizzes existentes.', 'red');
    rl.prompt();
};

/** Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {
    log('Probar el quiz indicado.', 'red');
    rl.prompt();
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 */
exports.addCmd = rl => {
    log('Añadir un nuevo quiz.', 'red');
    rl.prompt();
};

/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl, id) => {
    log('Añadir un nuevo quiz.', 'red');
    rl.prompt();
};

/**
 * Edita un quiz del modelo.
 *
 * @param id Clave a editar en el modelo.
 */
exports.editCmd = id => {
    log('Editar el quiz indicado.', 'red');
    rl.prompt();
};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos constestar.
 *
 * @param id Clave del quiz a probar.
 */
exports.testCmd = id => {
    log('Probar el quiz indicado.', 'red');
    rl.prompt();
};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se constesta a todos satisfactoriamente.
 */
exports.playCmd = rl => {
    log('Jugar.', 'red');
    rl.prompt();
};

/**
 * Muestra los nombre de los autores de la práctica.
 */
exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Adrián Blázquez León', 'green');
    rl.prompt();
};

/**
 * Terminar el programa.
 */
exports.quitCmd = rl => {
    rl.close();
};