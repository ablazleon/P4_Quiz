

const {models} =require('./model');

const Sequelize = require('sequelize');
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

    models.quiz.findAll()
    .each(quiz => {
            log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
    })
    .catch(error => {
        errorlog(error.message);
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
exports.showCmd = (rl, id) => {

    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

    })
    .catch(error => {
        errorlog(error.message);
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
exports.addCmd = rl => {


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
          log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
      })
      .catch(Sequelize.ValidationError, error =>{
          errorlog('El quiz es erroneo:');
          error.errors.forEach(({message})=> errorlog(message));
      })
      .catch(error => {
          errorlog(error.message);
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
exports.deleteCmd = (rl, id) => {

   validateId(id)
   .then(id => models.quiz.destroy({where: {id}}))
   .catch(error => {
       errorlog(error.message);
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
exports.editCmd = (rl, id) => {

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
           log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
       })
       .catch(Sequelize.ValidationError, error =>{
           errorlog('El quiz es erroneo:');
           error.errors.forEach(({message})=> errorlog(message));
       })
       .catch(error => {
           errorlog(error.message);
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
exports.testCmd = (rl, id) => {

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
                    log(' Su respuesta es correcta.');
                    biglog('Correcta', 'green');
                    rl.prompt();
                } else {
                   log('Su respuesta es incorrecta.');
                    biglog('Incorrecta', 'red');
                    rl.prompt();
                }
            });
    })

      .catch(Sequelize.ValidationError, error =>{
              errorlog('El quiz es erroneo:');
              error.errors.forEach(({message})=> errorlog(message));
          })
      .catch(error => {
          errorlog(error.message);
      })
      .then(() => {
          rl.prompt();
      });
};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se constesta a todos satisfactoriamente.
 */
exports.playCmd = rl => {

    let score = 0;

    let toBePlayed = [];

    const playOne() => {
        return Promise.resolve()
             .then(() => {

                 if (toBePlayed.length <= 0) {
                     console.log("SACABO");
                    // resolve(); Ya no es necesario.
                     return;
                 }

                let pos = Math.floor(Math.random() * toBePlayed.length());
                let quiz = toBePlayed[pos];
                toBeplayed.splice(pos, 1);  // Saco la pregunta

                return makeQuestion(rl, quiz.question)
                    .then(answer => {
                        if (answer === quiz.answer) {
                            score++;
                            console.log(Ánimo);
                            return playOne();
                        } else {
                            console.log("KK");
                            resolve();
                        }
                    });
            });
    };

    playOne();

    models.quiz.findAll()
        .then(quizzes => {
            raw: true
        }) //Sólo quiero los valores, no el resto de funciones de ORM.
    toBePlayed = quizzes;

//console.log(quizzes);
        }
.
then(() => {
    return playOne();
    // Así, sólo se ejecuta la función cuando se ha cargado la BD, caundo la promesa termina.
})
    .catch(e => {
        console.log("Error:" + e);
    })
.
then(() => {
    console.log(score);
    rl.prompt();
})


};


// ;
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
