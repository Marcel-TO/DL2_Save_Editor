import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const BreadcrumbComponent = ({breadcrumbLinks, breadcrumbItem}: {breadcrumbLinks: {title:string, href:string}[], breadcrumbItem: string}) => {
    return (
        <>
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbLinks.map(({title, href}) => (
                    <>
                        <BreadcrumbItem key={title}>
                            <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </>
                    ))}
                    <BreadcrumbItem>
                        <BreadcrumbPage>{breadcrumbItem}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </>
    )
}