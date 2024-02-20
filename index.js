const express = require('express');
const jwt = require('jsonwebtoken');
const dbStart = require("./dbstart");
const config = require('./env-variables');
const app = express();
const bodyParser = require('body-parser');
const PORT = config.port;
const SECRET_KEY = config.jwtSecret;
app.use(bodyParser.json());

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user.userId;
    next();
  });
}

/*Routes Start*/
app.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const inventory = await getInventory();
    if (inventory?.length) {
      console.log("inventory fetched");
      res.status(200).json({ inventory });
    } else {
      res.status(400).json({ error: "No items found in inventory" });
    }
  } catch (error) {
    console.error("Error fetching items:", error); // Log any errors
    res.status(500).json({ error: error.message });
  }
});

app.get('/items', authenticateToken, async (req, res) => {
    try {
      const inventory = await getItems();
      if (inventory?.length) {
        console.log("inventory fetched");
        res.status(200).json({ inventory });
      } else {
        res.status(400).json({ error: "No items found in inventory" });
      }
    } catch (error) {
      console.error("Error fetching items:", error); // Log any errors
      res.status(500).json({ error: error.message });
    }
  });

app.post('/register', async (req, res) => {
  try {
    await validateUserCredentials(req.body);
    const user = await createUser(req.body.userName, req.body.role);
    if (user) {
      console.log("User created:", user); // Log the created user
      const token = jwt.sign({ userId: user.id }, SECRET_KEY);
      // res.json({ token });
      res.status(200).json({ token, message: `user with userName ${user.userName} and role ${user.role} created successfully` });
    } else {
      console.log("User not created"); // Log if user creation failed
      res.status(400).json({ error: "user not created" });
    }
  } catch (error) {
    console.error("Error registering user:", error); // Log any errors
    res.status(500).json({ error: error.message });
  }
})

app.post('/item', authenticateToken, async (req, res) => {
  try {
    await validateInventoryEntry(req.body);
    const item = await createitem(req.body.name, req.body.description, req.body.price, req.body.count);
    if (item) {
      console.log("item created:", item); // Log the created item
      res.status(200).json({ message: `item ${item.name} created successfully with id ${item.id}` });
    } else {
      console.log("item not created"); // Log if item creation failed
      res.status(400).json({ error: "item not created" });
    }
  } catch (error) {
    console.error("Error creating item:", error); // Log any errors
    res.status(500).json({ error: error.message });
  }
});

app.post('/add-item/:id', authenticateToken, async (req, res) => {
    try {
      const item = await addItemToCart(req.params.id, req.user, 1);
      if (item) {
        console.log("item updated:", item); // Log the updated item
        res.status(200).json({ message: `item updated successfully` });
      } else {
        console.log("item not updated"); // Log if item updation failed
        res.status(400).json({ error: "item not updated" });
      }
    } catch (error) {
      console.error("Error updating item:", error); // Log any errors
      res.status(500).json({ error: error.message });
    }
  });

app.put('/item/:id', authenticateToken, async (req, res) => {
  try {
    const item = await updateItem(req.params.id, req.body?.name, req.body?.description, req.body?.price, req.body?.count);
    if (item) {
      console.log("item updated:", item); // Log the updated item
      res.status(200).json({ message: `item updated successfully` });
    } else {
      console.log("item not updated"); // Log if item updation failed
      res.status(400).json({ error: "item not updated" });
    }
  } catch (error) {
    console.error("Error updating item:", error); // Log any errors
    res.status(500).json({ error: error.message });
  }
});

app.delete('/item/:id', authenticateToken, async (req, res) => {
  try {
    const item = await deleteItem(req.params.id);
    if (item) {
      console.log("item deleted:", item); // Log the deleted item
      res.status(200).json({ message: `item deleted successfully` });
    } else {
      console.log("item not deleted"); // Log if item deletion failed
      res.status(400).json({ error: "item not deleted" });
    }
  } catch (error) {
    console.error("Error deleting item:", error); // Log any errors
    res.status(500).json({ error: error });
  }
});


/* Routes END */

/* Utility functions for routes BEGIN*/


/**Validation functions */
function validateUserCredentials(body) {
  return new Promise(function (resolve, reject) {
    try {
      if (!body?.userName) {
        throw new Error("Please enter username")
      }
      if (!body?.role) {
        throw new Error("Please enter role")
      }
      resolve(body);
      return;
    } catch (error) {
      reject(error);
      return;
    }
  })
}



function validateInventoryEntry(body) {
  return new Promise(function (resolve, reject) {
    try {
      if (!body?.name) {
        throw new Error("Please enter item name")
      }
      if (!body?.description) {
        throw new Error("Please enter item description")
      }
      if (!body?.price) {
        throw new Error("Please enter item price")
      }
      if (body?.count === undefined) {
        throw new Error("Please enter item count")
      }
      resolve();
      return;
    } catch (error) {
      reject(error);
      return;
    }
  })
}

/**Crud functions */
function createUser(userName, role) {
  return new Promise(function (resolve, reject) {
    global.databaseConnection.models.users.create({
      userName,
      role
    }).then(function (result) {
      if (result) {
        let user = result.dataValues;
        resolve(user);
        return;
      }
      else {
        reject();
        return;
      }
    }).catch(function (err) {
      reject(err);
      return;
    })
  })
}

function createitem(name, description, price, count) {
  return new Promise(function (resolve, reject) {
    global.databaseConnection.models.inventory.create({
     name, description, price, count
    }).then(function (result) {
      if (result) {
        let item = result.dataValues;
        resolve(item);
        return;
      }
      else {
        reject();
        return;
      }
    }).catch(function (err) {
      reject(err);
      return;
    })
  })
}

function getInventory() {
  return new Promise(function (resolve, reject) {
    global.databaseConnection.models.inventory.findAll()
    .then(function (result) {
      if (result) {
        let inventory = result;
        resolve(inventory);
        return;
      }
      else {
        reject();
        return;
      }
    }).catch(function (err) {
      reject(err);
      return;
    })
  })
}

function getItems() {
    return new Promise(function (resolve, reject) {
      global.databaseConnection.models.inventory.findAll({attributes:["name", "description", "price"]})
      .then(function (result) {
        if (result) {
          let inventory = result;
          resolve(inventory);
          return;
        }
        else {
          reject();
          return;
        }
      }).catch(function (err) {
        reject(err);
        return;
      })
    })
  }

function updateItem(id, name, description, price, count) {
  return new Promise(function (resolve, reject) {
    let updateObject = {};
    if (name) {
      updateObject.name = name;
    }
    if (description) {
        updateObject.description = description;
      }
    if (price) {
      updateObject.price = price;
    }
    if (count) {
        updateObject.count = count;
      }
    global.databaseConnection.models.inventory.update(updateObject, { where: { id: id } })
      .then(function (result) {
        if (result) {
          let item = result[0];
          resolve(item);
          return;
        }
        else {
          reject();
          return;
        }
      }).catch(function (err) {
        reject(err);
        return;
      })
  })
}

function addItemToCart(itemId, userId, count) {
    return new Promise(function (resolve, reject) {
      global.databaseConnection.models.cart.create({
        itemId, userId, count
      }).then(function (result) {
        if (result) {
          let item = result.dataValues;
          resolve(item);
          return;
        }
        else {
          reject();
          return;
        }
      }).catch(function (err) {
        reject(err);
        return;
      })
    })
  }
  
function deleteItem(id) {
  return new Promise(function (resolve, reject) {
    global.databaseConnection.models.inventory.destroy({ where: { id: id }, individualHooks: true })
      .then(function (result) {
        if (result) {
          let item = result;
          resolve(item);
          return;
        }
        else {
          reject();
          return;
        }
      }).catch(function (err) {
        reject(err);
        return;
      })
  })
}

/* Utility functions for routes END*/

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});