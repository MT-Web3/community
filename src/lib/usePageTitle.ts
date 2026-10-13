import {useEffect} from 'react'
export function usePageTitle(title:string){useEffect(()=>{document.title=title;return()=>{document.title='MT-Web3 Community'}},[title])}
