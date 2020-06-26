const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view.engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

// Mongoose
mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true, useUnifiedTopology: true})

// Schema
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
})

// Model
const Article = mongoose.model("Article", articleSchema)

app.route("/articles")
    // REST Get to articles
    .get(function(req, res) {
        Article.find({}, function(err, foundArticles) {
            if(!err) {
                res.send(foundArticles)
            } else {
                res.send({
                    statusCode: 404
                })
            }
        })
    })

    // REST Post to articles
    .post(function(req, res) {
        const newTitle = req.body.title
        const newContent = req.body.content

        const newArticle = new Article({
            title: newTitle,
            content: newContent
        })
        newArticle.save(function(err){
            if(!err){
                res.send({
                    title: newTitle,
                    content: newContent,
                    statusCode: 201
                })
            } else {
                res.send({
                    title: newTitle,
                    content: newContent,
                    statusCode: 400
                })
            }
        });
    })

    // REST Delete all articles
    .delete(function(req, res) {
        Article.deleteMany(function (err) {
            if(!err) {
                res.send({
                    message: "Successfuly deleted all articles",
                    statusCode: 200
                })
            } else {
                res.send({
                    message: "Failed to delete all articles",
                    statusCode: 400
                })
            }
        })
    })

app.route("/articles/:articleTitle")
    
    .get(function(req,res) {
        Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
            if(!err) {
                if (!foundArticle) {
                    res.send({
                        message: "Article not found.",
                        statusCode: 404
                    })
                } else {
                    res.send(foundArticle)
                }
            } else {
                res.send({
                    message: err,
                    statusCode: 400
                })
            }
        })
    })

    .put(function(req, res) {
        Article.update(
            {title: req.params.articleTitle}, 
            {title: req.body.title, content: req.body.content},
            {overwrite: true},
            function(err) {
                if(!err) {
                    res.send({
                        message: "Successfuly updated database.",
                        statusCode: 200
                    })
                } else {
                    res.send({
                        message: "Update failed.",
                        statusCode: 400
                    })
                }
            }
        )
    })

    .patch(function(req, res) {
        Article.update({title: req.params.articleTitle}, {$set: req.body}, function(err) {
            if (!err) {
                res.send({
                    message: "Successfuly updated database.",
                    statusCode: 200
                })
            } else {
                res.send({
                    message: "Update failed.",
                    statusCode: 400
                })
            }
        })
    })

    .delete(function(req , res) {
        Article.deleteOne({title: req.params.articleTitle}, function(err) {
            if (!err) {
                res.send({
                    message: "Successfuly deleted article.",
                    statusCode: 200
                })
            } else {
                res.send({
                    message: "Delete failed.",
                    statusCode: 400
                })
            } 
        })
    })

app.listen("3000", function() {
    console.log("Server started on port 3000")
})