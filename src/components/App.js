/* eslint-disable getter-return */
import React, { Component } from "react";
import Web3 from "web3";
import MyToken from "../abis/MyToken.json";
import MyTokenSale from "../abis/MyTokenSale.json";
import Navbar from "./Navbar";
import Main from "./Main";

export default class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });
    // load token
    const networkId = await web3.eth.net.getId();
    const tokenData = MyToken.networks[networkId];
    if (tokenData) {
      const token = new web3.eth.Contract(MyToken.abi, tokenData.address);
      this.setState({ token });
      const tokenBalance = await token.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ tokenBalance: tokenBalance.toString() });
    } else {
      window.alert(
        "Token contract not deployed to detected network, you should try Ropsten Test Network"
      );
    }
    // load token sale
    const tokenSaleData = MyTokenSale.networks[networkId];
    if (tokenSaleData) {
      const tokenSale = new web3.eth.Contract(
        MyTokenSale.abi,
        tokenSaleData.address
      );
      this.setState({ tokenSale });
    } else {
      window.alert(
        "Token contract not deployed to detected network, you should try Ropsten Test Network"
      );
    }
    this.setState({ loading: false });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-ethereum browser detected. you should consider trying Metamask!"
      );
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true });
    this.state.tokenSale.methods
      .buyTokens()
      .send({ value: etherAmount, from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };
  sellTokens = (tokenAmount) => {
    this.setState({ loading: true });
    this.state.token.methods
      .approve(this.state.tokenSale.address, tokenAmount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.state.tokenSale.methods
          .sellTokens(tokenAmount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      ethBalance: "0",
      tokenBalance: "0",
      token: {},
      tokenSale: {},
      loading: true,
    };
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading
        </p>
      );
    } else {
      content = (
        <Main
          tokenBalance={this.state.tokenBalance}
          ethBalance={this.state.ethBalance}
          sellTokens={this.sellTokens}
          buyTokens={this.buyTokens}
        />
      );
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
