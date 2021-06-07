import React, { Component } from "react";
import ethLogo from "../eth-logo.png";

export default class BuyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      output: "0",
    };
  }
  render() {
    return (
      <form
        className="mb-3 mr-2 ml-2"
        onSubmit={(event) => {
          event.preventDefault();
          let etherAmount;
          etherAmount = this.input.value.toString();
          etherAmount = window.web3.utils.toWei(etherAmount, "ether");
          this.props.buyTokens(etherAmount);
        }}
      >
        <div>
          <label className="float-left">
            <b>Input</b>
          </label>
          <span className="float-right text-muted">
            Balance: {window.web3.utils.fromWei(this.props.ethBalance, "ether")}
          </span>
        </div>
        <div className="input-group mb-4">
          <input
            onChange={(event) => {
              const etherAmount = this.input.value.toString();
              this.setState({ output: etherAmount * 100 });
            }}
            ref={(input) => {
              this.input = input;
            }}
            type="text"
            className="form-control"
            placeholder="0"
            required
          />
          <div className="input-group-append">
            <div className="input-group-text">
              <img src={ethLogo} height="24" alt="" />
              &nbsp;&nbsp;&nbsp;ETH
            </div>
          </div>
        </div>
        <div>
          <label className="float-left">
            <b>Output</b>
          </label>
          <span className="float-right text-muted">
            Balance:{" "}
            {window.web3.utils.fromWei(this.props.tokenBalance, "ether")}
          </span>
        </div>
        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="0"
            value={this.state.output}
            disabled
          />
          <div className="input-group-append">
            <div className="input-group-text">
              <img
                src="https://image.flaticon.com/icons/png/512/732/732136.png"
                height="24"
                alt=""
              />{" "}
              &nbsp; Yaya
            </div>
          </div>
        </div>
        <div className="mb-5">
          <span className="float-left text-muted">Exchange Rate</span>
          <span className="float-right text-muted">1 Eth = 100 Yaya</span>
        </div>
        <button
          type="submit"
          className="btn  btn-block btn-lg shadow"
          style={{ backgroundColor: "#AFEEEE", color: "#000000" }}
        >
          Buy
        </button>
      </form>
    );
  }
}
