import React, { useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
import Marketplace from "../abis/Marketplace.json";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const App = () => {
  const [accountData, setAccount] = useState({
    account: "",
    productCount: 0,
    products: [],
    marketplace: null,
    loading: true,
    saving: false,
    productName: "",
    price: 0,
    buying: false,
  });
  const {
    loading,
    marketplace,
    account,
    productName,
    price,
    saving,
    productCount,
    products,
    buying,
  } = accountData;
  console.log("products", products);

  const loadWeb3 = async () => {
    console.log("innn", window.ethereum);
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      console.log(window.web3);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount((prevState) => ({ ...prevState, account: accounts[0] }));
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      const marketRes = web3.eth.Contract(Marketplace.abi, networkData.address);
      const productCount = await marketRes.methods.productCount().call();
      setAccount((prevState) => ({
        ...prevState,
        marketplace: marketRes,
        loading: false,
        productCount: productCount.toString(),
      }));
      console.log(productCount.toString());
      for (let i = 1; i <= productCount; i++) {
        const product = await marketRes.methods.products(i).call();
        setAccount((prevState) => ({
          ...prevState,
          products: [...prevState.products, product],
        }));
      }
    } else {
      alert("Market place is not deployed");
    }
  };

  const loadInitialData = async () => {
    await loadWeb3();
    await loadBlockchainData();
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const setLocalState = (name, value) => {
    setAccount((prevState) => ({ ...prevState, [name]: value }));
  };

  const createProduct = (e) => {
    e.preventDefault();
    setLocalState("saving", true);
    const modifiedPrice = window.web3.utils.toWei(price.toString(), "Ether");
    marketplace.methods
      .createProduct(productName, modifiedPrice)
      .send({ from: account })
      .once("receipt", async (receipt) => {
        const productCount = await marketplace.methods.productCount().call();
        setLocalState("saving", false);
        setLocalState("productCount", productCount.toString());
      });
  };

  const purchaseProduct = (id, passPrice) => {
    setLocalState("buying", id.toString());
    // const modifiedPrice = window.web3.utils.toWei(price.toString(), "Ether");
    marketplace.methods
      .purchaseProduct(id)
      .send({ from: account, value: passPrice })
      .once("receipt", async (receipt) => {
        //const productCount = await marketplace.methods.productCount().call();
        setLocalState("buying", false);
        // setLocalState("productCount", productCount.toString());
      });
  };

  const navDiv = (
    <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
      <a
        className="navbar-brand col-sm-3 col-md-2 mr-0"
        href="http://www.dappuniversity.com/bootcamp"
        target="_blank"
        rel="noopener noreferrer"
      >
        Dapp University
      </a>
      <p style={{ color: "white", marginTop: 15, marginRight: 10 }}>
        {account}
      </p>
    </nav>
  );

  const formDiv = (
    <Form onSubmit={(e) => createProduct(e)}>
      <Form.Group className="mb-3" controlId="productName">
        <Form.Label>Product Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter here..."
          value={productName || ""}
          onChange={(e) => setLocalState("productName", e.target.value)}
        />
        {/* <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text> */}
      </Form.Group>

      <Form.Group className="mb-3" controlId="price">
        <Form.Label>Price</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter here..."
          value={price || ""}
          onChange={(e) => setLocalState("price", e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        {saving ? "Saving..." : "Add Product"}
      </Button>
    </Form>
  );

  const productDiv = (
    <>
      {formDiv}
      <br />
      <br />
      {productCount}
      <h1>Products</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Owner</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => {
            return (
              <tr key={i}>
                <td>{product.id.toString()}</td>
                <td>{product.name}</td>
                <td>
                  {window.web3.utils.fromWei(product.price.toString(), "Ether")}{" "}
                  ETH
                </td>
                <td>{product.owner}</td>
                <td>
                  {!product.purchased ? (
                    <Button
                      type="button"
                      onClick={() => purchaseProduct(product.id, product.price)}
                    >
                      {buying === product.id.toString() ? "Buying" : "Buy"}
                    </Button>
                  ) : (
                    "Purchased"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );

  return (
    <div>
      {navDiv}
      <br />
      <br />
      <br />
      <div className="container-fluid p-10">
        {loading ? "Loading...." : productDiv}
      </div>
    </div>
  );
};

export default App;
