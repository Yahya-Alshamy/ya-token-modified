/* eslint-disable no-undef */
const { assert, expect } = require("chai");

const MyToken = artifacts.require("MyToken");
const MyTokenSale = artifacts.require("MyTokenSale");

require("chai").use(require("chai-as-promised")).should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("MyToken",async function (accounts) {
    let token,tokenSale
    before(async()=>{
      token = await MyToken.new("Yaya Token","Yaya","1000000000000000000000000");
      tokenSale = await MyTokenSale.new(token.address);
      token.transfer(tokenSale.address, "750000000000000000000000");
    })
    describe("it initializes the contract with the correct data", ()=>{
      it("has the correct name",async()=>{
        let name= await token.name()
        assert.equal(name,"Yaya Token")
      })
      it("has the correct symbol",async ()=>{
        expect(await token.symbol()).to.be.equal("Yaya")
      })
      it("has 18 decimals",async ()=>{
        let decimals = await token.decimals()
        assert.equal(decimals.toString(),"18")
      })
      it("initiazlies the total supply",async ()=>{
        let totalSupply = await token.totalSupply()
        assert.equal(totalSupply.toString(),tokens("1000000"))
        let balance = await token.balanceOf(accounts[0]);
        assert.equal(balance.toString(), tokens("250000"));
        assert.equal((await token.balanceOf(tokenSale.address)).toString(),tokens("750000"));
      })
    })
    describe("it handles the transfer function properly",()=>{
      it("transfer returns a boolean", async function () {
        let success = await token.transfer.call(accounts[1], 250000, {
          from: accounts[0],
        });
        assert.equal(success, true, "it returns true");
      });
      it("rejects the transfer if the ballance is lower then the amount",async ()=>{
        await token.transfer.call(accounts[6],tokens("200"),{from:accounts[4]}).should.be.rejected
      })
      it("transfers the value",async ()=>{
        let reciept = await token.transfer(accounts[2],tokens("10000"),{from:accounts[0]})
        let adminBalance = await token.balanceOf(accounts[0])
        let investorBalance = await token.balanceOf(accounts[2])
        assert.equal(adminBalance.toString(),tokens("240000"),"deducts the amount")
        assert.equal(investorBalance.toString(),tokens("10000"),"adds the amount")
        assert.equal(await reciept.logs.length,1,"triggers one event")
        assert.equal(await reciept.logs[0].event,"Transfer","triggers a transfer event")
        assert.equal(
          await reciept.logs[0].args.from,
          accounts[0],
          "logs the accounts the tokens are transferred from"
        );
        assert.equal(await reciept.logs[0].args.to,accounts[2],"logs the account the tokens are transferred to")
        assert.equal(
          (await reciept.logs[0].args.value).toString(),
          tokens("10000"),
          "logs the transfer amount"
        );
      })
      it("approves token for delegated transfer",async()=>{
        let spender = accounts[1]
        let admin = accounts[0]
        assert.equal(
          await token.approve.call(accounts[1], 100,{from:accounts[0]}),
          true,
          "it returns true"
        );
        let reciept = await token.approve(spender,tokens("1000"),{from:admin})
        assert.equal(await reciept.logs.length,1,"triggers one event")
        assert.equal(await reciept.logs[0].event,"Approval","triggers an apporval event")
        assert.equal(await reciept.logs[0].args.owner,admin)
        assert.equal(await reciept.logs[0].args.spender,spender)
        assert.equal((await reciept.logs[0].args.value).toString(),tokens("1000"))
        let allowance = await token.allowance(admin,spender)
        assert.equal(allowance,tokens("1000"),"stores the allowance")
      })
      it("handles the delegated transfer",async ()=>{
        let fromAccount = accounts[3]
        let spenderAccount = accounts[4]
        let toAccount = accounts[5]
        await token.transfer(fromAccount,tokens("1000"),{from:accounts[0]})
        await token.approve(spenderAccount,tokens("100"),{from:fromAccount})
        // balance of from is higher than the amountn
        await token.transferFrom.call(fromAccount,toAccount,tokens("51650"),{from:spenderAccount}).should.be.rejected
        await token.transferFrom.call(fromAccount,toAccount,tokens("200"),{from:spenderAccount}).should.be.rejected
        assert.equal(
          await token.transferFrom.call(fromAccount, toAccount, tokens("50"), {
            from: spenderAccount,
          }),true
        );
        let reciept = await token.transferFrom(fromAccount,toAccount,tokens("50"),{from:spenderAccount})
        assert.equal(reciept.logs.length,2,"triggers one event")
        assert.equal(reciept.logs[0].event,"Transfer","triggers Transfer event")
        assert.equal(
          await reciept.logs[0].args.from,
          fromAccount,
          "logs the accounts the tokens are transferred from"
        );
        assert.equal(
          await reciept.logs[0].args.to,
          toAccount,
          "logs the account the tokens are transferred to"
        );
        assert.equal(
          (await reciept.logs[0].args.value).toString(),
          tokens("50"),
          "logs the transfer amount"
        );
        assert.equal(
          reciept.logs[1].event,
          "Approval",
          "triggers Approval event"
        );
        assert.equal(await reciept.logs[1].args.owner, fromAccount);
        assert.equal(await reciept.logs[1].args.spender, spenderAccount);
        assert.equal(
          (await reciept.logs[0].args.value).toString(),
          tokens("50")
        );
        let fromBalance = await token.balanceOf(fromAccount);
        let toBalance = await token.balanceOf(toAccount)
        assert.equal(
          fromBalance.toString(),
          tokens("950"),
          "deducts the amount from the sending account"
        );
        assert.equal(
          toBalance.toString(),
          tokens("50"),
          "adds the amount to the receiving account"
        );
        assert.equal(
          (await token.allowance(fromAccount, spenderAccount)).toString(),
          tokens("50"),
          "deducts the amount from the allowance"
        );
      })
    })
});
