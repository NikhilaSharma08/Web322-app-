const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;

var sequelize = new Sequelize(
  
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

// Define the Post model
const Post = sequelize.define('Post', {
  body: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  postDate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  featureImage: {
    type: Sequelize.STRING
  },
  published: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

// Define the Category model
const Category = sequelize.define('Category', {
  category: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
});

// Define the relationship (belongsTo) between Post and Category
Post.belongsTo(Category, { foreignKey: 'categoryId' }); // 'categoryId' is the foreign key in the Post table

// Sync the models with the database (create the tables if they don't exist)
sequelize.sync()
  .then(() => {
    console.log('Database and tables are in sync');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

// Implement the functions to interact with the database using the defined models

function initialize() {
  return sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
      return sequelize.sync();
    })
    .then(() => {
      console.log('Database and tables are in sync');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
      throw new Error('Unable to sync the database');
    });
}

function getAllPosts() {
  return Post.findAll({
    include: Category
  });
}

function getPostsByCategory(categoryId) {
  return Post.findAll({
    where: {
      categoryId: categoryId
    },
    include: Category
  });
}

function getPostsByMinDate(minDate) {
  return Post.findAll({
    where: {
      postDate: {
        [Sequelize.Op.gte]: minDate
      }
    },
    include: Category
  });
}

function getPostById(id) {
  return Post.findByPk(id, {
    include: Category
  });
}

function addPost(postData) {
  postData.published = (postData.published) ? true : false;

  for (const key in postData) {
    if (postData[key] === "") {
      postData[key] = null;
    }
  }

  postData.postDate = new Date();

  return Post.create(postData)
    .then(() => {
      console.log('Post created successfully');
    })
    .catch(err => {
      console.error('Unable to create post:', err);
      throw new Error('Unable to create post');
    });
}

function getPublishedPosts() {
  return Post.findAll({
    where: {
      published: true
    },
    include: Category
  });
}

function getPublishedPostsByCategory(categoryId) {
  return Post.findAll({
    where: {
      published: true,
      categoryId: categoryId
    },
    include: Category
  });
}

function getCategories() {
  return Category.findAll();

}

function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    for (const prop in categoryData) {
      if (categoryData[prop] === "") {
        categoryData[prop] = null;
      }
    }

    Category.create(categoryData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to create category");
      });
  });
}
function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: { id: id }
    })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          resolve();
        } else {
          reject("Category not found");
        }
      })
      .catch((err) => {
        reject("Unable to delete category");
      });
  });
}

// Delete a post by ID
function deletePostById(id) {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: { id: id }
    })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          resolve();
        } else {
          reject("Post not found");
        }
      })
      .catch((err) => {
        reject(err.message || "Unable to delete post");
      });
  });
}


module.exports = { 
  initialize, 
  getAllPosts, 
  getPostsByCategory, 
  getPostsByMinDate, 
  getPostById, 
  addPost, 
  getPublishedPosts, 
  getPublishedPostsByCategory, 
  getCategories,
  deleteCategoryById,
  deletePostById,
  addCategory
};
