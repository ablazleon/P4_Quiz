const readline = require('readline');


const cmds= require("./cmds");
const net = require("net");
const {log, biglog, errorlog, colorize} = require("./out")(socket);

net.createServer(socket => { // Crea un servidor
    
// A function, to createa socket

    socket
    .on("error", () => {
            rl.close();
        })
    .on("error", () => {
            rl.close();
        })

    console.log("Nuevo cliente" + socket.remoteAdress);


// Mensaje inicial
    biglog('CORE quiz', 'green');


    const rl = readline.createInterface({
        input: socket,
        output: socket,
        prompt: colorize('quiz > ', 'blue'),
        completer: (line) => {
            const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
            const hits = completions.filter((c) => c.startsWith(line));
            // show all completions if none founds
            return [hits.length ? hits : completions, line];
        }
    });

    rl.prompt();

    rl.on('line', (line) => {
        let args = line.split(" ");
        let cmd = args[0].toLowerCase().trim();

        switch (cmd) {
            case '':
                rl.prompt();
                break;
            case 'h':
            case 'help':
                cmds.helpCmd(rl);
                break;

            case 'q':
            case 'quit':
                cmds.quitCmd(rl);
                break;

            case 'add':
                cmds.addCmd(rl);
                break;

            case 'list':
                cmds.listCmd(rl);
                break;

            case 'show':
                cmds.showCmd(rl, args[1]);
                break;

            case 'test':
                cmds.testCmd(rl, args[1]);
                break;

            case 'p':
            case 'play':
                cmds.playCmd(rl);
                break;

            case 'delete':
                cmds.deleteCmd(rl, args[1]);
                break;

            case 'edit':
                cmds.editCmd(rl, args[1]);
                break;

            case 'credits':
                cmds.creditsCmd(rl);
                break;

            default:
                log(socket, `Comando desconocido: '${colorize(cmd, 'red')}'`);
                log(socket, `Use ${colorize('help', 'green')} para ver todos los comandos disponibles.`);
                rl.prompt();
                break;
        }

    }).on('close', () => {
        log(socket, 'Adios!');
        socket.end();
        //process.exit(0);
    });

})
.listen(3030);





