const { assert, AssertionError } = require("chai");

const MyToken = artifacts.require("MyToken");
const MyTokenSale = artifacts.require("MyTokenSale");

require("chai").use(require("chai-as-promised")).should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("MyTokenSale", async ([deployer, investor]) => {
  let token, tokenSale;
  before(async () => {
    token = await MyToken.new(
      "Yaya Token",
      "Yaya",
      "1000000000000000000000000"
    );
    tokenSale = await MyTokenSale.new(token.address);
    token.transfer(tokenSale.address, "750000000000000000000000");
  });
  describe("Token deployment", async () => {
    it("contract has a name", async () => {
      const name = await token.name();
      assert.equal(name, "Yaya Token");
    });
  });
  describe("EthSwap deployment", async () => {
    it("contract has a name", async () => {
      const name = await tokenSale.name();
      assert.equal(name, "Yaya Token Sale");
    });
    it("contract has the tokens", async () => {
      let balance = await token.balanceOf(tokenSale.address);
      assert.equal(balance.toString(), tokens("750000"));
    });
  });
  describe("buy tokens", async () => {
    let result;
    before(async () => {
      result = await tokenSale.buyTokens({
        from: investor,
        value: tokens("1"),
      });
    });
    it("allow to instantly buy tokens for a fixed price", async () => {
      //check investor token balance of tokens after purchase
      investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("100"));
      //check tokenSale Balance after purchase
      tokenSaleBalance = await token.balanceOf(tokenSale.address);
      assert.equal(
        tokenSaleBalance.toString(),
        tokens("750000") - tokens("100")
      );
      //check if the ether went to token sale contract balance
      tokenSaleEthBalance = await web3.eth.getBalance(tokenSale.address);
      assert.equal(
        tokenSaleEthBalance.toString(),
        web3.utils.toWei("1", "ether")
      );
      const event = result.logs[0].args;
      assert.equal(result.logs.length, 1, "triggers one event");
      assert.equal(
        result.logs[0].event,
        "TokensPurchased",
        "triggers Tokens Purchased event"
      );
      assert.equal(event.buyer, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100"));
      assert.equal(event.rate.toString(), "100");
    });
  });
  describe("sell tokens", async () => {
    let result;
    before(async () => {
      await token.approve(tokenSale.address, tokens("100"), { from: investor });
      result = await tokenSale.sellTokens(tokens("100"), { from: investor });
    });
    it("allows to sell tokens instantly for a fixed price", async () => {
      // check investor balance after sale
      let sellerBalance = await token.balanceOf(investor);
      assert.equal(sellerBalance.toString(), tokens("0"));
      let tokenSaleBalance = await token.balanceOf(tokenSale.address);
      assert.equal(tokenSaleBalance.toString(), tokens("750000"));
      tokenSaleEthBalance = await web3.eth.getBalance(tokenSale.address);
      assert.equal(
        tokenSaleEthBalance.toString(),
        web3.utils.toWei("0", "ether")
      );
      // check the Tokens Sold event was emitted
      const event = result.logs[0].args;
      assert.equal(result.logs.length, 1, "triggers one event");
      assert.equal(
        result.logs[0].event,
        "TokensSold",
        "triggers Tokens Sold event"
      );
      assert.equal(event.seller, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100"));
      assert.equal(event.rate.toString(), "100");

      // Failure : investor cant sell more tokens than they have
      await tokenSale.sellTokens(tokens("500"), { from: investor }).should.be
        .rejected;
    });
  });
});
