

const Sequelize = require('sequelize');
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});

sequelize.define('quiz', {
    question: {
        type: Sequelize.STRING,
        unique: {msg: "Ya existe esta pregunta"},
        validate: {notEmpty: {msg: " La pregunta no puede estar vacía"}}
    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
    }
});

sequelize.sync()
    .then(() => sequelize.models.quiz.count())
    .then(count =>{
        if(!count) { // Espere a recibir el contenido de la base de datos.
            return sequelize.models.quiz.bulkCreate([
                { question: "Capital de Italia",  answer: "Roma" },
                { question: "Captial de Francia", answer: "París" },
                { question: "Capital de España",  answer:   "Madrid" },
                { question: "capital de Portugal",answer: "Lisboa" }
            ]);
        }
    })
    .catch(error =>{
        console.log(error);
    });

module.exports = sequelize;