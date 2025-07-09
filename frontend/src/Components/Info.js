import React from 'react'

const Info = () => {
  return (
    <div className='w-[25vw] bg-[#100d22]  pt-10 flex ml-3 p-8 rounded-3xl  min-h-[90vh] '>
      <div className="info flex items-center  mx-auto flex-col">
        <img src="profile.png" width={'150px'} alt="" />
         <h1 className="font-sans mt-4  text-xl  text-white frndName">Prasiddha Thapa</h1>
         <p className='text-center text-sm text-white/70 mt-1 '>Joined 27th June 2081</p>
      </div>
    </div>
  )
}

export default Info
