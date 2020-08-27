"use strict";

const Posts = require('./../schemas/Post');

exports.search = (req, res) => {
    if (req.query.q && req.query.q !== '') {
        let resultsPosts= [];
        Posts.find({
                $text: {
                    $search: req.query.q
                }
            }, {score: {$meta: 'textScore'}}
            , {select: 'title content date_created'}).sort({score: {$meta: 'textScore'}}).exec((err, exact) => {
            if (err || !exact) {
                console.log('no exact');
                resultsPosts.exact = [];
            }
            else {
                for (let eachE = 0; eachE < exact.length; eachE++) {
                    resultsPosts.push(exact[eachE]._id.toString())
                }
            }

            let qArray = makeArray(req.query.q, ' ');
            let reqString = '';
            for (let j = 0; j < qArray.length; j++) {
                reqString += qArray[j];
                if (j < qArray.length - 1) reqString += '|'
            }
            Posts.find({
                $or: [
                    {
                        title: {$regex: reqString, $options: 'i'}
                    },
                    {
                        content: {$regex: reqString, $options: 'i'}
                    }
                ]
            })
                .sort({$natural: -1}).exec((err, partial) => {
                if (err || !partial) console.log('no partial');

                for (let eachP = 0; eachP < partial.length; eachP++) {
                    if (resultsPosts.indexOf(partial[eachP]._id.toString()) < 0) resultsPosts.push(partial[eachP]._id)
                }

                res.status(200).json(resultsPosts);
            });
        });
    }
    else {
        res.status(400).json({message: 'No search query'});
    }
};

function makeArray (str) {
    let arr = [];
    let i = str.indexOf(' ');

    while (i > -1) {
        arr.push(str.substr(0, i));
        str = str.slice(i + 1, str.length);
        i = str.indexOf(' ');
    }
    arr.push(str.substr(0, str.length));

    return arr;
}
