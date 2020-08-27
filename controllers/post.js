"use strict";

const Post = require('../schemas/Post');
const User = require('../schemas/User');

exports.getPosts = (req, res) => {
    Post.find({}).populate({
        path    : '_user',
        select  : 'username'
    }).populate({
        path    : '_comments',
        select  : 'comment date_created _user',
        populate: {
            path: '_user',
            select: 'username'
        }
    }).sort({
        date_created : -1
    }).exec().then((posts) => {
        return res.status(200).json(posts)
    }).catch((err) => {
        return res.status(500).json(err)
    })
};

exports.getPostById = (req, res) => {
    Post.findOne({_id: req.params._id}).populate({
        path    : '_user',
        select  : 'username'
    }).populate({
        path    : '_comments',
        select  : 'comment date_created _user',
        populate: {
            path: '_user',
            select: 'username'
        },
        options : {sort: {'date_created': -1}}
    }).exec().then((posts) => {
        return res.status(200).json(posts)
    }).catch((err) => {
        return res.status(500).json(err)
    })
};

exports.newPost = (req, res) => {
    let postTitle = req.body.title;
    if (!postTitle || postTitle === "") {
        res.status(400).json({message: 'Something went wrong!'})
    }
    else {
        User.findOne({_id: req.headers._id}, '-__v', (err, user) => {
            let newPost = new Post();
            newPost.title = postTitle;
            newPost.content = req.body.content;
            newPost._user = req.headers._id;
            newPost.date_created = Date.now();
            newPost.save((err) => {
                if (err) {
                    res.status(202).json({message: 'The request has been accepted for processing, but the processing has not been completed.'})
                } else {
                    user._post.addToSet(newPost);
                    user.save();
                    res.status(201).json({message: 'Post posted'})
                }
            });
        });
    }
};

exports.editPost = (req, res) => {
    Post.findOne({_id: req.body._id}, (err, post) => {
        if (err) {
            res.status(500).json(err)
        }
        else if (!post) {
            res.status(400).json({message: 'Invalid post id'})
        }
        else {
            if (req.body.title && req.body.title !== "") post.title = req.body.title;

            if (req.body.content && req.body.content !== "") post.content = req.body.content;

            post.save((err) => {
                if (err) {
                    res.status(400).json({message: "Something went wrong.", error: err})
                }
                else {
                    res.status(200).json({message: "Post updated."})
                }
            })
        }
    })
};

exports.deletePost = (req, res) => {
    Post.findOne({_id: req.params._id}).remove().exec().then((posts) => {
        return res.status(200).json({message: 'Success!'})
    }).catch((err) => {
        return res.status(500).json(err)
    });
};

