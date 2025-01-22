/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import "./style.css";
import { ethers } from "ethers";

const SenderTable = (props) => {
  let indexOfLastItem;
  let indexOfFirstItem;
  let currentItems;
  const { wallets, setWallets, isConnected } = props;
  const { currentPage, setCurrentPage } = useState(1);
  const [itemPerPage] = useState(5);

  useEffect(() => {
    indexOfLastItem = currentPage * itemPerPage;
    indexOfFirstItem = indexOfLastItem - itemPerPage;
    currentItems = wallets && wallets.slice(indexOfFirstItem, indexOfLastItem);
  }, [wallets, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const isValidAddress=(address)=>{
    if (!/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
      return false;
    }
    const isvalid = ethers.isAddress(address); 
    return isvalid;
  }


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const csvString = e.target.result;
      console.log(csvString)
      const addressArr = csvString.replace(/\s/g, "").split(",");
      let addressList = addressArr.filter((item) => item !== "");
      //removing duplicate addresses
      let addressSet = new Set(addressList)
      addressList=[...addressSet]
      console.log(addressList)
      let newWallets=[]
      for(let i=0;i<addressList.length;i++){
        if(!isValidAddress(addressList[0])){
          alert('Invalid address format in csv file provided')
          break
        }else{
          newWallets.push(addressList[i])
        }
      }
      setWallets(newWallets)
      console.log(newWallets)

    };

    reader.readAsText(file);
  };
  const uploadWallet = async (e) => {
    // setWallets(dummy);
    // const response = await fetch(process.env.PUBLIC_URL + "/wallets.csv");
    // const data = await response.text();
    // const dataArray = data.replace(/\s/g, "").split(",");
    // const resultArr = dataArray.filter((item) => item !== "");
    // setWallets(resultArr);
  };

  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Wallet Address</th>
          </tr>
        </thead>
        <tbody>
          {wallets && wallets.length > 0
            ? wallets.map((e, idx) => {
                return (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{e}</td>
                  </tr>
                );
              })
            : "No data"}
        </tbody>
      </Table>

      {/* <Pagination>
        {[
          ...Array(Math.ceil(wallets && wallets.length / itemPerPage)).key(),
        ].map(
          // eslint-disable-next-line array-callback-return
          (number) => {
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => handlePageChange(number + 1)}
            >
              {number + 1}
            </Pagination.Item>;
          }
        )}
      </Pagination> */}

      <div className="tableButton">
        <input 
          id='csv_inp' 
          type="file" 
          accept='.csv' 
          style={{display:'none'}}
          onChange={(e)=>handleFileChange(e)}
        />
        <Button
          className="uploadButton"
          disabled={!isConnected}
          onClick={()=>{
            document.getElementById('csv_inp').click()
          }}
        >
          Upload file
        </Button>
        {/* <InputGroup className="addButton">
          <Form.Control
            placeholder="New Wallet Address"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            aria-disabled={!isConnected}
          />
          <Button variant="primary" id="button-addon2" disabled={!isConnected}>
            Add
          </Button>
        </InputGroup> */}
      </div>
    </div>
  );
};

export default SenderTable;
