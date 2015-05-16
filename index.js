/**
 * Created by roche_d on 16/05/15.
 */
(function () {

    var express = require('express');
    var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
    var urlencodedParser = bodyParser.urlencoded({ extended: false });

    var app = express();

    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    };
    app.use(allowCrossDomain);

    function newClient(contract) {
        var c = null;
        Clients.forEach(function (e)
        {
            if (contract == e.contract) {
                c = e;
            }
        });
        if (c) return c;
        var c = {
            contract: contract
        };
        Clients.push(c);
        return c;
    };

    var Clients = [];

    app.get('/api/currentRequest', function (req, res) {
        var r = {
            title: 'coucou'
        };
        res.json(r);
    });

    app.post('/api/login', urlencodedParser, function (req, res) {
       console.log(' new login');
        //console.log(req.body);
        if (!req.body && req.body.contract && req.body.contract.length > 0) {
            console.log('contract is ok : ' + req.body.contract);
            res.status(200).json({
                res: true,
                data: {
                    contract: req.body.contract
                }
            });
            newClient(req.body.contract);
        } else {
            res.status(200).json({
                data: {
                    msg: 'No contract number !'
                },
                res: false
            });
        }
        console.log(Clients);
    });

    app.all('*', function (req, res) {
       console.log('coucou');
        //console.log(req);
        res.send('coucou');
    });

    //console.log(app.)

    app.listen(8080);

} ());
