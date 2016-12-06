pragma solidity ^0.4.4;

contract Coin {
  // 管理员地址
  address admin;

  // 用户的余额
  mapping (address => uint) public balances;

  // 创建合约时会执行一次的"构造"函数
  function Coin() {
    // 将合约创建者设为管理员
    admin  = msg.sender;
    balances[admin] = 5000;
  }

  // 允许管理员产生新的币
  event Mint(uint amount);
  function generate(uint amount) {
    // 拒绝来自非管理员的地址的交易
    if ( msg.sender!=admin ) {
      throw;
    }
    balances[admin] += amount;
    Mint(amount);
  }

  // 转账
  event Transfer(address indexed from, address indexed to, uint amount, bool success);
  function transfer(address receiver, uint amount) {
    // 检查余额
    if ( balances[msg.sender] >= amount ) {
      balances[msg.sender] -= amount;
      balances[receiver] += amount;
      Transfer(msg.sender, receiver, amount, true);
    } else {
      Transfer(msg.sender, receiver, amount, false);
    }
  }
}
