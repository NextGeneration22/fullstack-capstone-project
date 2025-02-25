import React, { useState, useEffect, useCallback } from 'react';
import { urlConfig } from '../../config';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AuthContext';
import './LoginPage.css';

function LoginPage() {

    //useState hook variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showErr, setShowErr] = useState('');
    const [buttondisabled, setbuttondisabled] = useState(true);
    const navigate = useNavigate()
    const {setIsLoggedIn} = useAppContext()

    useEffect(() => {
      if (sessionStorage.getItem('auth-token')) {
        navigate('/app')
      }
    }, [navigate])

    const handleLogin = async () => {
      const url = `${urlConfig.backendUrl}/api/auth/login`;
      try{
        const response = await fetch(url, {
          method: 'POST',
          headers:{
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        })
        const json = await response.json();
        if(json.authtoken){
          sessionStorage.setItem('auth-token', json.authtoken);
          sessionStorage.setItem('name', json.username);
          sessionStorage.setItem('email', json.email);
        
          navigate('/app')
          setIsLoggedIn(true)
        }
        if(json.error){
          setEmail('')
          setPassword('')
          setShowErr(json.error)
          setTimeout(()=>{
            setShowErr("")
          }, 3000)
        }
      }catch(e){
        console.log("error feching data", e)
      }
    }

    const enablebutton = useCallback(()=>{
      if(email && password){
        setbuttondisabled(false);
      }else{
        setbuttondisabled(true)
      }
    }, [email, password])
    
    useEffect(()=>{
      enablebutton()
    }, [email, password, enablebutton])

    return (
              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                      <h2 className="text-center mb-4 font-weight-bold">Login</h2>

                        {/* create input elements for the variables email and  password */}
                      <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email:</label><b/>
                          <input
                              id="email"
                              type="text"
                              className="form-control"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                          />
                          <label htmlFor="password" className="form-label">Password:</label><b/>
                          <input
                              id="password"
                              type="password"
                              className="form-control"
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                          />

                      </div>
                  {/*create a button that performs the `handleLogin` function on click */}
                      <button className="loginbtn" onClick={handleLogin} disabled={buttondisabled}>Login</button>
                      <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register Here</a>
                      </p>
                      <p className="text-danger">{showErr}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
}

export default LoginPage;