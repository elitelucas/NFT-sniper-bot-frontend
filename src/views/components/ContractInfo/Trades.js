import { connect } from "react-redux";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  Label,
  Table,
  Modal,
  TabContent,
  TabPane,
  NavItem,
  NavLink,
  Nav,
} from "reactstrap";
import Chart from "react-apexcharts";
const explorerURL = "https://etherscan.io/";

const Trades = (props) => {
  let { address, trades } = props;
  const [data, setData] = useState([]);
  const [series, setSeries] = useState([]);
  const [timeframe, setTimeFrame] = useState(10); //minutes
  const [isloading, setIsLoading] = useState(true);
  const notificationAlertRef = React.useRef(null);
  const notify = (message, type) => {
    let options = {};
    options = {
      place: "tr",
      message: message,
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  const { apiConfig, ApiCall, shortenWallet } = global;
  const handleChangeTimeFrame = (timeframe) => {
    console.log("timeframe", timeframe);
    setTimeFrame(timeframe);
  };
  //Using trades from API
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const payLoad = {
  //         address: address,
  //       };
  //       const response = await ApiCall(
  //         apiConfig.getTrades.url,
  //         apiConfig.getTrades.method,
  //         props.credential.loginToken,
  //         payLoad
  //       );
  //       if (response.status === 200) {
  //         setData((ele) => {
  //           ele = response.data.data;
  //           console.log(ele);
  //           return ele;
  //         });
  //         setIsLoading(false);
  //       } else {
  //         notify(response.data.message, "danger");
  //       }
  //     } catch (error) {
  //       notify("Failed in getting data.", "danger");
  //     }
  //   })();
  // }, [address]);

  // useEffect(() => {
  //   // const series = [
  //   //   {
  //   //     name: "SAMPLE A",
  //   //     data: [
  //   //       ["2022-06-15 02:26:35.000Z", 5.4],
  //   //       ["2022-06-15 03:26:35.000Z", 2],
  //   //       ["2022-06-15 04:26:35.000Z", 3],
  //   //     ],
  //   //   },
  //   // ];
  //   var chartdata = [];
  //   data.map((item, key) => {
  //     var gtTime = new Date().getTime() - timeframe * 60 * 60 * 1000;
  //     if (new Date(item.tradeAt).getTime() > gtTime)
  //       chartdata.push([item.tradeAt, item.price]);
  //   });
  //   console.log("chartdata", chartdata);
  //   setSeries([
  //     {
  //       name: "Prices",
  //       data: chartdata,
  //     },
  //   ]);
  // }, [data, timeframe]);

  //Using trades from Nerdtrades
  useEffect(() => {
    if (!trades.prices) return;
    var chartdata = [];
    var gtTime = new Date().getTime() - timeframe * 60 * 1000;
    console.log(gtTime);
    trades.prices.map((price, key) => {
      if (trades.timestamps[key] * 1000 > gtTime)
        chartdata.push([trades.timestamps[key] * 1000, price]);
    });
    console.log("chartdata", chartdata);
    setSeries([
      {
        name: "Prices",
        data: chartdata,
      },
    ]);
    setIsLoading(false);
  }, [trades, timeframe]);

  const options = {
    chart: {
      height: 350,
      type: "scatter",
      zoom: {
        type: "xy",
      },
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "white",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "white",
        },
      },
    },
    title: {
      // text: "Trades",
      align: "center",
      style: {
        fontSize: "25px",
        fontWeight: "bold",
        color: "white",
      },
    },
    markers: {
      size: 3,
      colors: ["#9e6fff"],
      strokeWidth: 0,
      onClick: function (e) {
        console.log(e);
      },
    },
    tooltip: {
      // enabled:false,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        return (
          '<div class="arrow_box" style="color:black">' +
          // `${data[dataPointIndex].tradeAt}<br/> Traded At ${data[dataPointIndex].price} ETH<br/>Token ID: ${data[dataPointIndex].tokenID}` +
          `${new Date(
            trades.timestamps[dataPointIndex] * 1000
          )}<br/> Traded At ${
            trades.prices[dataPointIndex]
          } ETH<br/>Token ID: ${trades.token_ids[dataPointIndex]}` +
          "</span>" +
          "</div>"
        );
      },
    },
  };

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>

      <div className="content">
        {isloading ? (
          <div style={{ textAlign: "center" }}>
            <p>please wait while loading....</p>
          </div>
        ) : (
          <>
            <ButtonGroup
              className="btn-group-toggle float-right"
              data-toggle="buttons"
            >
              <Button
                color="info"
                id="0"
                size="sm"
                tag="label"
                className={"btn-simple " + (timeframe == 10 ? "active" : "")}
                onClick={() => handleChangeTimeFrame(10)}
              >
                <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                  10m
                </span>
                <span className="d-block d-sm-none">
                  <i className="tim-icons icon-single-02" />
                </span>
              </Button>
              <Button
                color="info"
                id="0"
                size="sm"
                tag="label"
                className={"btn-simple " + (timeframe == 30 ? "active" : "")}
                onClick={() => handleChangeTimeFrame(30)}
              >
                <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                  30m
                </span>
                <span className="d-block d-sm-none">
                  <i className="tim-icons icon-single-02" />
                </span>
              </Button>
              <Button
                color="info"
                id="0"
                size="sm"
                tag="label"
                className={
                  "btn-simple " + (timeframe == 1 * 60 ? "active" : "")
                }
                onClick={() => handleChangeTimeFrame(1 * 60)}
              >
                <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                  1h
                </span>
                <span className="d-block d-sm-none">
                  <i className="tim-icons icon-single-02" />
                </span>
              </Button>
              <Button
                color="info"
                id="1"
                size="sm"
                tag="label"
                className={
                  "btn-simple " + (timeframe == 4 * 60 ? "active" : "")
                }
                onClick={() => handleChangeTimeFrame(4 * 60)}
              >
                <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                  4h
                </span>
                <span className="d-block d-sm-none">
                  <i className="tim-icons icon-gift-2" />
                </span>
              </Button>
              <Button
                color="info"
                id="2"
                size="sm"
                tag="label"
                className={
                  "btn-simple " + (timeframe == 24 * 60 ? "active" : "")
                }
                onClick={() => handleChangeTimeFrame(24 * 60)}
              >
                <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                  1d
                </span>
                <span className="d-block d-sm-none">
                  <i className="tim-icons icon-tap-02" />
                </span>
              </Button>
              <Button
                color="info"
                id="2"
                size="sm"
                tag="label"
                className={
                  "btn-simple " + (timeframe == 7 * 24 * 60 ? "active" : "")
                }
                onClick={() => handleChangeTimeFrame(7 * 24 * 60)}
              >
                <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                  7d
                </span>
                <span className="d-block d-sm-none">
                  <i className="tim-icons icon-tap-02" />
                </span>
              </Button>
            </ButtonGroup>
            <br />
            <br />
            <Chart
              options={options}
              series={series}
              type="scatter"
              height={400}
            />
          </>
        )}
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(Trades);
