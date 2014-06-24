var yargs = require('yargs')
    .usage('Usage: $0 -b [backend] [options]')
    .demand('b', "We simply must know where to point your backend traffic.")
    .alias('b', 'backend')
    .describe('b', "Where to point traffic out the backend of Mirror.  Maybe an IP or domain name.")
    .string('b')
    .alias('p', 'port')
    .default('p', 8080)
    .describe('p', "The port number to listen on.")
    .alias('r', 'rate')
    .default('r', .10)
    .describe('r', 'The rate at which requests are sampled for use against the backend. (0,1]')
    .alias('l', 'logfile')
    .describe('l', 'The file into which to write logs.')
    .alias('g', 'graphite-server')
    .describe('g', 'The location to which to send graphite directives.')
    .alias('n', 'graphite-namespace')
    .describe('n', 'The namespace to use for graphite messages.')
    .alias('v', 'verbose')
    .count('v')
    .alias('H', 'header')
    .describe('H', 'Add a header to EVERY request to the backend.')
    .default('H', [])
    .alias('h', 'help')
    .describe('h', 'Print this help message and quit.')
    .boolean('h')
    .check(function(args, aliases) {
        errs = [];
        if (typeof args.rate != "number")
            errs.push('Rate must be a number.');
        if (!(args.rate > 0))
            errs.push('Rate must be greater than zero.');
        if (!(args.rate <= 1))
            errs.push('Rate must be less than or equal to one.');
        if (typeof args.port != "number")
            errs.push('Non-numeric Ports are unnaceptable');
        if (args.port % 1 != 0)
            errs.push('Port must be an integer');
        if (errs.length > 0)
            throw errs;
        return true;
    })
    , argv = yargs.argv
    , console = require('console')
    , express = require('express')
    , app = express()
    , bodyParser = require('body-parser')
    , dgram = require('dgram')
    ;

if (argv.help) {
    yargs.showHelp();
    process.exit();
}
var onSetFunctions = {
    port: function(newVal) {
        argv.p = argv.port = newVal;
        tcp.close();
        tcp = app.listen(argv.port);
        var tmp = newUdp(argv.p);
        udp.close();
        udp = tmp;
        return argv.port;
    }
    , backend: function(newVal) {
        return argv.backend = argv.b = newVal;
    }
    , rate: function(newVal) {
        if (newVal < 0)
            newVal = 0;
        if (newVal > 1)
            newVal = 1;
        return argv.rate = argv.r = newVal;
    }
    , logfile: function(newVal) {
        return argv.logfile = argv.l = newVal;
    }
    , "graphite-server": function(newVal) {
        return argv.graphite-server = argv.g = newVal;
    }
    , "graphite-namespace": function(newVal) {
        return argv.graphite-namespace = argv.n = newVal;
    }
    , verbose: function (newVal) {
        return argv.verbose = argv.v = newVal;
    }
    , header: function (newVal) {
        argv.header.push(newVal);
        return argv.header;
    }
}
onSetFunctions.p = onSetFunctions.port;
onSetFunctions.b = onSetFunctions.backend;
onSetFunctions.r = onSetFunctions.rate;
onSetFunctions.l = onSetFunctions.logfile;
onSetFunctions.g = onSetFunctions['graphite-server'];
onSetFunctions.n = onSetFunctions['graphite-namespace'];
onSetFunctions.v = onSetFunctions.verbose;
onSetFunctions.H = onSetFunctions.header;

app.use(bodyParser.json());
var router = express.Router();
router.get('/:var_name', function(req, res) {
    var response = {};
    response[req.params.var_name] = argv[req.params.var_name];
    res.json(response);
});
router.get('/', function(req, res) {
    return res.json(argv);
});
router.post('/', function(req, res) {
    console.log(req.body);
    var response = {}
    Object.keys(req.body).forEach(function(key) {
        response[key] = onSetFunctions[key](req.body[key]);
    });
    res.json(response);
});

app.use('/', router)
var tcp = app.listen(argv.port);
function newUdp(port) {
    var socket = dgram.createSocket('udp4');
    socket.on('message', function(msg, rinfo) {
        console.log(msg, ''+ msg, rinfo);
    });
    socket.bind(port);
    return socket;
}
var udp = newUdp(argv.port);
