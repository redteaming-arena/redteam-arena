"use client"
import Image from 'next/image';
import React from 'react';


import google from '@/public/providers/google.png'

const LeaderboardPodium = ({ leaders }) => {
  return (
      <div className='z-20'>
        {/* <Image src={google} width={100} height={100} alt='google' className='z-20'/> */}
      </div>
  );
};

export default LeaderboardPodium;
