

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

    model.getAll().forEach((quiz, id) => {
       log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};

/** Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    }else {
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 */
exports.addCmd = rl => {

    rl.question(colorize( 'Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la repsuesta ', 'red'), answer => {

            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        })
    })
};

/**
 * Edita un quiz del modelo.
 *
 * @param id Clave a editar en el modelo.
 */
exports.editCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else {
        try{
            const quiz = model.getByIndex(id);

            // Escribe la pregunta que se desea editar: así no se obliga a escribirla de nuevo para editarla.
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize('Introduzca la respuesta ', 'red'), answer =>{
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`)
                    rl.prompt();
                })
            })
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else {
        try{
            model.deleteByIndex(id);
        } catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos constestar.
 *
 * @param id Clave del quiz a probar.
 */
exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else {
        try{
            const quiz = model.getByIndex(id);

            rl.question(`   ${colorize(quiz.question, 'red')} ${colorize('?', 'red')}     `, resp => {

                log(" Su respuesta es: ");
                // Insensible a mayúsculas
                if(resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim() ){
                    biglog('Correcta', 'green');
                    rl.prompt();
                }else{
                    biglog('Incorrecta', 'red');
                    rl.prompt();
                }
            });

        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se constesta a todos satisfactoriamente.
 */
exports.playCmd = rl => {


    const quizzes = model.getAll();
    let score = 0;

    let toBeResolved = []; // Contiene los id de las preguntas sin resolver.
    for (let i = 0; i < quizzes.length; i++){
        toBeResolved.push(i);
        // log(`${toBeResolved}`);
    };
    // log(`'toBeResolved[2]}' ${toBeResolved[2]}`);

    const playOne = () => {
        if (typeof quizzes === 'undefined' || toBeResolved.length === 0){
            // El array o no está definido o no tiene elementos.
            log('Fin del juego. Aciertos:');
            biglog(score, 'magenta');
            rl.prompt();
        } else{
            let id = Math.floor(Math.random()*toBeResolved.length);
            // log(`id ${id}`);
            // log(`toBeResolved.length ${toBeResolved.length}`); // Sacar su id.

            // log(`toBeResolved.splice(${id}, 1)} ${toBeResolved.splice(id, 1)}`); // Sacar su id.
            //log(`${toBeResolved.push(id)}`);
            let quiz = model.getByIndex(toBeResolved.splice(id, 1));

            rl.question(`   ${colorize(quiz.question, 'red')} ${colorize('?', 'red')}     `, resp => {
                if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    score = score + 1;
                    log(`CORRECTO - Lleva ${score} aciertos `);
                    playOne();
                } else {
                    log('INCORRECTO.');
                    log(`Fin del juego. Aciertos: ${score} `);
                    biglog(score, 'magenta');
                    rl.prompt();
                }
            })
        };
    };
    playOne();

};

/**
 * Muestra los nombre de los autores de la práctica.
 */
exports.creditsCmd = rl => {
    log('Autor de la práctica:');
    log('RAUL Adrián Blázquez León', 'green');
    rl.prompt();
};

/**
 * Terminar el programa.
 */
exports.quitCmd = rl => {
    rl.close();
};