# TRON Testnet Wallet API's

## Installation

Use the node package manager [npm](https://www.npmjs.com/) to install wallet API's.

```nodejs
npm install
```

## Start Service

To start service use.

```nodejs
npm start
```

## Usage

1. Create User

```bash
curl -X POST http://localhost:3000/create/:userId
```
2. Get User Balance

```bash
curl -X POST http://localhost:3000/balance/:userId
```

3. Process a Block

```bash
curl -X POST http://localhost:3000/process/:blockNumber
```

4. Add a New Asset

```bash
curl -X POST http://localhost:3000/add-asset/:name/:symbol
```

## Configuration

```bash
All configuration are available in the root directory file 'config.json'
```

## DB

File Based JSON DB is used, and is located in the root directory.

```bash
cd db/
```
#### Tables
1. user.json
2. assets.json


## Misc

Once a user is created, it can viewed in [shasta.tronscan.org](https://shasta.tronscan.org/) by using 'import wallet' using the private key.
