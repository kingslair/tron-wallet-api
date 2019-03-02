const CONFIG = require('../config.json');
const HELPER = require('./helper.js');
const CONSTANTS = require('./constants.js');
const userDB = require('../db/users.json');
const assetsDB = require('../db/assets.json');

module.exports = {
	"createUser" : async(connObject, userId) => {
		var options = {
			method: 'POST',
			uri: CONFIG.TESTNET_CORE_URL + CONFIG.TESTNET_GENERATE_ADDRESS,
			json: true
		};
		var resBody = await connObject(options);		
		var getBalance = await HELPER.transfer(connObject, resBody.hexAddress);
		//Check if user is already registered
		var checkExistenceForUser = Object.keys(userDB);
		if(checkExistenceForUser.indexOf(userId) == -1) {
			var insertCurrentUser = {};
			insertCurrentUser["userId"] = userId;
			insertCurrentUser["userPrivateKey"] = resBody.privateKey;
			insertCurrentUser["address"] = resBody.address;
			insertCurrentUser["userHexAddress"] = resBody.hexAddress;
			insertCurrentUser["userBalance"] = getBalance.balance;
			userDB[userId] = insertCurrentUser;
			HELPER.updateDB("USERS_DB");
			return resBody;
		} else {
			return { "address" : "User Already Exists" };
		}
		
	},
	"getUserBalance" : async(connObject, address) => {
		try {
			var getAddress = userDB[address]["userHexAddress"];
		} catch(e) {
			return { "balance" : "Account not found" }
		}
		var options = {
			method: 'POST',
			uri: CONFIG.TESTNET_CORE_URL + CONFIG.TESTNET_GET_ACCOUNT,
			body: {
				address: getAddress
			},
			json: true
		};
		var resBody = await connObject(options);
		userDB[address]["userBalance"] = resBody.balance;
		HELPER.updateDB("USERS_DB");
		return resBody;
	},
	"addAsset" : async(connObject, assetName, assetSymbol) => {
		var assetStruct = {};
		//Build a asset structure to be send
		assetStruct["owner_address"]= "";
		assetStruct["name"] = Buffer.from(assetName, 'utf8').toString('hex');
		assetStruct["abbr"] = Buffer.from(assetSymbol, 'utf8').toString('hex');
		assetStruct["total_supply"] = CONSTANTS.total_supply;
		assetStruct["trx_num"] = CONSTANTS.trx_num;
		assetStruct["num"] = CONSTANTS.num;
		assetStruct["start_time"] = CONSTANTS.start_time;
		assetStruct["end_time"]= CONSTANTS.end_time;
		assetStruct["vote_score"] = CONSTANTS.vote_score;
		assetStruct["description"] = CONSTANTS.description;
		assetStruct["url"] = CONSTANTS.urlId;
		assetStruct["free_asset_net_limit"] = CONSTANTS.free_asset_net_limit;
		assetStruct["public_free_asset_net_limit"] = CONSTANTS.public_free_asset_net_limit;
		var errorProcessing = await HELPER.processAsset(connObject, assetStruct);
		var currentAsset = {};
		currentAsset["name"] = assetName;
		currentAsset["symbol"] = assetSymbol;
		currentAsset["isActive"] = true;
		assetsDB[assetName] = currentAsset;
		HELPER.updateDB("ASSETS_DB");
		return { "message" : "Assets Command Result : " + JSON.stringify(errorProcessing.errorIfAny) }
	},
	"getBlock" : async(connObject, blockNum) => {
		blockNum = parseInt(blockNum);
		var options = {
			method: 'POST',
			uri: CONFIG.TESTNET_CORE_URL + CONFIG.TESTNET_GET_BLOCK_BY_NUM,
			body: {
				num: blockNum
			},
			json: true
		};
		var resBody = await connObject(options);
		for(var eachTx of resBody.transactions) {
			HELPER.processEachTransaction(connObject, eachTx.txID);
		}
		return "Proccessed"
	}
};