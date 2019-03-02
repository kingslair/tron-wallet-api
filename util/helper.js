const fs = require('fs');
const CONFIG = require('../config.json');
const CONSTANTS = require('./constants.js');
const userDB = require('../db/users.json');
const assetsDB = require('../db/assets.json');

module.exports = {
	"updateDB" : async(dbName) => {
		switch (dbName) {
			case "USERS_DB":
				fs.writeFile(CONFIG.USER_DB_PATH, JSON.stringify(userDB), function(err) {
					if(err) {
						return console.log(err);
					}
					console.log(" [x] Users DB updated!");
				});	
				break;
			case "ASSETS_DB":
				fs.writeFile(CONFIG.ASSETS_DB_PATH, JSON.stringify(assetsDB), function(err) {
					if(err) {
						return console.log(err);
					}
					console.log(" [x] Assets DB updated!");
				});
				break;
			default:
				console.log(" [x] No DB found to update");
		}
	},
	"transfer" : async(connObject, userAddress) => {
		var options = {
			method: 'POST',
			uri: CONFIG.TESTNET_CORE_URL + CONFIG.TESTNET_EASY_TRANSFER,
			body: {
				privateKey: CONFIG.TX_PRIVATE_KEY,
				toAddress: userAddress,
				amount: CONSTANTS.BASE_AMOUNT
			},
			json: true
		};
		var resBody = await connObject(options);
		return resBody;
	},
	"processEachTransaction" : async(connObject, txId) => {
		var options = {
			method: 'POST',
			uri: CONFIG.TESTNET_CORE_URL + CONFIG.TESTNET_GET_TX_BY_ID,
			body: {
				value: txId
			},
			json: true
		};
		var resBody = await connObject(options);
		var txStruct = resBody.raw_data.contract[0];
		var txOwnerAddress = txStruct.parameter.value.owner_address;
		var getAllUsers = Object.values(userDB);
		var found = 0;
		for(var eachUser of getAllUsers) {
			console.log(eachUser);
			if(txOwnerAddress == eachUser.userHexAddress) {
				found = 1;
				//update the usersDB
				try {
					userDB[eachUser["userId"]]["balance"].push(txStruct.parameter.value.num);
				} catch(e) {
					//Handle for first time usaage
					userDB[eachUser["userId"]]["balance"] = [];
					userDB[eachUser["userId"]]["balance"].push(txStruct.parameter.value.num);
				}			
			}
		}
		console.log(found ? " [x] Found A Matching User":" [x] No User Found")
		module.exports.updateDB("USERS_DB");
		return found;
	},
	"processBroadcastTX" : async(connObject, txSignedStruct) => {
		var options = {
			method: 'POST',
			uri: CONFIG.TESTNET_CORE_URL + CONFIG.TESTNET_BROADCAST_TX,
			body: txSignedStruct,
			json: true
		};
		var resBody = await connObject(options);
		return resBody;
	},
	"processSignTX" : async(connObject, privKey, txStruct) => {
		var signTxStrcut = {};
		signTxStrcut["transaction"] = txStruct;
		signTxStrcut["privateKey"] = privKey;
		var options = {
			method: 'POST',
			uri: CONFIG.TESTNET_CORE_URL + CONFIG.TESTNET_GET_TX_SIGN,
			body: signTxStrcut,
			json: true
		};
		var resBody = await connObject(options);
		var broadCastOutput = module.exports.processBroadcastTX(connObject, resBody);
		return broadCastOutput;
	},
	"processAsset" : async(connObject, assetStruct) => {
		//simulation purposes only
		var getAllActiveUserAccounts = Object.keys(userDB);
		var privKey = userDB[getAllActiveUserAccounts[CONSTANTS.lastProccessedUser]]["userPrivateKey"];
		
		//Update the owner asset so that they can issue asset once
		assetStruct["owner_address"]= userDB[getAllActiveUserAccounts[CONSTANTS.lastProccessedUser]]["userHexAddress"];
		//increment simulation var
		CONSTANTS.lastProccessedUser = CONSTANTS.lastProccessedUser + 1;
		//Send Request
		var options = {
			method: 'POST',
			uri: CONFIG.TESTNET_CORE_URL + CONFIG.TESTNET_ADD_ASSET,
			body: assetStruct,
			json: true
		};
		var resBody = await connObject(options);
		var processOutput = module.exports.processSignTX(connObject, privKey, resBody);
		return {"errorIfAny" : resBody, "processOutput" :  processOutput };
	}
}
