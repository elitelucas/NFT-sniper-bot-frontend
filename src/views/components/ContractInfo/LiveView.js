import { connect } from "react-redux";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import ReactTimeAgo from "react-time-ago";
import { LazyLoadImage } from "react-lazy-load-image-component";
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
  Collapse,
  Modal,
  TabContent,
  TabPane,
  NavItem,
  NavLink,
  Nav,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import Chart from "react-apexcharts";
const explorerURL = "https://etherscan.io/";

const LiveView = (props) => {
  let { address } = props;
  const [bookData, setBookData] = useState({});
  const [bookDataIndexes, setBookDataIndexes] = useState([]);
  const [tradeData, setTradeData] = useState({});
  const [inputs, setInputs] = useState({});
  const [buySetting, setBuySetting] = useState({});
  const [buySaved, setBuySaved] = useState(false);
  const [buyDone, setBuyDone] = useState(false);
  const [boughtID, setBoughtID] = useState(0);
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

  const [modalShow, setModalShow] = useState(false);
  const [modalData, setModalData] = useState({});

  //get data
  useEffect(() => {
    (async () => {
      await loadData();
      setInterval(async () => {
        await loadData();
      }, 120 * 1000);
    })();
  }, [address]);

  let loadData = async () => {
    //get books
    try {
      const payLoad = {
        address: address,
      };
      const response = await ApiCall(
        apiConfig.getNerdBooks.url,
        apiConfig.getNerdBooks.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        var bookData = response.data;
        setBookData(bookData);
        var bookDataIndexes = getSortedIndexes(bookData.timestamps);
        setBookDataIndexes(bookDataIndexes);
        setIsLoading(false);
      } else {
        notify(response.data.message, "danger");
      }
    } catch (error) {
      notify("Failed in getting data.", "danger");
    }
    //get trades
    try {
      const payLoad = {
        address: address,
      };
      const response = await ApiCall(
        apiConfig.getNerdTrades.url,
        apiConfig.getNerdTrades.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        setTradeData(response.data);

        setIsLoading(false);
      } else {
        notify(response.data.message, "danger");
      }
    } catch (error) {
      notify("Failed in getting data.", "danger");
    }
  };

  const getSortedIndexes = (arr) => {
    var test = arr;
    var test_with_index = [];
    for (var i in test) {
      test_with_index.push([test[i], i]);
    }
    test_with_index.sort(function (left, right) {
      return left[0] > right[0] ? -1 : 1;
    });
    var indexes = [];
    test = [];
    for (var j in test_with_index) {
      test.push(test_with_index[j][0]);
      indexes.push(test_with_index[j][1]);
    }
    return indexes;
  };

  useEffect(() => {
    console.log(1, buySaved);
    if (!buySaved) return; //have to set trigger
    console.log(2);
    for (var i = 0; i < bookDataIndexes.length; i++) {
      var index = bookDataIndexes[i];
      if (
        bookData.listing_time[index] * 1000 <
        new Date().getTime() - 3 * 60 * 60 * 1000 // 3 hours ago
      )
        continue;
      //filter buy setting
      if (
        (buySetting.idmin &&
          Number(bookData.token_ids[index]) < Number(buySetting.idmin)) ||
        (buySetting.idmax &&
          Number(bookData.token_ids[index]) > Number(buySetting.idmax)) ||
        (buySetting.pricemin &&
          Number(bookData.prices[index]) < Number(buySetting.pricemin)) ||
        (buySetting.pricemax &&
          Number(bookData.prices[index]) > Number(buySetting.pricemax))
      )
        continue;
      console.log(3);
      alert(bookData.token_ids[index]);
      setBoughtID(bookData.token_ids[index]);
      setBuyDone(true);
      setBuySaved(false);
      break;
    }
  }, [buySaved, bookDataIndexes]);

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
            <div className="d-flex px-2">
              <h5>Feed is live</h5>
              <div
                className="led-green mx-2"
                style={{ marginTop: "2px" }}
              ></div>
            </div>
            <h4 className="mt-2 px-2">Auto-buy</h4>
            {buyDone ? (
              <p className="mt-2 px-2">
                Bot bought target NFT token automatcially. #{boughtID}
              </p>
            ) : (
              <Row className="px-2">
                <Col md="3">
                  <Row>
                    <Col>
                      <label>Price Min</label>
                      <FormGroup>
                        <Input
                          type="number"
                          min="0"
                          value={inputs.pricemin}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              pricemin: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <label>Price Max</label>
                      <FormGroup>
                        <Input
                          type="number"
                          min="0"
                          value={inputs.pricemax}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              pricemax: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Col>
                <Col md="3">
                  <Row>
                    <Col>
                      <label>TokenID Min</label>
                      <FormGroup>
                        <Input
                          type="number"
                          min="0"
                          value={inputs.idmin}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              idmin: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <label>TokenID Max</label>
                      <FormGroup>
                        <Input
                          type="number"
                          min="0"
                          value={inputs.idmax}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              idmax: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Col>
                <Col md="6">
                  <Button
                    className="mt-4"
                    color="info"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Bot will buy filtered token automatically. Do you confirm?"
                        ) == true
                      ) {
                        setBuySetting(inputs);
                        setBuySaved(true);
                      }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    className="mt-4"
                    color="warning"
                    onClick={() => {
                      setBuySaved(false);
                    }}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            )}

            {buySaved && (
              <p>
                (Auto buy will trigger with these setting) <br />
                {buySetting.pricemin && (
                  <>&emsp;Price Min:{buySetting.pricemin} </>
                )}
                {buySetting.pricemax && (
                  <>&emsp;Price Max:{buySetting.pricemax} </>
                )}
                {buySetting.idmin && <>&emsp;ID Min:{buySetting.idmin} </>}
                {buySetting.idmax && <>&emsp;ID Max:{buySetting.idmax} </>}
              </p>
            )}

            <Row className="mt-4 px-2">
              {/* book data */}
              <Col md="6">
                <h4>LISTINGS</h4>
                <div
                  className="px-3"
                  style={{ height: "700px", overflow: "auto" }}
                >
                  {bookDataIndexes.map((index, key) => {
                    if (
                      bookData.listing_time[index] * 1000 <
                      new Date().getTime() - 3 * 60 * 60 * 1000 // 3 hours ago
                    )
                      return;
                    //filter buy setting
                    if (
                      (buySetting.idmin &&
                        Number(bookData.token_ids[index]) <
                          Number(buySetting.idmin)) ||
                      (buySetting.idmax &&
                        Number(bookData.token_ids[index]) >
                          Number(buySetting.idmax)) ||
                      (buySetting.pricemin &&
                        Number(bookData.prices[index]) <
                          Number(buySetting.pricemin)) ||
                      (buySetting.pricemax &&
                        Number(bookData.prices[index]) >
                          Number(buySetting.pricemax))
                    )
                      return;

                    return (
                      <Row
                        className="mt-1 py-2"
                        key={key}
                        style={{
                          backgroundColor: "#1a1b2a",
                          borderRadius: "7px",
                        }}
                      >
                        <Col sm="6">
                          <div className="d-flex">
                            <LazyLoadImage
                              src={`https://img.nftnerds.ai/${address}_${bookData.token_ids[index]}_96x96`}
                              width="48"
                              height="48"
                              style={{
                                objectFit: "contain",
                                borderRadius: "4px",
                                display: "block",
                              }}
                            />
                            <div className="mt-3 mx-2">
                              <h6>#{bookData.token_ids[index]}</h6>
                            </div>
                          </div>
                        </Col>
                        <Col sm="6">
                          <div className="pull-right">
                            <div className="d-flex justify-content-end">
                              <h6 className="mt-3">
                                Ξ {bookData.prices[index]}
                              </h6>
                              <Button
                                style={{
                                  marginLeft: "8px",
                                  padding: "4px",
                                  height: "30px",
                                }}
                                color="info"
                                size="sm"
                              >
                                BUY
                              </Button>
                            </div>
                            <small>
                              {bookData.listing_time[index] && (
                                <ReactTimeAgo
                                  date={
                                    new Date(
                                      bookData.listing_time[index] * 1000
                                    )
                                  }
                                  locale="en-US"
                                />
                              )}
                            </small>
                          </div>
                        </Col>
                      </Row>
                    );
                  })}
                </div>
              </Col>
              {/* trade data */}
              <Col md="6">
                <h4>Trades</h4>
                <div
                  className="px-3"
                  style={{ height: "700px", overflow: "auto" }}
                >
                  {tradeData.token_ids &&
                    tradeData.token_ids.map((token_id, key) => {
                      if (
                        tradeData.timestamps[key] * 1000 <
                        new Date().getTime() - 24 * 60 * 60 * 1000 // 24 hours ago
                      )
                        return;
                      return (
                        <Row
                          className="mt-1 py-2"
                          key={key}
                          style={{
                            backgroundColor: "#1a1b2a",
                            borderRadius: "7px",
                          }}
                        >
                          <Col sm="6">
                            <div className="d-flex">
                              <LazyLoadImage
                                src={`https://img.nftnerds.ai/${address}_${token_id}_96x96`}
                                width="48"
                                height="48"
                                style={{
                                  objectFit: "contain",
                                  borderRadius: "4px",
                                  display: "block",
                                }}
                              />
                              <div className="mt-3 mx-2">
                                <h6>#{token_id}</h6>
                              </div>
                            </div>
                          </Col>
                          <Col sm="6">
                            <div className="pull-right">
                              <h6 style={{ textAlign: "right" }}>
                                Ξ {tradeData.prices[key]}
                              </h6>
                              <small>
                                {tradeData.timestamps[key] && (
                                  <ReactTimeAgo
                                    date={
                                      new Date(tradeData.timestamps[key] * 1000)
                                    }
                                    locale="en-US"
                                  />
                                )}
                              </small>
                            </div>
                          </Col>
                        </Row>
                      );
                    })}
                </div>
              </Col>
            </Row>
          </>
        )}
      </div>

      {/* setting modal */}
      <Modal modalClassName="modal-black" isOpen={modalShow} size="lg">
        <div className="modal-header">
          <h4>Token Details</h4>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => setModalShow(false)}
          >
            <i className="tim-icons icon-simple-remove" />
          </button>
        </div>
        <div className="modal-body"></div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(LiveView);
