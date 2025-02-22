import React, { useState } from 'react';
import { urlConfig } from '../../config';
import {useAppContext} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';

import './RegisterPage.css';

function RegisterPage() {

    //insert code here to create useState hook variables for firstName, lastName, email, password
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showerr, setShowerr]= useState('');
    // insert code here to create handleRegister function and include console.log

    const navigate = useNavigate();
    const { setIsLoggedIn } = useAppContext();
    const handleRegister = async () => {
        const url = `${urlConfig.backendUrl}/api/auth/register`;
        try{
          const response = await fetch(url, {
            method: 'POST',
            headers:{
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              firstName:firstName,
              lastName: lastName,
              password: password
            })
          });
          const json = await response.json();
          if(json.authtoken){
            sessionStorage.setItem('auth-token', json.authtoken);
            sessionStorage.setItem('name', firstName);
            sessionStorage.setItem('email', json.email);
            setIsLoggedIn(true);
            navigate('/app');
          }
          if(json.error){
            setShowerr(json.error);
          }
        }catch(e){
          console.log("Error fetching details: " + e.message);
        }

    }
         return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="register-card p-4 border rounded">
                            <h2 className="text-center mb-4 font-weight-bold">Register</h2>

                    {/* insert code here to create input elements for all the variables - firstName, lastName, email, password */}
                    <div className="mb-4">

                         <label htmlFor="firstName" className="form label"> First Name:</label><br/>
                               <input
                                 id="firstName"
                                 type="text"
                                 className="form-control"
                                 placeholder="Enter your first Name"
                                 value={firstName}
                                 onChange={(e) => setFirstName(e.target.value)}
                               />
                        <label htmlFor="lastName" className="form label"> last Name:</label><br/>
                               <input
                                 id="lastName"
                                 type="text"
                                 className="form-control"
                                 placeholder="Enter your last Name"
                                 value={lastName}
                                 onChange={(e) => setLastName(e.target.value)}
                               />
                        <label htmlFor="email" className="form label">email:</label><br/>
                               <input
                                 id="email"
                                 type="text"
                                 className="form-control"
                                 placeholder="Enter your Email"
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                               />
                        <label htmlFor="password" className="form label">password:</label><br/>
                               <input
                                 id="password"
                                 type="password"
                                 className="form-control"
                                 placeholder="Create a Password"
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                               />
                    </div>
                    {/* insert code here to create a button that performs the `handleRegister` function on click */}
                    <button className="btn btn-primary w-100 mb-3" onClick={handleRegister}>Register</button>
                        <p className="mt-4 text-center">
                            Already a member? <a href="/app/login" className="text-primary">Login</a>
                        </p>
                        <div className="text-danger">{showerr}</div>
                         </div>
                    </div>
                </div>
            </div>

         )//end of return
}

export default RegisterPage;