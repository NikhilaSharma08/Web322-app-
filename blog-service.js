const { Sequelize, DataTypes } = require("sequelize");

const { gte } = Sequelize.Op;

const sequelize = new Sequelize(
  
  "azaylcii",
"azaylcii",
 "aJUA-uZuFiGQR96Ph47BrPq9u9laL_iI", {
  host: 'stampy.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// Define the Post data model
const Post = sequelize.define("Post", {
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  featureImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

// Define the Category data model
const Category = sequelize.define("Category", {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// This will ensure that our Post model gets a "category" column that will act as a foreign key to the Category model
Post.belongsTo(Category, { foreignKey: "category" });

// => Read the posts.json and categories.json files and store the data in global arrays
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to sync the database");
      });
  });
}

// => Provides full array of "posts" objects
function getAllPosts() {
  return Post.findAll();
}

function getPostsByCategory(categoryId) {
  return Post.findAll({ where: { category: categoryId } });
}

function getPostsByMinDate(minDateStr) {
  const { gte } = Sequelize.Op;
  return Post.findAll({
    where: {
      postDate: {
        [gte]: new Date(minDateStr),
      },
    },
  });
}

function getPostById(id) {
  return Post.findAll({ where: { id: id } }).then((data) => data[0]);
}

function addPost(postData) {
  postData.published = postData.published ? true : false;
  for (const prop in postData) {
    if (postData[prop] === "") {
      postData[prop] = null;
    }
  }
  postData.postDate = new Date();
  return Post.create(postData);
}

function getPublishedPosts() {
  return Post.findAll({ where: { published: true } });
}

function getPublishedPostsByCategory(categoryId) {
  return Post.findAll({ where: { published: true, category: categoryId } });
}

function getCategories() {
  return Category.findAll();
}
const addCategory = (categoryData) => {
  for (const prop in categoryData) {
    if (categoryData[prop] === "") {
      categoryData[prop] = null;
    }
  }

  return Category.create(categoryData)
    .then((category) => Promise.resolve(category))
    .catch((err) => Promise.reject("Unable to create category"));
};

function deletePostById(id) {
  return Post.destroy({
    where: { id: id }
  });
}
function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve("Destroyed");
      })
      .catch(() => {
        reject("Unable to delete category");
      });
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostById,
  getPostsByCategory,
  getPostsByMinDate,
  getPublishedPostsByCategory,
  addCategory,
  deleteCategoryById, 
  deletePostById,
};
