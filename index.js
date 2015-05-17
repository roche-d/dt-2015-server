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


    /* ADD a new Client or return the identified */
    function getClient(contract) {
        var ret = null;
        Clients.forEach(function (e)
        {
            if (contract == e.contract) {
                ret = e;
            }
        });
        return ret;
    }
    function newClient(contract) {
        var c = getClient(contract);
        if (c) return c;
        var c = {
            contract: contract,
            currentReq: {}
        };
        Clients.push(c);
        return c;
    }
    function assignRequest(client, data) {
        data = JSON.parse(data);
        console.log('assign');
        console.log(data);
        console.log(data.what);
        client.currentReq = {
            title: data.what[0],
            status: 'waiting for offers',
            offerCount: 0,
            data: data,
            offers: [],
            step: 1
        };
    }

    var Clients = [];

    app.get('/api/currentRequest', function (req, res) {
        var r = {
            title: 'Repair req',
            status: 'waiting for offers',
            offerCount: 0
        };
        if (req.query.contract && req.query.contract.length > 0) {
            var client = getClient(req.query.contract);
            if (client) {
                res.status(200).json({
                    res: true,
                    data: {
                        contract: req.query.contract,
                        req: client.currentReq
                    }
                });
            } else {
                res.json({
                    res: false,
                    data: {
                        msg: "No client for this contract number !"
                    }
                });
            }
        } else {
            res.status(200).json({
                res: false,
                data: {
                    msg: "No contract number !"
                }
            });
        }
    });

    app.post('/api/pushRequest', urlencodedParser, function (req, res) {
        console.log('push req');
        console.log(req.body);

        if (req.body && req.body.contract && req.body.contract.length > 0) {
            var client = getClient(req.body.contract);
            if (client) {
                assignRequest(client, req.body.request);
                res.status(200).json({
                    res: true,
                    data: {
                        contract: req.body.contract,
                    }
                });
            } else {
                res.json({
                    res: false,
                    data: {
                        msg: "No client for this contract number !"
                    }
                });
            }
        } else {
            res.status(200).json({
                data: {
                    msg: 'No contract number !'
                },
                res: false
            });
        }
    });

    app.post('/api/login', urlencodedParser, function (req, res) {
       console.log('new login');
        //console.log(req.body);
        if (req.body && req.body.contract && req.body.contract.length > 0) {
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
