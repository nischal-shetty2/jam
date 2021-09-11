import React from 'react'
import { useState } from 'react'
import { useLocation } from "react-router-dom"
import './payment.css'
import * as rb from 'react-bootstrap'
const Payment = ({onPayment,onCoinjoin}) => {
    const location = useLocation()
    const [destination, setDestination] = useState('')
    const [amount, setAmount] = useState('')
    const [mixdepth, setMixdepth] = useState(location.state.account_no)
    const [counterparties,setcounterparties] = useState('');
    const [isCoinjoin,setisCoinjoin] = useState(false);

    const onSubmit = (e) => {
        e.preventDefault()
    
        if (!amount || !mixdepth || !destination) {
          alert('Please add details')
          return
        }
        //maybe add await here
        //if normal payment
        if(isCoinjoin===false){
            let wallet =JSON.parse(sessionStorage.getItem('auth')).name;
            onPayment(wallet,mixdepth,amount,destination);
        }
        //coinjoin
        else{
            if(!counterparties){
                alert("Please set counterparties to a non zero number");
               
                return;
            }
            else{
                onCoinjoin(mixdepth,amount,counterparties,destination);
                alert("Coinjoin in progress");
            }

        }

        setcounterparties('');
        setMixdepth('');
        setAmount('');
        setDestination('');
        setisCoinjoin(false);
       
    
        

      }

    return (
        <div>

<br></br>
            <div className = "heading">
            Send Payment
            </div>

            <form method="POST" onSubmit={onSubmit}>
            <rb.Container className = "center">
            <rb.Container fluid = "false" className = "form1">
                <rb.Row>
                    
                    <rb.Col className="label">
                    Receiver address:
                    </rb.Col>
                    <rb.Col>
                    <input type="text" name="destination"  value = {destination }onChange={(e) => setDestination(e.target.value)}/>
                    </rb.Col>
                    
                </rb.Row>
                <rb.Row className = "field">
                    
                    <rb.Col className="label">
                        Account
                    </rb.Col>
                    <rb.Col>
                    <input type="text" name="mixdepth" value = {mixdepth} onChange={(e) => setMixdepth(e.target.value)} readOnly={true}/>
                    </rb.Col>
                    
                </rb.Row>
                <rb.Row className = "field">
                    
                    <rb.Col className="label">
                        Amount(SATS)
                    </rb.Col>
                    <rb.Col>
                    <input type="text" name="amount_sats" value = {amount} onChange={(e) => setAmount(e.target.value)}/>
                    </rb.Col>
                    
                </rb.Row>

                <p></p>
                <br></br>
                <div className = "coinjoin">
        Do you want to do a coinjoin?
        <p></p>
        Yes<input type="radio" name="coinjoin" onChange={(e) => setisCoinjoin(true)} />
        <p></p>
        No<input type="radio" name="coinjoin"  onChange={(e) => setisCoinjoin(false)}/>
        <p></p>
        </div>
       

        {
            isCoinjoin? 
            <div>
                <rb.Row className = "field">
                <rb.Col className="label">
                Counterparties
                </rb.Col>
                <rb.Col>
                <input type="text" name="counterparties" value = {counterparties} onChange={(e)=>setcounterparties(e.target.value)}/>
                </rb.Col>
            </rb.Row>
            </div>
             :
             
              ""
              
        }

                <rb.Row className = "btn-field">
                <button className="btncr" type="submit" value="Submit" ><span>Submit</span></button>
                </rb.Row>
            </rb.Container>
            </rb.Container>
            </form>

            
        {/* <h3>Make Payment</h3>
    <form method="POST" onSubmit={onSubmit}>
        <label>
        Receiver address:
        <input type="text" name="destination"  value = {destination }onChange={(e) => setDestination(e.target.value)}/>
        </label>
        <p></p>
        <label>
        Account
        <input type="text" name="mixdepth" value = {mixdepth} onChange={(e) => setMixdepth(e.target.value)} readOnly={true}/>
        </label>
        <p></p>
        <label>
        Amount
        <input type="text" name="amount_sats" value = {amount} onChange={(e) => setAmount(e.target.value)}/>
        </label>
        <p></p>
        Do you want to do a coinjoin?
        <p></p>
        Yes<input type="radio" name="coinjoin" onChange={(e) => setisCoinjoin(true)} />
        <p></p>
        No<input type="radio" name="coinjoin"  onChange={(e) => setisCoinjoin(false)}/>
        <p></p>


        {
            isCoinjoin? 
            <div>
                Counterparties
                <input type="text" name="counterparties" value = {counterparties} onChange={(e)=>setcounterparties(e.target.value)}/>
            </div>
             :
             
              ""
        }
        <p></p>

        <input type="submit" value="Submit" />
        
    </form> */}
        </div>
    )
}

export default Payment
