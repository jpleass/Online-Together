# Development

``npm run dev`` to start development
``npm start`` to run the express server

In server/_server.js you have change the code for local development and production. Sorry I should have used some .env variables but we got lazy.

## For local

	const server = http.createServer(app);
	const io = socketIO(server);
	…
	server.listen(
	  process.env.PORT,
	  () => console.log(`👍 ${process.env.HOST}:${process.env.PORT}`)
	)
	
## For production

	const httpsServer = https.createServer(credentials, app);
	const io = socketIO(httpsServer);
	…
	httpsServer.listen(443, () => {
		console.log('HTTPS Server running on port 443');
	});
	
	

