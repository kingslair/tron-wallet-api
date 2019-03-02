const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PORT;
const rp = require('request-promise-native');
const util = require('./util/util.js');

app.get('/create/:userId', async(req, res) => {
	console.log(" [x] Create User Invoked");
	if(!req.params.userId) 
		return "Usage -- /create/{{userID}}"
	var address = await util.createUser(rp, req.params.userId)
	//return public address for the user
	res.send(address.address)
})

app.get('/balance/:userId', async(req, res) => {
	console.log(" [x] Get Balance of User Invoked");
	if(!req.params.userId) 
		return "Usage -- /balance/{{userID}}"
	//return balance as output
	var balance = await util.getUserBalance(rp, req.params.userId)
	res.send(balance.balance.toString())
})

app.get('/process/:blockNumber', async(req, res) => {
	console.log(" [x] Process Block Invoked");
	//Adds up the balance
	var blockDetails = await util.getBlock(rp, req.params.blockNumber)
	res.send(JSON.stringify(blockDetails))
})
										
app.get('/add-asset/:name/:symbol', async(req, res) => {
	console.log(" [x] Add Asset Invoked");
	//add an asset
	var addAsset = await util.addAsset(rp, req.params.name, req.params.symbol)
	res.send(addAsset.message)
})

app.listen(port, () => console.log(` [x] APIS on port ${port}!`))