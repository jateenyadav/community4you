
import { ArrowLeftOutlined, ArrowRightOutlined } from "@material-ui/icons";
import { useState } from "react";
import styled from "styled-components";
// import { sliderItems, links } from "../data";
import { mobile } from "../responsive";
import * as React from 'react';
// import { Link } from "react-router-dom";
// import useMediaQuery from '@mui/material/useMediaQuery';


const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  ${mobile({ display: "none" })}
`;

const Arrow = styled.div`
  width: 50px;
  height: 50px;
  background-color: #fff7f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${(props) => props.direction === "left" && "10px"};
  right: ${(props) => props.direction === "right" && "10px"};
  margin: auto;
  cursor: pointer;
  opacity: 0.5;
  z-index: 2;
`;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  transition: all 1.5s ease;
  transform: translateX(${(props) => props.slideIndex * -100}vw);
`;

const Slide = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  background-color: #000000;
  z-index : -1;
`;
// ${(props) => props.bg}

const ImgContainer = styled.div`
  height: 80%;
  flex: 1;
  padding-left : 100px;
`;

const Image = styled.img`
  height: 80%;
`;

const InfoContainer = styled.div`
  flex: 1;
  color: white;
  padding: 50px;
`;

const Title = styled.h1`
  font-size: 70px;
`;

const Desc = styled.p`
  margin: 50px 0px;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 3px;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 20px;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  cursor: pointer;
`;
const Link = styled.a`
text-decoration: none;
color: white;
`;


// export default function SimpleMediaQuery() {
//   const matches = useMediaQuery('(min-width:600px)')
// }

const Slider = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const handleClick = (direction) => {
    if (direction === "left") {
      setSlideIndex(slideIndex > 0 ? slideIndex - 1 : 2);
    } else {
      setSlideIndex(slideIndex < 2 ? slideIndex + 1 : 0);
    }
  };
  return (
    <Container>
      <Arrow direction="left" onClick={() => handleClick("left")}>
        <ArrowLeftOutlined />
      </Arrow>
      <Wrapper slideIndex={slideIndex}>
      
        {/* {sliderItems.map((item) => ( */}
          <Slide>
          {/* bg={item.bg} key={item.id} */}
            <ImgContainer>
              <Image src="https://codess.cafe/images/banner.png" />
              {/* {item.img} */}
            </ImgContainer>
            <InfoContainer>
              <Title>
              CODESS Cafe
                {/* {item.title} */}
                </Title>
              <Desc>
                {/* {item.desc} */}
                Get the
                 opportunity to join in a community
                </Desc>
              <Button>
                <Link href="https://codess.cafe/" target="_blank">Details</Link></Button>
            </InfoContainer>
          </Slide>
        {/* ))} */}
        {/* {sliderItems.map((item) => ( */}
          <Slide>
          {/* bg={item.bg} key={item.id} */}
            <ImgContainer>
              <Image src={require("../components/learn_for_cause_lfc_logo.jpeg")} />
              {/* {item.img} */}
            </ImgContainer>
            <InfoContainer>
              <Title>
              Learn For Cause
                {/* {item.title} */}
                </Title>
              <Desc>
                {/* {item.desc} */}
                Code For Cause
                </Desc>
              <Button>
                <Link href="https://in.linkedin.com/company/learn-for-cause-lfc" target="_blank">Details</Link></Button>
            </InfoContainer>
          </Slide>
        {/* ))} */}
        {/* {sliderItems.map((item) => ( */}
          <Slide>
          {/* bg={item.bg} key={item.id} */}
            <ImgContainer>
              <Image src="https://cdn.hashnode.com/res/hashnode/image/upload/v1643230111752/uv4w72h8g.png" />
              {/* {item.img} */}
            </ImgContainer>
            <InfoContainer>
              <Title>
              HASHNODE
                {/* {item.title} */}
                </Title>
              <Desc>
                {/* {item.desc} */}
                Home for tech writters and leaders
                </Desc>
              <Button>
                <Link href="https://hashnode.com/" target = "_blank">Details</Link></Button>
            </InfoContainer>
          </Slide>
        {/* ))} */}
      </Wrapper>
      <Arrow direction="right" onClick={() => handleClick("right")}>
        <ArrowRightOutlined />
      </Arrow>
    </Container>
  );
};

export default Slider;
