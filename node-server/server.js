// https://www.youtube.com/watch?v=HrjC6RwEpt0
import express from "express";
import cors from "cors";
import {readJsonFileSync, writeJsonFileSync} from "./utils.js";
// https://stackoverflow.com/a/64383997/132396
import {fileURLToPath} from "url";
import {dirname, join} from "path";
import {logger} from "./middleware/logger.js";
import {v4 as uuidv4} from "uuid";
/////////////////////////////////////////////////////////////////////////////
// Start: Websocket, rxjs. Blocking multi-edit
/////////////////////////////////////////////////////////////////////////////
import {WebSocketServer} from "ws";
import HashMap from 'hashmap';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors())
app.use(logger)
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(join(__dirname, 'public')));

/////////////////////////////////////////////////////////////////////////////
// Start: route handling for crud. Unabstracted, repetitive but easy to read.
/////////////////////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("<h3>Hello World!</h3>");
});

app.get("/api/students", (req, res) => {
  let jsonData = readJsonFileSync('./db-students.json');
  // console.log(jsonData.studentsList);
  res.json(jsonData.studentsList);
});

app.get("/api/students/:id", (req, res) => {
  let jsonData = readJsonFileSync('./db-students.json');
  const found = jsonData.studentsList.some(s => s.id === req.params.id);
  if(found) {
    let student = jsonData.studentsList.find(s => s.id === req.params.id);
    // console.log('student', student);
    res.json(student);
  } else {
    res.status(400).json({msg: `No student with the id of ${req.params.id}`});
  }
});

app.post("/api/students", (req, res) => {
  // console.log(req.body);
  const newStudent = {
    id: uuidv4().substring(0, 8),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    age: req.body.age
  }
  // console.log(newStudent);
  let jsonData = readJsonFileSync('./db-students.json');
  jsonData.studentsList.push(newStudent);
  writeJsonFileSync('./db-students.json', jsonData);
  res.send(req.body);
});

app.put("/api/students/:id", (req, res) => {
  let jsonData = readJsonFileSync('./db-students.json');
  const found = jsonData.studentsList.some(s => s.id === req.params.id);
  if(found) {
    const updStudent = req.body;
    jsonData.studentsList.forEach(s => {
      if(s.id === req.params.id) {
        s.firstName = updStudent.firstName ? updStudent.firstName : s.firstName;
        s.lastName = updStudent.lastName ? updStudent.lastName : s.lastName;
        s.gender = updStudent.gender ? updStudent.gender : s.gender;
        s.age = updStudent.age ? updStudent.age : s.age;

        writeJsonFileSync('./db-students.json', jsonData);
        // console.log('Updated Student', s)
        res.send({msg: 'Student updated', s})
      }
    });
  } else {
    res.status(400).json({msg: `No student with the id of ${req.params.id}`});
  }
});

app.delete("/api/students/:id", (req, res) => {
  let jsonData = readJsonFileSync('./db-students.json');
  const found = jsonData.studentsList.some(s => s.id === req.params.id);
  const keepers = [];
  if(found) {
    jsonData.studentsList.forEach(s => {
      if(s.id !== req.params.id) {
        keepers.push(s);
      }
    });
    jsonData.studentsList = keepers;
    writeJsonFileSync('./db-students.json', jsonData);
    // console.log('Deleted Student', req.params.id);
    res.send({msg: `Student deleted ${req.params.id}`});
  } else {
    res.status(400).json({msg: `No student with the id of ${req.params.id}`});
  }
});

app.get("/api/products", (req, res) => {
  let jsonData = readJsonFileSync('./db-products.json')
  // console.log(jsonData.productsList);
  res.json(jsonData.productsList);
});

app.get("/api/products/:id", (req, res) => {
  let jsonData = readJsonFileSync('./db-products.json')
  const found = jsonData.productsList.some(p => p.id === req.params.id);
  if(found) {
    let product = jsonData.productsList.find(p => p.id === req.params.id);
    // console.log('product', product);
    res.json(product);
  } else {
    res.status(400).json({msg: `No product with the id of ${req.params.id}`});
  }
});

app.post("/api/products", (req, res) => {
  // console.log(req.body);
  const newProduct = {
    id: uuidv4().substring(0, 8),
    name: req.body.name,
    make: req.body.make,
    price: req.body.price
  }
  // console.log(newProduct);
  let jsonData = readJsonFileSync('./db-products.json');
  jsonData.productsList.push(newProduct);
  writeJsonFileSync('./db-products.json', jsonData);
  res.send(req.body);
});

app.put("/api/products/:id", (req, res) => {
  let jsonData = readJsonFileSync('./db-products.json');
  const found = jsonData.productsList.some(s => s.id === req.params.id);
  if(found) {
    const updProduct = req.body;
    jsonData.productsList.forEach(p => {
      if(p.id === req.params.id) {
        p.name = updProduct.name ? updProduct.name : p.name;
        p.make = updProduct.make ? updProduct.make : p.make;
        p.price = updProduct.price ? updProduct.price : p.price;

        writeJsonFileSync('./db-products.json', jsonData);
        // console.log('Updated Product', p)
        res.send({msg: 'Product updated', s: p})
      }
    });
  } else {
    res.status(400).json({msg: `No product with the id of ${req.params.id}`});
  }
});

app.delete("/api/products/:id", (req, res) => {
  let jsonData = readJsonFileSync('./db-products.json');
  const found = jsonData.productsList.some(s => s.id === req.params.id);
  const keepers = [];
  if(found) {
    jsonData.productsList.forEach(s => {
      if(s.id !== req.params.id) {
        keepers.push(s);
      }
    });
    jsonData.productsList = keepers;
    writeJsonFileSync('./db-products.json', jsonData);
    // console.log('Deleted Product', req.params.id);
    res.send({msg: `Product deleted ${req.params.id}`});
  } else {
    res.status(400).json({msg: `No product with the id of ${req.params.id}`});
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`App listening on port: ${PORT}`));

const wss = new WebSocketServer({ port: 8081 });

// Chat Event listener for WebSocket server connections
wss.on('connection', (ws) => {
  console.log('New chat client connected');
  // Event listener for incoming messages
  ws.on('message', (buffer) => {
    const message = JSON.parse(buffer.toString());

    if(message.type === 'ping') {
      console.log('Ping received:', message);
      const response = {
        type: 'pong',
        payload: message.content
      }
      return ws.send(JSON.stringify(response));
    }
    console.log('Received message:', message);
    const response = {
      type: "echo",
      payload: message.content
    }

    // Send a response back to the client
    ws.send(JSON.stringify(response));
  });

  // Event listener for client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Event listener for WebSocket server start
wss.on('listening', () => {
  console.log('WebSocket server started');
});

class EditLockerWebSocketServer {

  editablesMap = new HashMap();

  constructor(port) {
    this.port = port;
    this.wss = null;
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on('connection', (ws) => {
      console.log('New edit-locker client connected.');

      ws.on('message', (buffer) => {
        const message = JSON.parse(buffer.toString());
        console.log('Received message:', message);

        if (!this.isSubscribed(ws)) {
          if (message.type === 'subscribe') {
            console.log('Client subscription. ID: ' + message.payload);
            // Handle the subscription logic here
            this.setSubscribed(message.payload, ws);

            // Send a response to the client
            const response = {
              type: 'subscribed',
              payload: message.payload
            }
            return ws.send(JSON.stringify(response));
          } else {
            console.log('Initial message type not "subscribe". Closing connection.');
            ws.close();
          }
        } else {
          // Handle subsequent messages after subscription here
          if (message.type === 'ping') {
            console.log('Ping received:', message.payload);
            const response = {
              type: 'pong',
              payload: 'glad to hear from you!'
            }
            return ws.send(JSON.stringify(response));
          }
          if (message.type === 'unsubscribe') {
            console.log('Client unsubscription. ID: ', message.payload);
            this.editablesMap.remove(ws);
            const response = {
              type: 'unsubscribed',
              payload: message.payload
            }
            return ws.send(JSON.stringify(response));
          }
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected.');
        this.editablesMap.delete(this.editablesMap.search(ws));
      });
    });
  }

  isSubscribed(ws) {
    if(this.editablesMap.search(ws) !== null) {
      return true;
    }
    return false;
  }

  setSubscribed(editableId, ws) {
    if (!this.editablesMap.has(editableId)) {
      this.editablesMap.set(editableId, ws);
    }
  }

  runIntervalNotifier() {
    setInterval(() => {
      this.editablesMap.forEach((ws, editableId) => {
        if (ws !== null) {
          const response = {
            type: 'pong',
            payload: 'are you there?'
          }
          console.log('Sending ping to client: ' + editableId)
          ws.send(JSON.stringify(response));
        }
      });
    }, 5000);
  }
}

// Usage example
const server = new EditLockerWebSocketServer(9074);
server.start();
server.runIntervalNotifier();


/*
if locked, send to all who have the page open: no editable
 */
