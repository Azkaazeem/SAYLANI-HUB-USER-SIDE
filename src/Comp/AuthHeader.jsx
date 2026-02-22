import React from 'react'

const AuthHeader = ({heading}) => {
    return (
        <>
            <center>
                <h1 className='text-4xl p-6 font-medium'>{heading}</h1>
                <div className='w-100vh h-1 bg-gradient-to-l from-primary-green to-primary-blue'></div>
            </center>
        </>
    )
}

export default AuthHeader