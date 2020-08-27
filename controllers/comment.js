"use strict";

const Comment = require('../schemas/Comment');
const Post = require('../schemas/Post');
const User = require('../schemas/User');

exports.getComments = (req, res) => {
    Post.findOne({_id: req.body.post}, '-__v', (err, post) => {
        const arr = [];
        for(let i of post._comments) {
            arr.push(i._id);
        }
        Comment.find({_id: {$in: arr}}).populate({
            path: '_user',
            select: 'username'
        }).exec().then((posts) => {
            return res.status(200).json(posts)
        }).catch((err) => {
            return res.status(500).json(err)
        })
    });
};

exports.getCommentById = (req, res) => {
    Comment.findOne({_id: req.params._id}).populate({
        path    : '_user',
        select  : 'username'
    }).exec().then((posts) => {
        return res.status(200).json(posts)
    }).catch((err) => {
        return res.status(500).json(err)
    })
};

exports.newComment = (req, res) => {
    Post.findOne({_id: req.body.post}, '-__v', (err, post) => {
        if(err) {
            res.status(400).json({message: 'Something went wrong!'})
        }
        let comment = req.body.comment;
        if (!comment || comment === "") {
            res.status(400).json({message: 'Something went wrong!'})
        } else {
            User.findOne({_id: req.headers._id}, '-__v', (err, user) => {
                let newComment = new Comment();
                newComment.comment = comment;
                newComment._user = req.headers._id;
                newComment.date_created = Date.now();
                newComment.save((err) => {
                    if (err) {
                        res.status(202).json({message: 'The request has been accepted for processing, but the processing has not been completed.'})
                    } else {
                        user._comments.addToSet(newComment);
                        user.save();
                        post._comments.addToSet(newComment);
                        post.save();
                        res.status(201).json({message: 'Comment posted'})
                    }
                });
            });
        }
    });
};
