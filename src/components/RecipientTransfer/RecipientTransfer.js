import React from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'

const RecipientTransfer = (props) => {
    const {recipient,setRecipient,handleTransfer,isConnected}=props
  return (
    <div>
        <InputGroup size="lg" className="inputgroup">
            <InputGroup.Text id="inputGroup-sizing-lg">
            Recipient Address
            </InputGroup.Text>
            <Form.Control
            aria-label="Large"
            aria-describedby="inputGroup-sizing-sm"
            placeholder={recipient}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            />
        </InputGroup>
        <Button
            style={{marginTop:'20px'}}
            className="btn btn-success"
            onClick={handleTransfer}
            disabled={!isConnected}
        >
            <h3>Tranfer</h3>
        </Button>
    </div>
  )
}

export default RecipientTransfer