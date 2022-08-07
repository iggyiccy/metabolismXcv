import {
  CSSProperties,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Slider from "react-slick";
import { Col, Row, Space } from "antd";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import isEmail from "validator/lib/isEmail";
import { News } from "./news/NewsItem";
import { Collection, NFT } from "./collection/interface";
import NewsItem from "./news/NewsItem";
import { Artist } from "./artists";
import { SimpleNFT } from "@/components/goods";
import classNames from "classnames";
import SquareDiv from "@/components/SquareDiv";
import { FormattedMessage } from "react-intl";
import { useConfig } from "@/hooks";
import Link from "next/link";
import Head from "next/head";
import { useResizeDetector } from "react-resize-detector";
import { TwitterCircleFilled } from "@ant-design/icons";
import { formatTwitterContent } from "@/utils";
import ReactSound, { ReactSoundProps } from "react-sound";
import { ICollectionTrack, useCollectionQuery } from "@spinamp/spinamp-hooks";

interface TitleProps {
  className?: string;
  children: ReactNode;
}

const Title: FC<TitleProps> = ({ className, children }) => (
  <div
    className={classNames(
      "font-main lg:text-5xl md:text-4xl text-3xl leading-snug lg:mt-32 mt-20 lg:mb-5 mb-2",
      className
    )}
  >
    {children}
  </div>
);

const Index = () => {
  const [email, setEmail] = useState("");
  const { width, ref } = useResizeDetector();
  const handleEnded = () => {
    videoSliderRef.current?.slickNext();
  };
  const videoSliderRef = useRef<Slider>(null);
  const [news, setNews] = useState<News[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [subscribe, setSubscribe] = useState(false);
  const [data, setData] = useState<any>();

  const loadData = useCallback(async () => {
    const homeRes = await axios.get("/api/v1/portal/video");
    setData(homeRes.data);
    const nftRes = await axios.get("/api/v1/portal/nft", {
      params: { page: 1, size: 9, feature: true },
    });
    if (nftRes.data && nftRes.data.list) {
      setNfts(nftRes.data.list);
    }
    const artistRes = await axios.get("/api/v1/portal/artist", {
      params: { page: 1, size: 1, isSpotlight: true },
    });
    if (artistRes.data && artistRes.data.list) {
      setArtists(artistRes.data.list);
    }
    const collectionRes = await axios.get("/api/v1/portal/collection/features");
    if (collectionRes.data && collectionRes.data) {
      setCollections(collectionRes.data);
    }
    const res = await axios.get("/api/v1/portal/news", {
      params: { page: 1, size: 10 },
    });
    if (res.data && res.data.list) {
      setNews(res.data.list);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubscribeClick = () => {
    const body = {
      email,
      type: "SUBSCRIBER",
    };
    fetch("https://api.culturevault.com/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
    setEmail("");
    setSubscribe(true);
  };

  const [style, setStyle] = useState<CSSProperties>();
  const { init, setInit } = useConfig();

  useEffect(() => {
    if (!init) {
      setTimeout(() => {
        setStyle({ animationName: "fadeOut" });
        setTimeout(() => {
          setInit(true);
        }, 2000);
      }, 6000);
    }
  }, [init, setInit]);

  const rand = useMemo(() => Math.random(), []);

  const playSlideVideo = () => {
    const video = (
      videoSliderRef.current as any
    )?.innerSlider.list.querySelector(".slick-active video");
    if (video) {
      video.currentTime = 0;
      video.play();
    }
  };

  const small = useMemo(() => width <= 640, [width]);

  const [soundStatus, setSoundStatus] =
    useState<ReactSoundProps["playStatus"]>("PLAYING");
  const toggle = () => {
    setSoundStatus((status: string) =>
      status === "STOPPED" ? "PLAYING" : "STOPPED"
    );
  };
  const { collection } = useCollectionQuery(
    "0x267aC7fda523066DA091a1A34826179B202f6081"
  );

  return (
    <div ref={ref} className="home">
      <Head>
        <link href="https://culturevault.com/" rel="canonical" />
      </Head>
      {process.env.NODE_ENV !== "development" && !init && (
        <div className="splash" style={style}>
          <picture>
            <source
              srcSet={`https://cdn.culturevault.com/static/images/splash/288.gif?r=${rand}`}
              media="(max-width: 576px)"
            />
            <source
              srcSet={`https://cdn.culturevault.com/static/images/splash/576.gif?r=${rand}`}
              media="(max-width: 864px)"
            />
            <source
              srcSet={`https://cdn.culturevault.com/static/images/splash/576.gif?r=${rand}`}
              media="(max-width: 1440px)"
            />
            <source
              srcSet={`https://cdn.culturevault.com/static/images/splash/576.gif?r=${rand}`}
              media="(max-width: 3880px)"
            />
            <img
              src={`https://cdn.culturevault.com/static/images/splash/576.gif?r=${rand}`}
              alt="splash"
            />
          </picture>
        </div>
      )}
      {data && (
        <Slider
          ref={videoSliderRef}
          // onInit={() => {
          //   setTimeout(() => {
          //     playSlideVideo();
          //   }, 0);
          // }}
          afterChange={() => {
            playSlideVideo();
          }}
          infinite
          dots
          arrows={false}
          className="slide"
        >
          {data.list.map((item: any) => (
            <div className="slide-item" key={item.videoID}>
              <div className="absolute w-full bottom-32 z-50 text-white">
                <div className="grid grid-cols-8">
                  <div className="container mx-auto col-start-2 col-end-6">
                    <div className="hover:text-black duration-500">
                      <div className="font-main text-3xl">{item.nftTitle}</div>
                      <div className="font-main text-6xl pb-1">
                        {item.collection}
                      </div>
                      <div className="font-main text-2xl pb-10 whitespace-pre-line">
                        {item.description}
                      </div>
                    </div>
                    <a
                      className="text-white text-lg hover:text-black duration-500"
                      href={item.nftUrl}
                    >
                      <FormattedMessage
                        id="home.view"
                        defaultMessage="View now&gt;"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <video
                muted
                autoPlay
                controls={false}
                playsInline
                onEnded={handleEnded}
                poster={item.videoUrl}
                controlsList="nodownload"
                preload="metadata"
              >
                <source src={item.videoUrl} type="video/mp4" />
              </video>
            </div>
          ))}
        </Slider>
      )}
      <div className="container mx-auto px-2 overflow-x-hidden">
        {collection.map((track) => (
          <ReactSound
            key={track.id}
            url={track.lossyAudioUrl}
            playStatus={soundStatus}
            autoLoad={false}
            loop={true}
          />
        ))}
        <div
          className="bottom-0 left-0 absolute px-5 py-5 z-500"
          onClick={toggle}
        >
          <img
            src="https://storageapi.fleek.co/iggyiccy-team-bucket/metabolismcv/icon_sound.png"
            alt="music"
          />
        </div>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Title className="lg:py-32 py-26">{data?.banner}</Title>
            <Title>NEW COLLECTIONS</Title>
            {width && (
              <Slider
                className="collection-slider"
                dots
                infinite
                speed={500}
                slidesToShow={small ? 1 : 3}
                arrows={!small}
                prevArrow={<img src="./images/left.png" alt="left" id="left" />}
                nextArrow={
                  <img src="./images/right.png" alt="right" id="right" />
                }
              >
                {collections.map((item) => (
                  <Link
                    key={item.collectionID}
                    href={`/collection/${item.collectionID}`}
                  >
                    <a className="block px-1 md:px-4">
                      <div className="aspect-square mb-4">
                        <img
                          className="w-full h-full"
                          src={item.image}
                          alt={item.title}
                        />
                      </div>
                      <div className="flex items-center">
                        <div className="font-main text-xl md:text-2xl flex-1 truncate">
                          {item.artists.map((p) => p.name).join(" X ")}
                        </div>
                        <div>Items: {item.countItems}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="font-main text-2xl md:text-3xl flex-1 truncate">
                          {item.title}
                        </div>
                        <div>Floor: {item.floorPrice}</div>
                      </div>
                    </a>
                  </Link>
                ))}
              </Slider>
            )}
          </div>
          <div>
            <Title>
              <FormattedMessage
                id="home.trending"
                defaultMessage="FEATURED WORKS"
              />
            </Title>
            <Row gutter={[{ xl: 80, md: 40, sm: 0 }, 40]}>
              {nfts.map((item) => (
                <Col
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  lg={{ span: 8 }}
                  key={item.nftID}
                >
                  <SimpleNFT {...item} />
                </Col>
              ))}
            </Row>
          </div>
          <div className="spotlight">
            <Title>
              <FormattedMessage
                id="home.spotlight"
                defaultMessage="Artist Spotlight"
              />
            </Title>
            {artists.map((item) => (
              <Row
                gutter={[{ lg: 60, xs: 0 }, 60]}
                className="spotlight-item"
                key={item.artistID}
              >
                <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                  <SquareDiv>
                    <Link href={"/artists/" + item.artistID} passHref>
                      <img src={item.image} alt="logo" />
                    </Link>
                  </SquareDiv>
                </Col>
                <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                  <div className="spotlight-item-right mb-10 lg:mb-7 lg:-mt-0 -mt-8">
                    <div className="flex items-center pb-5">
                      <Link href={"/artists/" + item.artistID}>
                        <a className="flex-1 font-main text-3xl lg:text-5xl leading-none">
                          {item.name}
                        </a>
                      </Link>
                      <a
                        target="_blank"
                        href={`https://twitter.com/intent/tweet?text=${formatTwitterContent(
                          item.name
                        )} dropping work on &url=${origin}/artists/${
                          item.artistID
                        }&hashtags=culturevault`}
                        rel="noreferrer"
                      >
                        <TwitterCircleFilled className="text-2xl mb-1 lg:text-3xl leading-[0] lg:leading-[0]" />
                      </a>
                    </div>
                    <div className="spotlight-item-description break-before-all whitespace-pre-line scrollbar-hide text-justify">
                      {item.description}
                    </div>
                  </div>
                </Col>
              </Row>
            ))}
          </div>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Title>
              <Link href={"/news"}>
                <a>
                  <FormattedMessage id="home.news" defaultMessage="NEWS" />
                </a>
              </Link>
            </Title>
            <div className="flex overflow-x-auto w-full">
              {news.map((item) => (
                <div key={item.newsID} className="lg:mr-28 mr-12">
                  <NewsItem {...item} />
                </div>
              ))}
            </div>
          </Space>
        </Space>
        <Row gutter={[48, 48]}>
          <Col span={12}>
            <div className="subscribe">
              <div className="font-main text-5xl leading-snug mb-10 text-center">
                <FormattedMessage
                  id="home.subscribe"
                  defaultMessage="
            NEVER MISS A DROP"
                />
              </div>
              <div className="subscribe-description text-center">
                <FormattedMessage
                  id="home.subscribe.details"
                  defaultMessage="
            Subscribe to our newsletter and keep up to date with the latest
            Culture Vault drops, collaborations and curations."
                />
              </div>
              <div className="subscribe-input mx-auto font-main w-full text-2xl leading-none h-14 lg:h-20 lg:w-2/3 lg:text-4xl">
                <input
                  value={email}
                  placeholder={subscribe ? "SUBMITTED" : "ENTER EMAIL"}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-3 lg:pl-8"
                />
                <button
                  className="lg:px-9 px-5"
                  onClick={handleSubscribeClick}
                  disabled={!isEmail(email)}
                >
                  SUBSCRIBE
                </button>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <iframe
              data-src="https://app.spinamp.xyz/embed/playlist/374XuYKl0huuv8WDPxns"
              scrolling="no"
              allow="autoplay;fullscreen; web-share"
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-presentation"
              src="https://app.spinamp.xyz/embed/playlist/374XuYKl0huuv8WDPxns"
              className="py-24 mx-auto h-full"
            ></iframe>
          </Col>
        </Row>
      </div>
    </div>
  );
};

// Index.getInitialProps = async (ctx) => {
//   const res = await axios.get('/api/v1/portal/video');
//   console.log(res);
//   // return { stars: json.stargazers_count };
//   return {};
// };

export default Index;
