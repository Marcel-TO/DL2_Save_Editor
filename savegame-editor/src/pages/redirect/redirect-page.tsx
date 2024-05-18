import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const RedirectPage = ({navigateTo}: {navigateTo: string}) => {
    useEffect(() => {
        const navigate = useNavigate();
        navigate(navigateTo);
    }, [])
    return (
        <>
            <h1>Redirecting to {navigateTo}.....</h1>
        </>
    )
}