"use server"

import { redirect } from "next/navigation";

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/g;

export default async function Chat({params} : { params : any, searchParams : any}) {
    
    
    const {session} : { session : string } = params;

    if (session.match(UUID_RE) === null){
        redirect("/error")
    }

    return <>Chat {session}</>    
}