/**
 * Created by roche_d on 16/05/15.
 */
(function () {

    var app = require('express.io')();
    app.http().io();
    var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
    var urlencodedParser = bodyParser.urlencoded({ extended: false });


    var allowCrossDomain = function(req, res, next) {
        console.log(req.url);
        if (req.headers.origin) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        } else {
            res.header('Access-Control-Allow-Origin', '*');
        }
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Credentials', 'true');

        next();
    };


    app.use(allowCrossDomain);
    app.use(bodyParser.json());

    app.io.use(function (socket, next) {
        console.log('middddddle');
        return next();
    });

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
    function fmtDate(origin) {
        var idx = origin.indexOf('T');
        console.log(origin);
        console.log(idx);
        if (idx > 0) {
            return origin.slice(0, idx);
        }
        return origin;
    };

    function assignOffer(client, data) {
        if (client.currentReq) {
            client.currentReq.offerCount++;
            client.currentReq.offers.push({
                price: data.price,
                msg: data.msg,
                date: fmtDate(data.date),
                garage: data.garage,
                tel: data.tel,
                rating: data.rating
            });
        }
    }

    var Clients = [];

    app.post('/api/answerRequest', urlencodedParser, function (req, res) {
        console.log('answer');
        console.log(req.body);
        if (!(req.query || req.query == 'fslkj45k54kjh')) {
            res.json({
                res: false,
                data: {
                    msg: "No authentifiation key !"
                }
            });
        } else {


            if (req.body && req.body.id && req.body.data && req.body.data.msg && req.body.data.price && req.body.data.date) {
                var client = getClient(req.body.id);
                if (client) {
                    res.status(200).json({
                        res: true,
                        data: {}
                    });
                    assignOffer(client, req.body.data)
                } else {
                    res.json({
                        res: false,
                        data: {
                            msg: "No client for this contract number !"
                        }
                    });
                }
            } else {
                res.json({
                    res: false,
                    data: {
                        msg: "Invalid arguments"
                    }
                });
            }
        }
    });

    app.get('/api/getAllRequest', function (req, res) {
        if (!(req.query || req.query == 'fslkj45k54kjh')) {
            res.json({
                res: false,
                data: {
                    msg: "No authentifiation key !"
                }
            });
        } else {
            console.log('good key');
            var rep = [];
            Clients.forEach(function (e) {
                if (e && e.currentReq && e.currentReq.title) {
                    console.log('there is something here');
                    rep.push({
                        name: 'Stephane',
                        insurance: 'Direct Assurance',
                        contract: 'Premium',
                        req: e.currentReq.data,
                        id: e.contract
                    });
                }
            });
            res.json({
                res: true,
                data: {
                    requests: rep
                }
            });
        }
    });

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
        if (req.body && req.body.contract && req.body.contract.length > 0) {
            console.log('new login');
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
        console.log(req.url);
        res.send('coucou');
    });


    /* REALTIME EVENT */
    //var io = require('socket.io')(server);

    app.io.on('connection', function (socket) {
        console.log('new client on realtime engine');
    });


    app.listen(8080);

} ());
