"use client"
import api from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import { useMutation } from 'convex/react';
import React, {  useEffect } from 'react'

function AuthProvider({ children }) {
    
    const user = useUser();
    
    useEffect(() =>{
        console.log(user);
    },[user])

    const CreateNewUser=()=>{

    }
  return (
    
    <div>
        
            {children}
        
    </div>
  )
}

export default AuthProvider