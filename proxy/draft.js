var Draft = require('../models').Draft;

module.exports.createDraft = function (options, callback) {
    var draft = new Draft();
    draft.title = options.title;
    draft.author = options.author;
    draft.post = options.post;
    draft.tags = options.tags;
    draft.category = options.category;
    draft.date = options.date;
    draft.originalId = options.originalId;
    draft.save(callback);
};

module.exports.updateDraft = function (options, callback) {
    Draft.findByIdAndUpdate(options.id, {
        title: options.title,
        author: options.author,
        post: options.post,
        tags: options.tags,
        date: options.date,
        category: options.category
    }, callback);
};

module.exports.deleteDraft = function (id, callback) {
    Draft.findByIdAndRemove(id, callback);
};

module.exports.getUserDrafts = function (uid, callback) {
    Draft.find({author: uid}, callback);
};

module.exports.getOneDraftById = function (id, callback) {
    Draft.findById(id, callback);
};