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
    ;

if (argv.help) {
    yargs.showHelp();
    process.exit();
}
console.log(argv);
