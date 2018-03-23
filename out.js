const figlet = require('figlet');
const chalk = require('chalk');

exports = module.exports = socket => {


/**
 *  Dar color a un string.
 *
 *  @param msg      Es string al que hay que dar color.
 *  @param color    El color con el que pintar msg.
 *  @returns {string} Devuelve el string msg con el color indicado.
 */
const colorize = (msg, color) => {

    if (typeof color !== "undefined") {
        msg = chalk[color].bold(msg);
    }
    return msg;
};

/**
 *  Escribe un mensaje de log.
 *
 *  @param msg      El String a escribir
 *  @param color    Color de texto.
 *
 */
// const log = (socket, msg, color) => {
    const log = ( msg, color) => {

   socket.write(colorize(msg, color));
};

/**
 *  Escribe un mensaje de log grande.
 *
 *  @param msg      Texto a escribir
 *  @param color    Color de texto.
 *
 */
//const biglog = (socket, msg, color) => {
const biglog = ( msg, color) => {

    log(figlet.textSync(msg, { horizontalLayout: 'full' }), color);
};

/**
 *  Escribe el mensaje de error emsg.
 *
 *  @param msg      Texto del mensaje a escribir
 *
 */
const errorlog = (emsg) => {

    console.log(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")}`);
};

// exports = module.exports = {
//     colorize,
//     log,
//     biglog,
//     errorlog
// };

    return {
        colorize,
        log,
        biglog,
        errorlog
    }

}