import React, { useState, useEffect, useLayoutEffect } from "react";
import _ from "lodash";
import logo from "./images/logo.png";
import logomb from "./images/logomb.png";
import avatar from "./images/avatar.png";
import vector from "./images/vector.png";
import ICBC from "./images/ICBC.png";
import icon1 from "./images/icon1.png";
import icon2 from "./images/icon2.png";
import icon3 from "./images/icon3.png";
import icon4 from "./images/icon4.png";
import footerImg from "./images/footer-img.png";
import title from "./images/title.png";
import "./App.scss";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { buildChart } from "./utils/chartUtils";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import heroine from "./images/heroine.png";
import axios from "axios";

import Carousel, { Modal, ModalGateway } from "react-images";

import {
  AVAILABLE_PROVINCES,
  AVAILABLE_COUNTIES,
  AVAILABLE_CITIES
} from "./common/contants";

const moment = require("moment");

am4core.useTheme(am4themes_animated);

const {
  REACT_APP_JINSHUJU_API_KEY,
  REACT_APP_JINSHUJU_API_SECRET,
  REACT_APP_JINSHUJU_API_FOREIGN_KEY,
  REACT_APP_JINSHUJU_API_FOREIGN_SECRET,
  REACT_APP_DOMESTIC_TOKEN,
  REACT_APP_FOREIGN_TOKEN,
  REACT_APP_VOLUNTEER_TOKEN,
  REACT_APP_DONATOR_TOKEN,
  REACT_APP_SPONSER_TOKEN,
  REACT_APP_HIGHLIGHT_TOKEN
} = process.env;
const API_BASE = "https://jinshuju.net/api/v1";
const DOMESTIC_ENDPOINT = `/forms/${REACT_APP_DOMESTIC_TOKEN}/entries`;
const FOREIGN_ENDPOINT = `/forms/${REACT_APP_FOREIGN_TOKEN}/entries`;
const VOLUNTEER_ENDPOINT = `/forms/${REACT_APP_VOLUNTEER_TOKEN}/entries`;
const DONATOR_ENDPOINT = `/forms/${REACT_APP_DONATOR_TOKEN}/entries`;
const SPONSER_ENDPOINT = `/forms/${REACT_APP_SPONSER_TOKEN}/entries`;
const HIGHLIGHT_ENDPOINT = `/forms/${REACT_APP_HIGHLIGHT_TOKEN}/entries`;
const DOMESTIC_FORM_LINK = `https://jinshuju.net/f/${REACT_APP_DOMESTIC_TOKEN}`;
const FOREIGN_FORM_LINK = `https://jinshuju.net/f/${REACT_APP_FOREIGN_TOKEN}`;
const VOLUNTEER_FORM_LINK = `https://jinshuju.net/f/${REACT_APP_VOLUNTEER_TOKEN}`;
const SPONSER_FORM_LINK = `https://jinshuju.net/f/${REACT_APP_SPONSER_TOKEN}`;
const DONATOR_FORM_LINK = `https://jinshuju.net/f/${REACT_APP_DONATOR_TOKEN}`;

// TODO: workaround
const TEMP_ENDPOINT = "/forms/Ukw1aQ/entries";

const App = () => {
  const [chart, setChart] = useState();
  const [maskCount, setMaskCount] = useState(0);
  const [money, setMoney] = useState(0);
  const [helpCount, setHelpCount] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [domesticData, setDomesticData] = useState([]);
  const [foreignData, setForeignData] = useState([]);
  const [volunteerData, setVolunteerData] = useState([]);
  const [donatorData, setDonatorData] = useState([]);
  const [sponserData, setSponserData] = useState([]);
  const [highlightData, setHighLightData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [supportInfoList, setSupportInfoList] = useState([]);

  const toggleModal = index => {
    setModalIsOpen(!modalIsOpen);
    setSelectedIndex(index);
  };

  const delta = 6;
  let startX;
  let startY;
  let drag = false;
  const handleTouchStart = event => {
    drag = false;
    startX = event.pageX;
    startY = event.pageY;
  };

  const handleTouchMove = event => {
    drag = true;
  };

  const handleTouchEnd = (event, index) => {
    const diffX = Math.abs(event.pageX - startX);
    const diffY = Math.abs(event.pageY - startY);
    if (diffX < delta && diffY < delta) {
      toggleModal(index);
    }
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    initialSlide: 0,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  useLayoutEffect(() => {
    if (
      domesticData.length > 0 &&
      foreignData.length > 0 &&
      volunteerData.length > 0
    ) {
      const chart = am4core.create("chartdiv", am4maps.MapChart);
      buildChart(chart, domesticData, foreignData, volunteerData);
      setChart(chart);
    }
    return () => {
      chart && chart.dispose();
    };
  }, [domesticData, foreignData, volunteerData]);

  useEffect(() => {
    const authObj = {
      auth: {
        username: REACT_APP_JINSHUJU_API_KEY,
        password: REACT_APP_JINSHUJU_API_SECRET
      }
    };

    axios
      .get(`${API_BASE}${DOMESTIC_ENDPOINT}`, { ...authObj })
      .then(response => {
        const { data } = response.data;
        setDomesticData(data);
        setMaskCount(
          data.reduce((total, currentValue) => {
            // field_10 means masks
            return total + currentValue["field_10"];
          }, 0)
        );
      })
      .catch(error => console.log(error));

    axios
      .get(`${API_BASE}${FOREIGN_ENDPOINT}`, {
        auth: {
          username: REACT_APP_JINSHUJU_API_FOREIGN_KEY,
          password: REACT_APP_JINSHUJU_API_FOREIGN_SECRET
        }
      })
      .then(response => {
        const { data } = response.data;
        // setForeignData(data);
        // setHelpCount(data.length);

        // TODO: workaround to combine two api data into one
        let fData = data;
        let fCount = data.length;
        axios
          .get(`${API_BASE}${TEMP_ENDPOINT}`, {
            auth: {
              username: REACT_APP_JINSHUJU_API_KEY,
              password: REACT_APP_JINSHUJU_API_SECRET
            }
          })
          .then(response => {
            const { data } = response.data;
            // console.log("www", data);
            // console.log("fData", fData);
            // console.log("res", fData.concat(data));

            let res = fData.concat(data);
            // res = res.filter(r => !_.isEmpty(r.field_7));

            setForeignData(res);
            setHelpCount(fCount + data.length);

            setFilteredData(
              _.sampleSize(
                res.filter(r => !_.isEmpty(r.field_7)),
                3
              )
            );

            setInterval(() => {
              setFilteredData(
                _.sampleSize(
                  res.filter(r => !_.isEmpty(r.field_7)),
                  3
                )
              );
            }, 10000);
          })
          .catch(error => {
            setForeignData(fData);
            setHelpCount(fCount);
            // console.log(error);
          });
      })
      .catch(error => console.log(error));

    axios
      .get(`${API_BASE}${VOLUNTEER_ENDPOINT}`, { ...authObj })
      .then(response => {
        const { data } = response.data;
        setVolunteerData(data);
        setVolunteerCount(data.length);
      })
      .catch(error => console.log(error));

    axios
      .get(`${API_BASE}${DONATOR_ENDPOINT}`, { ...authObj })
      .then(response => {
        const { data } = response.data;
        setDonatorData(data.reverse());
        setMoney(
          data.reduce((total, currentValue) => {
            return total + currentValue["field_12"];
          }, 0)
        );
      })
      .catch(error => console.log(error));

    axios
      .get(`${API_BASE}${SPONSER_ENDPOINT}`, { ...authObj })
      .then(response => {
        const { data } = response.data;
        setSponserData(data);
      })
      .catch(error => console.log(error));

    axios
      .get(`${API_BASE}${HIGHLIGHT_ENDPOINT}`, { ...authObj })
      .then(response => {
        const { data } = response.data;
        setHighLightData(data);
      })
      .catch(error => console.log(error));
  }, []);

  // const supportInfoList = [];
  const list = [];
  donatorData.forEach(data => {
    list.push({
      name: data["field_1"],
      content: `捐赠了 ${data["field_12"]} 人民币`,
      createdAt: data["created_at"]
    });
  });

  domesticData.forEach(data => {
    list.push({
      name: data["field_1"],
      content: `捐赠了 ${data["field_5"][0]} ${data["field_10"]} 个`,
      createdAt: data["created_at"]
    });
  });

  list.sort(function(a, b) {
    a = new Date(a.createdAt);
    b = new Date(b.createdAt);
    return a > b ? -1 : a < b ? 1 : 0;
  });

  const volunteerList = volunteerData.map(data => (
    <div className="avatar">
      <img
        src={
          data["x_field_weixin_headimgurl"].replace("http://", "https://") ||
          avatar
        }
        alt="avatar"
      />
      <div className="overlay">
        <div className="text">{data["field_1"]}</div>
      </div>
    </div>
  ));

  const hightlightList = [];
  let images = [];
  highlightData.forEach((data, index) => {
    if (index % 4 === 0) {
      images = [
        <img style={{ opacity: 0 }} src="" alt="empty" />,
        <img style={{ opacity: 0 }} src="" alt="empty" />,
        <img style={{ opacity: 0 }} src="" alt="empty" />,
        <img style={{ opacity: 0 }} src="" alt="empty" />
      ];
    }
    images[index % 4] = (
      <div
        style={{
          backgroundImage: `url(${data["field_11"][0]})`,
          // width: "18vw",
          // height: "18vw",
          backgroundSize: "cover"
        }}
        className="carousel-img"
        src={data["field_11"][0]}
        alt="empty"
        onTouchStart={handleTouchStart}
        onMouseDown={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseMove={handleTouchMove}
        onTouchEnd={e => {
          handleTouchEnd(e, index);
        }}
        onMouseUp={e => {
          handleTouchEnd(e, index);
        }}
      ></div>
    );
    if (index % 4 === 3 || index === highlightData.length - 1) {
      hightlightList.unshift(
        <div key={`hl-${index}`} className="carousel-images">
          {images}
        </div>
      );
    }
  });

  const imageCa = highlightData.map(h => {
    return { source: h["field_11"][0] };
  });

  // console.log("ca", imageCa);

  return (
    <div className="app">
      <div
        className={`shareModal ${shareModalIsOpen ? "open" : ""}`}
        onClick={e => {
          document.body.classList.remove("modal-open");
          setShareModalIsOpen(false);
        }}
      >
        <div className="sharethis-inline-share-buttons"></div>
        <div className="share-mb">
          <p>请点击右上角</p>
          <p>将它发送给指定朋友</p>
          <p>或分享到朋友圈</p>
        </div>
      </div>
      <header className="header">
        <img src={logo} className="logo" alt="logo" />
        <img src={logomb} className="logo-mb" alt="logo" />
        <img src={title} className="title" alt="title" />
        <h1>海外的亲们，是时候让我们陪你们打下半场了！</h1>
        <div className="bar-mb"></div>
        <p>
          这场疫情，国内打下半场，国外打下半场，海外华人打全场。”这话于国内的我们而言是段子，于国外的你们是猝不及防的遭遇。
          在倾力支援国内之后，异国他乡的土地上的你们，除了对抗病毒本身，还要替我们承受“Chinese
          Virus”的污名乃至这背后的威胁、暴力。
        </p>
        <p className="second">
          这一切，国内的亲们，不会坐视。岂曰无衣，与子同袍！我们一起来打下半场。
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://eleduck.com/posts/6XNfOL"
          >
            点此查看我们正在做的>>>
          </a>
        </p>
        <div className="wrapper">
          <div className="tile">
            <div className="name">援助口罩</div>
            <div className="data">
              {/* {maskCount} */}
              {2000}
              <span className="unit">个</span>
            </div>
          </div>
          <div className="split"></div>
          <div className="tile">
            <div>收到捐款</div>
            <div className="data">
              <span>{money}</span>
              {/* <span>{5180}</span> */}
              <span className="unit">元</span>
            </div>
          </div>
          <div className="split"></div>
          <div className="tile">
            <div>援助华人家庭</div>
            <div className="data">
              {/* {helpCount} */}
              {200}
              <span className="unit">个</span>
            </div>
          </div>
          <div className="split"></div>
          <div className="tile">
            <div>志愿者</div>
            <div className="data">
              {volunteerCount}
              {/* {18} */}
              <span className="unit">人</span>
            </div>
          </div>
          <div className="split"></div>
          <div className="tile">
            <div>援助海外城市</div>
            <div className="data">
              <span>4</span>
              <span className="unit">个</span>
            </div>
          </div>
        </div>
        <img className="arrow" src={vector} alt="arrow"></img>
      </header>
      <div className="wrapper-mb">
        <h1>截止目前为止，我们已经</h1>
        <div className="tile">
          <div className="name">援助口罩</div>
          <div className="data">
            {2000}
            {/* {maskCount} */}
            <span className="unit">个</span>
          </div>
        </div>
        <div className="split"></div>
        <div className="tile">
          <div className="name">收到捐款</div>
          <div className="data">
            <span>{money}</span>
            {/* <span>{5180}</span> */}
            <span className="unit">元</span>
          </div>
        </div>
        <div className="split"></div>
        <div className="tile">
          <div className="name">援助华人家庭</div>
          <div className="data">
            {/* {helpCount} */}
            {200}
            <span className="unit">个</span>
          </div>
        </div>
        <div className="split"></div>
        <div className="tile">
          <div className="name">志愿者</div>
          <div className="data">
            {volunteerCount}
            <span className="unit">人</span>
          </div>
        </div>
        <div className="split"></div>
        <div className="tile">
          <div className="name">援助海外城市</div>
          <div className="data">
            <span>4</span>
            <span className="unit">个</span>
          </div>
        </div>
      </div>
      <section className="support">
        <h1>援助地图</h1>
        <p className="text">
          我们正在以城市为单位，接收海外华人的援助申请，同时在国内募集物资，实施援助。
        </p>
        <div id="chartdiv"></div>
        <div className="legend">
          <div className="marker">
            <div className="color color-1"></div>
            <div className="text">已援助</div>
          </div>
          <div className="marker">
            <div className="color color-2"></div>
            <div className="text">未援助</div>
          </div>
        </div>
        <div className="info">
          <div className="row-1">
            <div className="w60">
              <table className="info-table">
                {list.slice(0, 5).map(data => (
                  <tr>
                    <td>{data.name}</td>
                    <td>{data.content}</td>
                    <td>{moment(data.createdAt).format("YYYY年MM月DD日")}</td>
                    {/* <td>{data.createdAt}</td> */}
                  </tr>
                ))}
              </table>
              <a
                className="btn-mb"
                rel="noopener noreferrer"
                href="#helpus"
                type="button"
              >
                提供援助
              </a>
            </div>
            <div className="w40 dt support-column">
              <p>我们目前急需口罩和采购口罩的资金。多少不限，请勿坐视。</p>
              <a
                className="btn"
                rel="noopener noreferrer"
                href="#helpus"
                type="button"
              >
                提供援助
              </a>
            </div>
          </div>
          <div className="row-2">
            <div className="w40">
              <p>
                凡华人组织和个人都可以通过这里申请口罩援助，我们会认真对待每一条申请。
              </p>
              <a
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
                // href={FOREIGN_FORM_LINK}
                href={"https://jinshuju.net/f/sIDktA"}
                type="button"
              >
                申请援助
              </a>
            </div>
            <div className="align-right w60">
              {filteredData.map(data => (
                <div className="requester">
                  <div className="content">{data["field_7"]}</div>
                  <div className="requester-info">
                    <p>{`${data["field_11"]}`}</p>
                    <p>{`${AVAILABLE_COUNTIES[data["field_13"]].nameCN}-${
                      AVAILABLE_CITIES[data["field_15"]].nameCN
                    }`}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb">
              <p>
                凡华人组织和个人都可以通过这里申请口罩援助，我们会认真对待每一条申请。
              </p>
              <a
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
                // href={FOREIGN_FORM_LINK}
                href={"https://jinshuju.net/f/sIDktA"}
                type="button"
              >
                申请援助
              </a>
              <a
                className="btn-mb"
                target="_blank"
                rel="noopener noreferrer"
                // href={FOREIGN_FORM_LINK}
                href={"https://jinshuju.net/f/sIDktA"}
                type="button"
              >
                申请援助
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="highlights">
        <h1>爱的留声机</h1>
        <p className="text">这里，是我们随手记录的一些真实瞬间。</p>
        <Slider className="carousel-dt" {...carouselSettings}>
          {hightlightList}
        </Slider>
        <Slider className="carousel-mb" {...carouselSettings}>
          {highlightData.map((data, index) => (
            <div className="carousel-images">
              <div
                style={{
                  backgroundImage: `url(${data["field_11"][0]})`,
                  // width: "18vw",
                  // height: "18vw",
                  backgroundSize: "cover"
                }}
                className="carousel-img"
                src={data["field_11"][0]}
                alt="empty"
                onTouchStart={handleTouchStart}
                onMouseDown={handleTouchStart}
                onTouchMove={handleTouchMove}
                onMouseMove={handleTouchMove}
                onTouchEnd={e => {
                  handleTouchEnd(e, index);
                }}
                onMouseUp={e => {
                  handleTouchEnd(e, index);
                }}
              ></div>
            </div>
          ))}
        </Slider>
        <ModalGateway>
          {modalIsOpen ? (
            <Modal onClose={toggleModal}>
              <Carousel currentIndex={selectedIndex} views={imageCa} />
            </Modal>
          ) : null}
        </ModalGateway>
        <div className="volunteers">
          <div className="column left">
            <h2>默默付出着的志愿者们</h2>
            <p>
              坦诚的讲，做这样的公益太累了。如果没有这帮志愿者的陆续加入，我和@Char根本坚持不下来。
            </p>
            <p>要感谢的人太多，但我更想对这些同志们说——辛苦了！</p>
            <p>Respect!</p>
            <a
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
              href={VOLUNTEER_FORM_LINK}
              type="button"
            >
              加入我们
            </a>
          </div>
          <div className="column right">{volunteerList}</div>
          <a
            className="btn-mb"
            target="_blank"
            rel="noopener noreferrer"
            href={VOLUNTEER_FORM_LINK}
            type="button"
          >
            加入我们
          </a>
        </div>
      </section>
      <section className="sponsers">
        <h1>值得尊敬的伙伴们</h1>
        <p className="text">
          与子偕行，共赴国殇！这次行动中，以下这些无私有爱的合作伙伴们，也在发光发热。
        </p>
        <div>
          {sponserData.map(sponser => (
            <img className="sponser" src={sponser["field_11"][0]} alt="icbc" />
          ))}
        </div>
        <center>
          <span>
            我们的力量总归有限，真心的邀请其他公司/组织/品牌/等合作共建，帮助到更多的海外华人。
          </span>
          <a
            className="btn"
            target="_blank"
            rel="noopener noreferrer"
            href={SPONSER_FORM_LINK}
            type="button"
          >
            合作联系
          </a>
        </center>
      </section>

      <section className="helpus" id="helpus">
        <h1>希望您能这样帮助我们</h1>
        <p className="text">我们每个人的顺手贡献，都将漂洋过海，温暖人心</p>
        <div className="qrcodes">
          <div className="qrcode">
            <img src={icon1} alt="qrcode" />
            <p>不在多少，但求有心</p>
            <a
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
              href={DONATOR_FORM_LINK}
              type="button"
            >
              爱心捐赠
            </a>
          </div>
          <div className="qrcode">
            <img src={icon2} alt="qrcode" />
            <p>不在多少，但求有心</p>
            <a
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
              href={DOMESTIC_FORM_LINK}
              type="button"
            >
              爱心捐物
            </a>
          </div>
          <div className="qrcode">
            <img src={icon3} alt="qrcode" />
            <p>转发就是很好的支持</p>
            <button
              className="btn"
              onClick={() => {
                document.body.classList.add("modal-open");
                setShareModalIsOpen(true);
              }}
            >
              分享
            </button>
          </div>
          <div className="qrcode">
            <img src={icon4} alt="qrcode" />
            <p>如果你是开发者</p>
            <a
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/eleduck/maskhero"
              type="button"
            >
              参与开源
            </a>
          </div>
        </div>
      </section>
      <footer>
        <img src={footerImg} alt="footer" />
        <center>Eleduck.com With Love.</center>
      </footer>
    </div>
  );
};

export default App;
