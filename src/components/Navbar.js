import React, { Component } from "react";
import Identicon from "identicon.js";

export default class Navbar extends Component {
  render() {
    return (
      <nav
        className="navbar fixed-top flex-md-nowrap shadow"
        style={{ backgroundColor: "#2F4F4F" }}
      >
        <a
          className="navbar-brand"
          style={{ color: "#D3D3D3" }}
          href="https://github.com/Yahya-Alshamy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Yaya Token Sale
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-secondary">
              <small
                id="account"
                style={{ color: "#D3D3D3", fontFamily: "Arial" }}
              >
                {this.props.account}
              </small>
            </small>
            {this.props.account ? (
              <img
                className="ml-2"
                width="30"
                height="30"
                src={`data:image/png;base64,${new Identicon(
                  this.props.account,
                  30
                ).toString()}`}
                alt=""
              />
            ) : (
              <span></span>
            )}
          </li>
        </ul>
      </nav>
    );
  }
}
