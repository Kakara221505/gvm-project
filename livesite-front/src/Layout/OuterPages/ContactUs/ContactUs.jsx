import React from "react";
import "../../OuterPages/OuterPages.css";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import contactusVec from "../../../Assets/Images/contactusVector.png";
import logo from "../../../Assets/Images/Logo.png";
import call from "../../../Assets/Images/call.png";
import mail from "../../../Assets/Images/mail-01.png";
import location from "../../../Assets/Images/location-01.png";
import fb from '../../../Assets/Images/facebook.png'
import tw from '../../../Assets/Images/twitter.png'
import yt from '../../../Assets/Images/youtube.png'



export default function ContactUs() {
  return (
    <>
      <section className="contactussection p-5 py-4">
        <div className="row">
          <div className="col-lg-12">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex flex-column">
                <h3 className="text-start menuTextHeader">Contact Us</h3>
                <small className="text-secondary d-block text-start">
                  Lorem ipsum dolor sit amet, consectetur.
                </small>
              </div>
            </div>
          </div>
        </div>
        <div class="my-5">
          <div class="row my-4 no-gutters ">
            <div class="col-md-6 d-none d-md-block px-0 rounded-start-5 bgSideVectorContact">
              <div className="p-5">
                <div className="d-flex align-items-center">
                  <div className="">
                    <img src={logo} className="img-fluid" />
                  </div>
                  <div className="ps-4">
                    <h2 className="text-white d-block">Livesite</h2>
                  </div>
                </div>
                <div className='my-4'>
                <div className="d-flex align-items-baseline py-5">
                  <div className="">
                    <img src={call} className="img-fluid" />
                  </div>
                  <div className="ps-4">
                    <span className="text-white d-block">+0000000000</span>
                  </div>
                </div>
                <div className="d-flex align-items-baseline py-2">
                  <div className="">
                    <img src={mail} className="img-fluid" />
                  </div>
                  <div className="ps-4">
                    <span className="text-white d-block">xyz@gmail.com</span>
                  </div>
                </div>
                <div className="d-flex align-items-baseline py-5">
                  <div className="">
                    <img src={location} className="img-fluid" />
                  </div>
                  <div className="ps-4">
                    <span className="text-white text-start d-block">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</span>
                  </div>
                </div>
                </div>
                <div className='d-flex my-2'>
                    <div className='px-2 ps-0'>
                        <img src={fb} className='img-fluid'/>
                    </div>
                    <div className='px-2'>
                    <img src={tw} className='img-fluid'/>

                    </div>
                    <div className='px-2'>
                    <img src={yt} className='img-fluid'/>

                    </div>
      
                </div>
              </div>
            </div>
            <div class="col-md-6 commonModalBg bg-white p-5 rounded-end-5 position-relative">
              <Form className="position-relative">
                <Row className="mb-4">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className="fs-6 yellowText text-start d-block">
                      First Name
                    </Form.Label>
                    <Form.Control
                      className="py-2"
                      type="text"
                      placeholder="Enter First Name"
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className="fs-6 yellowText text-start d-block">
                      Last Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="py-2"
                      placeholder="Enter Last Name"
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-4">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className="fs-6 yellowText text-start d-block">
                      Email
                    </Form.Label>
                    <Form.Control
                      className="py-2"
                      type="email"
                      placeholder="Enter Email Address"
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className="fs-6 yellowText text-start d-block">
                      Phone Number
                    </Form.Label>
                    <Form.Control
                      type="number"
                      className="py-2"
                      placeholder="Enter Phone Number"
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-4">
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label className="fs-6 yellowText text-start d-block">
                      Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      placeholder="Please Enter Description"
                      rows={6}
                    />
                  </Form.Group>
                </Row>

                <Button
                  variant="primary"
                  className="loginBtn1 d-flex justify-content-end ms-auto py-3 px-5 fs-6 bottom-0 end-0"
                  type="submit"
                >
                  Send Message
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
