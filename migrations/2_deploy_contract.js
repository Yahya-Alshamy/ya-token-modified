const MyToken = artifacts.require("MyToken");
const MyTokenSale = artifacts.require("MyTokenSale");

module.exports = async function (deployer) {
  await deployer.deploy(
    
    MyToken,
    
    "Yaya Token",
    
    "yaya",
    
    "1000000000000000000000000"
  
  );
  const token = await MyToken.deployed();
  await deployer.deploy(MyTokenSale, token.address);
  const tokenSale = await MyTokenSale.deployed();
  token.transfer(tokenSale.address, "750000000000000000000000");
};
