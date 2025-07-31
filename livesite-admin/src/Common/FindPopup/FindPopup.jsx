import React, { useState } from "react";
import { Modal, Button, Tab, Tabs, Form, Row, Col } from "react-bootstrap";
import "./FindPopup.css";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";

function FindPopup({
  show,
  onClose,
  handleSubmit,
  searchText,
  setSearchText,
  replaceText,
  setReplaceText,
  findArrayLength,
  arrayIndex,
  forward,
  backword,
}) {
  const [key, setKey] = useState("find");

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Search</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-1 pb-4">
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3 border-0 custom-tab"
        >
          <Tab eventKey="find" title="Find">
            <Form onSubmit={handleSubmit}>
              <Row className="align-items-end justify-content-between py-1">
                <Col sm={9} className="my-1">
                  <Form.Label htmlFor="inlineFormInputName">
                    Find What
                  </Form.Label>
                  <Form.Control
                    id="inlineFormInputName"
                    className="py-2"
                    placeholder="Find"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col sm={3} className="my-1 d-flex align-items-center ps-0">
                  <Button type="submit" className="w-100 py-2 rounded-1">
                    Find Next
                  </Button>
                </Col>
              </Row>
              {findArrayLength && findArrayLength?.length > 0 && (
                <div className="d-flex gap-2">
                  <span className="mb-0">
                    {arrayIndex + 1} of {findArrayLength.length}
                  </span>
                  <button
                    className="border-0"
                    onClick={forward}
                    disabled={arrayIndex === findArrayLength.length - 1}
                  >
                    <FaChevronUp
                      className={
                        arrayIndex === findArrayLength.length - 1 &&
                        "opacity-50"
                      }
                    />
                  </button>
                  <button
                    className="border-0"
                    onClick={backword}
                    disabled={arrayIndex === 0}
                  >
                    <FaChevronDown
                      className={arrayIndex === 0 && "opacity-50"}
                    />
                  </button>
                </div>
              )}
              {findArrayLength && findArrayLength.length === 0 && (
                <p>Result not found</p>
              )}
            </Form>
          </Tab>
          <Tab eventKey="replace" title="Replace">
            <Form onSubmit={handleSubmit}>
              <Row className="align-items-end justify-content-between py-1">
                <Col sm={9} className="my-1">
                  <Form.Label htmlFor="inlineFormInputName">
                    Find What
                  </Form.Label>
                  <Form.Control
                    id="inlineFormInputName"
                    className="py-2"
                    placeholder="Find"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col sm={3} className="my-1 d-flex align-items-center ps-0">
                  <Button type="submit" className="w-100 py-2">
                    Find Next
                  </Button>
                </Col>
                {findArrayLength && findArrayLength?.length > 0 && (
                  <div className="d-flex gap-2">
                    <span className="mb-0">
                      {arrayIndex + 1} of {findArrayLength.length}
                    </span>
                    <button
                      className="border-0"
                      onClick={forward}
                      disabled={arrayIndex === findArrayLength.length - 1}
                    >
                      <FaChevronUp
                        className={
                          arrayIndex === findArrayLength.length - 1 &&
                          "opacity-50"
                        }
                      />
                    </button>
                    <button
                      className="border-0"
                      onClick={backword}
                      disabled={arrayIndex === 0}
                    >
                      <FaChevronDown
                        className={arrayIndex === 0 && "opacity-50"}
                      />
                    </button>
                  </div>
                )}
                {findArrayLength && findArrayLength.length === 0 && (
                  <p>Result not found</p>
                )}
              </Row>
              <Row className="align-items-end justify-content-between py-1">
                <Col sm={9} className="my-1">
                  <Form.Label htmlFor="inlineFormInputName">
                    Replace with
                  </Form.Label>
                  <Form.Control
                    id="inlineFormInputName"
                    className="py-2"
                    placeholder="Replace"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                  />
                </Col>
                <Col sm={3} className="my-1 d-flex align-items-center ps-0">
                  <Button type="submit" className="w-100 py-2 rounded-1">
                    Replace
                  </Button>
                </Col>
              </Row>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
}

export default FindPopup;
