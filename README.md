# 4471-stocks
This project is currently hosted on AWS: http://3.140.248.183:3000/

This project is split up into two components, a node.js backend and a react frontend. The node server.js file can be found in the server folder, and it requires a config JSON file in order to run. The config file should include the following information:

	"host": "stocks-database.cp0mxw253ygq.us-east-2.rds.amazonaws.com",
	"user": "admin",
	"password": "pYPFk+-^4;<J$<Lg"

In order to run the backend locally you will need to npm install the following dependencies for the server.js file: node, redis, ws, mysql

Once the backend dependencies are installed, you can run node server.js in the server folder in order to run the backend. Next you need to go into the UI folder and npm install. Once the react app has installed, run npm start in a separate terminal window other than the node window you have running. Now the application will be running on localhost:3000.
