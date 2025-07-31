import React, { useEffect } from "react";
import "./Cards.css";

export default function Cards(props) {
  useEffect(() => {
  }, []);

  return (
    <>
      <div className={`card cardCustom ${props.darkMode ? "dark-mode" : ""} ${props.transparent ? "transparent-card" : ""}`}>
        {props.imageSrc && (
          <img
            className="card-img-top cardCustomImg fillImg1"
            src={props.imageSrc}
            alt={props.imageAlt}
          />
        )}
        <div className="card-body">
          <h5
            className={`fs-5 card-title cardCustomTitle opacity-75 text-start lightText  ${
              props.darkMode ? "dark-mode" : ""
            }`}
          >
            {props.title}
          </h5>
          <p
            className={`fs-6 card-text opacity-75 cardCustomTitleChild lightText text-start ${
              props.darkMode ? "dark-mode" : ""
            }`}
          >
            {props.text}
          </p>
          {props.link && props.buttonText && (
            <a href={props.link} className="btn btn-primary">
              {props.buttonText}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
