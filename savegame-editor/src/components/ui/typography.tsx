import { cn } from "@/lib/utils";


export const TypographyH1 = ({text, className}: {text: string, className?: string}) => {
    return (
        <h1 className={cn(
          "scroll-m-20 text-4xl font-extrabold tracking-widest lg:text-5xl font-drip",
          className
        )}>
        {text}
        </h1>
    )
}

export const TypographyH1Thin = ({text}: {text: string}) => {
    return (
        <h1 className="scroll-m-20 text-4xl tracking-tight lg:text-5xl">
        {text}
        </h1>
    )
}

export const TypographyH2 = ({text}: {text: string}) => {
    return (
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        {text}
      </h2>
    )
  }
  
  export const TypographyH3 = ({text}: {text: string}) => {
    return (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {text}
      </h3>
    )
  }
  

  export const TypographyH4 = ({text}: {text: string}) => {
    return (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {text}
      </h4>
    )
  }
  
  export const TypographyP = ({text}: {text: string}) => {
    return (
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        {text}
      </p>
    )
  }
  
  export const TypographyBlockquote = ({text}: {text: string}) => {
    return (
      <blockquote className="mt-6 border-l-2 pl-6 italic">
        {text}
      </blockquote>
    )
  }
  
  export const TypographyTable = ({table_content}: {table_content: string[][]}) => {
    return (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="m-0 border-t p-0 even:bg-muted">
              {table_content[0].map((header, index) => (
                <th key={index} className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table_content.slice(1).map((row, index) => (
              <tr key={index} className="m-0 border-t p-0 even:bg-muted">
                {row.map((cell, index) => (
                  <td key={index} className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  export const TypographyList = ({texts}: {texts: string[]}) => {
    return (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        {texts.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    )
  }
  
  export const TypographyInlineCode = ({text}: {text: string}) => {
    return (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
        {text}
      </code>
    )
  }
  