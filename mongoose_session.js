var session = require('express-session'),
    mongoose = require('mongoose');

var MongooseSession = function (mongoose) {
    this.__proto__ = (session.Store).prototype;
    this.mongoose = mongoose;
    var sessionSchema = new mongoose.Schema({
        sid: String,
        session: mongoose.Schema.Types.Mixed
    });
    this.SessionModel = mongoose.model('Session', sessionSchema);
    this.get = function(sid, callback) {
        var self = this;
        self.SessionModel.findOne({ sid: sid })
            .exec(function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    if (results) {
                        callback(null, results.session);
                    } else {
                        callback(null);
                    }
                }
            });
    };
    this.set = function(sid, session, callback) {
        var self = this;
        self.SessionModel.update(
            { sid: sid },
            { sid: sid, session: session },
            { upsert: true },
            function(err) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
    };
    this.destroy = function(sid, callback) {
        var self = this;
        self.SessionModel.remove({ sid: sid })
            .exec(function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
    };
    this.length = function(callback) {
        var self = this;
        self.SessionModel.find()
            .exec(function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    callback(null, results.length);
                }
            });
    };
    this.clear = function(callback) {
        var self = this;
        self.SessionModel.remove()
            .exec(function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
    };
};

module.exports = function(mongoose) {
    return new MongooseSession(mongoose);
};