"use client";

import Image from "next/image";

export const Providers = () => {
    

    const handleOAuthSignIn = (provider : string) => {
        console.log(provider)
    }

    return (<div className="mt-6">
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3">
            <button
                onClick={() => handleOAuthSignIn('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
                <Image className="h-5 w-5 mr-2" src="https://www.google.com/favicon.ico" alt="google" />
                Continue with Google
            </button>
        </div>
    </div>)
}