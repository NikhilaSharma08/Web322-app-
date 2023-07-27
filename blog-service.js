const Sequelize = require("sequelize");
let exp = module.exports;

let sequelize = new Sequelize(
    "azaylcii",
    "azaylcii",
    "aJUA-uZuFiGQR96Ph47BrPq9u9laL_iI",
    {
        host: "stampy.db.elephantsql.com",
        dialect: "postgres",
        port: 5432,
        dialectOptions: {
            ssl: { rejectUnauthorized: false },
        },
        query: { raw: true },
    }
);

let Post = sequelize.define(
    "Post",
    {
        body: Sequelize.TEXT,
        title: Sequelize.STRING,
        postDate: Sequelize.DATE,
        featureImage: Sequelize.STRING,
        published: Sequelize.BOOLEAN,
    },
    {
        createdAt: true,
        updatedAt: true,
    }
);

let Category = sequelize.define("Category", {
    category: Sequelize.STRING,
});

Post.belongsTo(Category, { foreignKey: "category" });

exp.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(() => {
                resolve("Database sync successfully");
            })
            .catch(() => {
                reject("unable to sync the database");
            });
    });
};

exp.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

exp.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { category: category } })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

exp.getPostsByMinDate = (minDateStr) => {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr),
                },
            }
        })
        .then((data) => {
            resolve(data);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

exp.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { id: id } })
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

exp.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = postData.published ? true : false;

        for (let elem in postData) {
            if (postData[elem] === "") {
                postData[elem] = null;
            }
        }
        postData.postDate = new Date();

        Post.create(postData)
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject("unable to create post");
            });
    });
};

exp.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { published: true } })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

exp.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { category: category, published: true } })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

exp.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

exp.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        categoryData.category == "" ? categoryData.category = null : categoryData.Category = categoryData.Category;

        Category.create(categoryData)
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("unable to add a category");
            });
    });
};

exp.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id } })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject({ message: "Mission abort! unable to delete post, with the specified id" });
            });
    });
};

exp.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({ where: { id: id } })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject({message: "Mission abort! unable to delete post, with the specified id"});
            });
    });
};
