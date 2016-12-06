var fs = require('fs');
var solc = require('solc');
var Web3 = require('web3');
var web3 = new Web3();


web3.setProvider(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
web3.eth.defaultAccount = web3.eth.accounts[0];

// 读取coin.sol
var source = fs.readFileSync("./coin.sol", "utf8");

// 使用solc编译coin.sol
var compiled = solc.compile(source);

// abi也可以用solc --abi coin.sol得到
// 在app.js里需要用到
var abi = JSON.parse(compiled.contracts.Coin.interface);
var coinContract = web3.eth.contract(abi);

var code = compiled.contracts.Coin.bytecode;

var Coin = coinContract.new({
  data: code,
  gas: 1000000,
  from: web3.eth.defaultAccount
}, function(err, Coin) {
  // 这个callback会被被调用两次, 第一次我们得到发送的交易Hash,
  // 第二次则是这个交易被写入区块后, 我们得到合约部署的地址
  // 地址在app.js里需要用到
  if (!err) {
    if (!Coin.address) {
      console.log("Tx sent: " + Coin.transactionHash);
    } else {
      console.log("Coin deployed at: " + Coin.address);
    }
  }
});

