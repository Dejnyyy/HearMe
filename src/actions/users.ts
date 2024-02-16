"use server";
import { db } from "~/lib/db";

export const NajdiUsery = async ()=>{
    const users = await db.user.findMany();
    console.log(users);
    return users;
}