const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const dbconfig = require('./config/dbConfig'); // Ensure this connects to your DB
const app = require('./app');

const http = require('http');
const setupSocket = require('./uploads/socket');

// Create an HTTP server
const server = http.createServer(app);


setupSocket(server);



const port = process.env.PORT_NUMBER || 8000;

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
