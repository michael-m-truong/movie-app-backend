const http = require('http');
const app = require('./app');

const normalizePort = val => {
	const port = parseInt(val, 10);

  	if (isNaN(port)) {
    	return val;
  	}
  	if (port >= 0) {
    	return port;
  	}
  	return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
  	if (error.syscall !== 'listen') {
    	throw error;
  	}
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  	const address = server.address();
  	const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  	console.log('Listening on ' + bind);
});

swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
		title: "LogRocket Express API with Swagger",
		// version: "0.1.0",
		description:
			"This is a simple CRUD API application made with Express and documented with Swagger",
		// license: {
		// 	name: "MIT",
		// 	url: "https://spdx.org/licenses/MIT.html",
		// },
		// contact: {
		// 	name: "LogRocket",
		// 	url: "https://logrocket.com",
		// 	email: "info@email.com",
		// },
		},
		servers: [
		{
			url: "http://localhost:3000",
		},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
	"/docs",
	swaggerUi.serve,
	swaggerUi.setup(specs, { explorer: true })
);

server.listen(port);
