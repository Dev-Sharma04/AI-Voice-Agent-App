"use client"
import {api} from '@/convex/_generated/api';
import { useStackApp, useUser } from '@stackframe/stack';
import { useMutation } from 'convex/react';
import React, {  useEffect, useState } from 'react'
import { UserContext } from './_context/UserContext';

function AuthProvider({ children }) {
    
    const user = useUser();
    const CreateUser = useMutation(api.users.CreateUser); //this line throws error bcoz of users
    const [userData,setUserData] = useState();
    useEffect(() =>{
        console.log(user);
        user && CreateNewUser();
    },[user])

    const CreateNewUser=async()=>{
      const result = await CreateUser({
        name:user?.displayName,
        email:user.primaryEmail
      });
      //console.log(result);
      setUserData(result);
    }
  return (
    
  
    <UserContext.Provider value={{userData,setUserData}}>
      {children} 
    </UserContext.Provider>
  )
}

export default AuthProvider