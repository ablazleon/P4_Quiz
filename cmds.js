

const {models} =require('./model');

const Sequelize = require('sequelize');
const {log, biglog, errorlog, colorize} = require("./out");


/**
 * Muestra la ayuda.
 */
exports.helpCmd = (socket, rl) => {
    log(socket, "Comandos:");
    log(socket, " h|help - Muestra esta ayuda.");
    log(socket, " list - Listar los quizes existentes.");
    log(socket, " show <id> - Muestra la pregunta y la respuesta el quiz indicado ");
    log(socket, " add - Añadir un nuevo quiz interactivamente");
    log(socket, " delete <id> - Borrar el quiz indicado");
    log(socket, " edit <id> - Editar el quiz indicado");
    log(socket, " test <id> - Probar el quiz indicado");
    log(socket, " p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log(socket, " credits - Créditos");
    log(socket, " q|quit - Salir del programa");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes en el modelo.
 */
exports.listCmd = (socket, rl) => {

    models.quiz.findAll()
    .each(quiz => {
            log(socket, ` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
    })
    .catch(error => {
        errorlog(socket, error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

/**
 * Esta función devuelve una promesa que:
 *  - Valida que se ha introducido un valor en el parametro.
 *  - Convierte el parametro en un numero entero.
 *  Si todo va bien, la promesa se satisface y devuelve el valor de id a usar.
 *
 * @param id Parametro con el índice a validar.
 */
const validateId = id => {

    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined")  {
            reject(new Error(`Falta el parametro <id>.`));
        }else {
            id = parseInt(id); // coger la parte entera y descartar lo demas
            if (Number.isNaN(id)) {
                reject(new Error(`El valor del parametro <id> no es un número.`));
            }else{
                resolve(id);
            }
        }
    })
}


/** Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (socket, rl, id) => {

    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(socket, ` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

    })
    .catch(error => {
        errorlog(socket, error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

/**
 *  Esta función devuelve una promesa que caundo se cumple, proporciona el text introducido
 *  Entonces la llamada a then que hay que hacer la promesa devuelta será:
 *          .then(answer => {...})
 *
 *  También colorea en rojo el texto de la pregunta, elimina espacios al principio yal final.
 *
 *  @param rl Objeto readline usado para implementar el CLI
 *  @param text Pregunta que hay que hacerle al usuario.
 */

const makeQuestion = (rl, text) => {

    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
                resolve(answer.trim());
        });
    });
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 */
exports.addCmd = (socket, rl) => {


  makeQuestion(rl, 'Introduzca una pregunta: ')
      .then(q => {
          return makeQuestion(rl, 'Introduzca la respuesta ')
          .then(a => {
              return {question: q, answer: a};
          });
      })
      .then(quiz => {
          return models.quiz.create(quiz);
      })
      .then((quiz) => {
          log(socket, ` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
      })
      .catch(Sequelize.ValidationError, error =>{
          errorlog(socket, 'El quiz es erroneo:');
          error.errors.forEach(({message})=> errorlog(socket, message));
      })
      .catch(error => {
          errorlog(socket, error.message);
      })
      .then(() => {
          rl.prompt();
      });

};

/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (socket, rl, id) => {

   validateId(id)
   .then(id => models.quiz.destroy({where: {id}}))
   .catch(error => {
       errorlog(socket, error.message);
   })
   .then(() => {
       rl.prompt();
   });

};

/**
 * Edita un quiz del modelo.
 *
 * @param id Clave a editar en el modelo.
 */
exports.editCmd = (socket, rl, id) => {

   validateId(id)
       .then(id => models.quiz.findById(id))
       .then(quiz => {
           if (!quiz){
               throw new Error (`No existe un quiz asociado al id ${id}.`);
           }

           process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
           return makeQuestion(rl, ' Introduzca la pregunta: ')
           .then(q => {
               process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
               return makeQuestion(rl, ' Introduzca la respuesta: ')
               .then(a => {
                   quiz.question = q;
                   quiz.answer = a;
                   return quiz;
               });
           });
       })
       .then(quiz => {
           return quiz.save();
       })
       .then(quiz => {
           log(socket, ` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
       })
       .catch(Sequelize.ValidationError, error =>{
           errorlog(socket, 'El quiz es erroneo:');
           error.errors.forEach(({message})=> errorlog(socket, message));
       })
       .catch(error => {
           errorlog(socket, error.message);
       })
       .then(() => {
           rl.prompt();
       });
};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos constestar.
 *
 * @param id Clave del quiz a probar.
 */
exports.testCmd = (socket, rl, id) => {

     // Valida el id
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz) {
            throw new Error(`No existe un quiz asociado al id ${id}.`);
        }
        // Hace la pregunta
        return makeQuestion(rl, `   ${colorize(quiz.question, 'red')} ${colorize('?', 'red')}     `)
            .then(resp => {
                if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    log(socket, ' Su respuesta es correcta.');
                    log(socket, 'Correcta');
                    rl.prompt();
                } else {
                   log(socket, 'Su respuesta es incorrecta.');
                   log(socket, 'incorrecta');
                    rl.prompt();
                }
            });
    })

      .catch(Sequelize.ValidationError, error =>{
              errorlog(socket, 'El quiz es erroneo:');
              error.errors.forEach(({message})=> errorlog(socket, message));
          })
      .catch(error => {
          errorlog(socket, error.message);
      })
      .then(() => {
          rl.prompt();
      });
};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se constesta a todos satisfactoriamente.
 */
exports.playCmd = (socket, rl) => {

    let score = 0;

    let toBePlayed = [];

    const playOne = () => {
        return Promise.resolve()
            .then(() => {

                if (toBePlayed.length <= 0) {
                    // console.log(toBePlayed.length );
                    // console.log("SACABO");
                    // resolve(); Ya no es necesario.
                    return;
                }

                let pos = Math.floor(Math.random() * toBePlayed.length);
                let quiz = toBePlayed[pos];
                toBePlayed.splice(pos, 1);  // Saco la pregunta

                return makeQuestion(rl, quiz.question)
                    .then(answer => {
                        if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim() ) {
                            score++;
                            log(socket, 'correcto');
                            log(socket, `Llevas ${score} puntos`);
                            return playOne();
                        } else {
                            log(socket, 'incorrecto');
                            log(socket, 'Fin');
                            log(socket, `del juego. Aciertos: ${score} `);
                            log(socket, score, 'magenta');
                            //resolve();
                        }
                    });
            });
    };

    playOne();

    models.quiz.findAll()
        .then(quizzes => {
            raw: true
            toBePlayed = quizzes;
            // console.log(quizzes)
        }) //Sólo quiero los valores, no el resto de funciones de ORM.




    .then(() => {
    return playOne();
    // Así, sólo se ejecuta la función cuando se ha cargado la BD, caundo la promesa termina.
    })
    .catch(e => {
        log(socket, "Error:" + e);
    })
    .then(() => {
        log(socket, `Tu puntuación es de ${score}`);
        rl.prompt();
    })


};


// ;
/**
 * Muestra los nombre de los autores de la práctica.
 */
exports.creditsCmd = (socket, rl) => {
    log(socket, 'Autor de la práctica:');
    log(socket, 'RAUL Adrián Blázquez León', 'green');
    rl.prompt();
};

/**
 * Terminar el programa.
 */
exports.quitCmd = (socket, rl) => {
    rl.close();
    socket.end(); // Finalizar el socket.
};
