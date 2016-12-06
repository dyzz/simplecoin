// 初始化web3
var web3 = new Web3(new Web3.providers.HttpProvider("http://" + window.location.hostname + ":8545"));

// solc --abi coin.sol 
var abi = [{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"generate","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"success","type":"bool"}],"name":"Transfer","type":"event"}];

// 使用node deploy.js返回的地址
var Coin = web3.eth.contract(abi).at('0x8b545a42bf8b9748ba6408209b733e28a42ce5cb');

// 获取钱包里所有地址
var addrs = web3.eth.accounts;

var app = new Vue({
  el: '#app',
  data: {
    accounts: [],
    newAmount: 50,
    sender: addrs[0],
    receiver: addrs[1],
    amount: 10,
    blockNumber: web3.eth.blockNumber
  },
  methods: {
    // 调用合约的generate方法
    generate: function() {
      console.log("Generate " + this.newAmount);
      // deploy.js创建合约时使用的地址是addrs[0], 即admin
      Coin.generate(this.newAmount, {
        from: addrs[0]
      });
    },

    // 调用合约的transfer方法
    transfer: function() {
      console.log("Transfer " + this.amount + " from " + this.sender + " to " + this.receiver);
      Coin.transfer(this.receiver, this.amount, {
        from: this.sender
      }, function(err, tx) {
	  console.log(tx);
      });
    },

    fetchBalance: function() {
      var output = [];
      addrs.forEach(function(addr) {
        var balance = Coin.balances(addr).toString();
        output.push({
          address: addr,
          balance: balance
        });
      });
      this.accounts = output;
    }
  },
  ready: function() {
    var self = this;
    this.fetchBalance();
    // 订阅以太坊的事件,监视新区块产生,并更新余额
    var filter = web3.eth.filter('latest');
    filter.watch(function(err, result) {
      var block = web3.eth.getBlock(result, true);
      self.blockNumber = block.number;
      self.fetchBalance();
    });
  }
});

var FROM = true;
var TO = false;

var log = new Vue({
  el: '#log',
  data: {
    addrs: addrs,
    side: FROM,
    logs: []
  },
  methods: {
    getLogs: function() {
      var self = this;
      var logs = [];
      var transferEvents;
      if (self.side == FROM) {
        transferEvents = Coin.Transfer({
          from: self.addr
        });
      } else {
        transferEvents = Coin.Transfer({
          to: self.addr
        });
      }
      transferEvents.get(function(err, events) {
        if (err) {
          console.log("failed to load events");
          return;
        }
        events.forEach(function(event) {
          logs.push(event.args.from + " send " + event.args.amount + " tokens to " + event.args.to);
        });
        self.logs = logs;
      });
    }
  },
  ready: function() {
    this.getLogs();
  }
});
