const jsonServer = require("json-server");
const server = jsonServer.create();
const path = require("path");
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();
server.use(middlewares);
server.use(router);

const generateId = () => {
  const db = router.db;
  const maxId =
    db.numbers.length > 0 ? Math.max(...db.numbers.map((n) => n.id)) : 0;
  return maxId + 1;
};
server.use((req, res, next) => {
  console.log("POST request listener");
  const body = req.body;
  console.log(body);
  if (req.method === "POST") {
    // If the method is a POST echo back the name from request body
    res.json({ message: "User created successfully", name: req.body.name });
  } else {
    //Not a post request. Let db.json handle it
    next();
  }
});
server.get("/info", (request, response) => {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = "<div>" + date + " " + time + "</div>";

  const db = router.db;
  var firstLine = "phonebook contains:" + db.numbers.length + " numbers";
  response.send(firstLine, dateTime);
});

server.post("/api/persons", (req, res) => {
  const db = router.db; // Assign the lowdb instance

  if (Array.isArray(req.body)) {
    req.body.forEach((element) => {
      insert(db, "numbers", element); // Add a post
    });
  } else {
    insert(db, "numbers", req.body); // Add a post
  }
  res.sendStatus(200);

  /**
   * Checks whether the id of the new data already exists in the DB
   * @param {*} db - DB object
   * @param {String} collection - Name of the array / collection in the DB / JSON file
   * @param {*} data - New record
   */
  function insert(db, collection, data) {
    const table = db.get(collection);
    if (_.isEmpty(table.find(data).value())) {
      table.push(data).write();
    }
  }
});
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
server.use(requestLogger);

server.listen(3001, () => {
  console.log("JSON Server is running");
});
