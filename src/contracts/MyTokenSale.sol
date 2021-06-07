// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./MyToken.sol";

contract MyTokenSale {
    string public name = "Yaya Token Sale";
    MyToken public token;
    uint public rate = 100;

    event TokensPurchased (
        address buyer,
        address token,
        uint amount,
        uint rate
    );
    event TokensSold (
        address seller,
        address token,
        uint amount,
        uint rate
    );

    constructor(MyToken _token)public{
        token = _token;
    }
    
    function buyTokens() public payable {
        uint tokenAmount = msg.value *rate;
        require(token.balanceOf(address(this))>=tokenAmount);
        token.transfer(msg.sender,tokenAmount);
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }
    function sellTokens(uint tokenAmount) public {

        require(token.balanceOf(msg.sender)>= tokenAmount);
        
        uint etherAmount = tokenAmount / rate;

        token.transferFrom(msg.sender,address(this),tokenAmount);
        
        msg.sender.transfer(etherAmount);
        
        emit TokensSold(msg.sender,address(token),tokenAmount,rate);
    }
}