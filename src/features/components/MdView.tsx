import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { ConnectedProps, connect } from "react-redux"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { RootState } from "../../store"

const themingConnector = connect(
    ({ theme }: RootState) => ({
        theme,
    })
)

interface MdViewProps extends ConnectedProps<typeof themingConnector> {
    children?: string
}

const MdView = themingConnector(({ children, theme }: MdViewProps) => {
    return <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
            code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')

                if (inline || !match) {
                    return (
                        <code {...props} className={className}>
                            {children}
                        </code>
                    )
                }

                return (
                    <SyntaxHighlighter
                        {...props}
                        children={String(children).replace(/\n$/, '')}
                        style={((theme) => {
                            switch (theme) {
                                case "light": return vs
                                default: return vscDarkPlus
                            }
                        })(theme)}
                        language={match[1]}
                        PreTag="div" />
                )
            }
        }}>
        {children ?? ''}
    </ReactMarkdown>
})

export default MdView
