"use strict";

const express = require('express');
const router = express.Router();

const signUpController = require('../controllers/sign_up');
const loginController = require('../controllers/auth/login');
const postController = require('../controllers/post');
const commentController = require('../controllers/comment');
const searchController = require('../controllers/search');

const permissions = require('../controllers/auth/permission').adminPermissions;
const authorization = require('../controllers/auth/authorization').authorization;

router.route('/sign-up')
    .post(signUpController.signUp);

router.route('/login')
    .post(loginController.login);

router.route('/posts')
    .get(postController.getPosts)
    .post(authorization, permissions('Admin'), postController.newPost)
    .put(authorization, permissions('Admin'), postController.editPost);

router.route('/posts/:_id')
    .get(postController.getPostById)
    .delete(authorization, permissions('Admin'), postController.deletePost);

router.route('/comments')
    .get(commentController.getComments)
    .post(authorization, commentController.newComment);

router.route('/comments/:_id')
    .get(commentController.getCommentById);

router.route('/search')
    .get(searchController.search);

module.exports = router;
