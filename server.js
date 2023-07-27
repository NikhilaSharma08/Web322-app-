*********************************************************************************

* WEB322 – Assignment 05

* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part

* of this assignment has been copied manually or electronically from any other source

* (including 3rd party web sites) or distributed to other students.

*

* Name: _________Nikhila_____________ Student ID: __168025211____________ Date: ________7/26/2023________

*

* Cyclic Web App URL: https://itchy-pear-dungarees.cyclic.app/about

*

* GitHub Repository URL: https://github.com/NikhilaSharma08/Web322-app-

*

********************************************************************************/




const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser');
const blogData = require('./blog-service')
const path = require('path')
const app = express();
const stripJs = require('strip-js');

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.set("views", path.join(__dirname, "views"));

app.engine(".hbs", exphbs.engine);
app.set("view engine", ".hbs");

app.engine('.hbs', exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));

app.get('/', (req, res) => {
    res.redirect('blog')
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/blog', async (req, res) => {
    let viewData = {};
    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0];
        viewData.posts = posts;
        viewData.post = post;
    } catch (err) {
        viewData.message = "no results";
    }
    try {
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }
    res.render("blog", { data: viewData });
});

app.get('/blog/:id', async (req, res) => {
    let viewData = {};
    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;
    } catch (err) {
        viewData.message = "no results";
    }
    try {
        viewData.post = await blogData.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }
    try {
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }
    res.render("blog", { data: viewData });
});

app.get('/posts', (req, res) => {
    if (req.query.category) {
        blogData.getPostsByCategory(req.query.category).then((data) => {
            res.render('posts', {
                posts: data
            });
        }).catch(err => { res.render("posts", { message: "no results" }); });
    } else if (req.query.minDate) {
        blogData.getPostsByMinDate(req.query.minDate).then(data => {
            res.status(200).json(data);
        }).catch(err => {
            res.status(500).json({ message: err });
        });
    } else {
        blogData.getAllPosts().then((data) => {
            if (data.length > 0) {
                res.status(200).render('posts', {
                    posts: data
                });
            } else {
                res.render("posts", { message: "no results" });
            }
        }).catch(() => {
            res.render('posts', { message: 'no result' });
        });
    }
});

app.get('/categories', (req, res) => {
    blogData.getCategories().then((data) => {
        if (data.length > 0) {
            res.status(200).render('categories', {
                categories: data
            });
        } else {
            res.status(500).render('categories', { message: 'no results' });
        }
    }).catch((err) => {
        res.status(500).render('categories', { message: 'no results' });
    });
});

cloudinary.config({
    cloud_name: 'dim1rhbtf',
    api_key: '164953244556485',
    api_secret: 'd6v_khnEy5PpmM_6va6eZwfyYn8',
    secure: true
});

const upload = multer();

app.get('/posts/add', (req, res) => {
    blogData.getCategories().then(data => {
        res.status(200).render('addPost', { categories: data });
    }).catch(() => { res.render('addPost', { categories: [] }); });
});

app.post('/posts/add', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }
    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;
        const formData = {
            body: req.body.body,
            title: req.body.title,
            postDate: new Date(),
            category: req.body.category,
            featureImage: req.body.featureImage,
            published: req.body.published
        };
        blogData.addPost(formData).then(() => {
            res.status(200).redirect('/posts');
        }).catch((err) => {
            res.status(500).send("message : " + err);
        });
    }
});

app.get('/post/:value', (req, res) => {
    let id = req.params.value;
    blogData.getPostById(id).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).json({ message: err });
    });
});

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', (req, res) => {
    blogData.addCategory(req.body).then(() => {
        res.status(200).redirect('/categories');
    }).catch((err) => {
        res.status(500).json({ message: "unable to add a category" });
    });
});

app.get('/categories/delete/:id', (req, res) => {
    const id = req.params.id;
    blogData.deleteCategoryById(id).then(
        res.status(200).redirect('/categories')
    ).catch(err => {
        res.status(500).json({ message: "Unable to Remove Category / Category not found" });
    });
});

app.get('/posts/delete/:id', (req, res) => {
    const id = req.params.id;
    blogData.deletePostById(id).then(
        res.status(200).redirect('/posts')
    ).catch(() => {
        res.status(500).json({ message: "Unable to Remove Post / Post not found)" });
    });
});

blogData.initialize().then(() => {
    app.listen(HTTP_PORT, serverListener);
}).catch((error) => {
    console.error(error + " this is from server.js");
});

const serverListener = (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Express http server listening on Port ${HTTP_PORT}`);
    }
};

app.use((req, res) => {
    res.status(404).render('error');
});
