import { CardContent } from "@mui/material";

export interface CardContentCtmProps {
    cardContentProps?: React.ComponentProps<typeof CardContent>
    children?: React.ReactNode
}

export default function CompactCardContent({ cardContentProps, children }: CardContentCtmProps) {
    return (
        <CardContent {...cardContentProps} sx={{
            padding: '0.5rem',
            paddingBottom: '0.5rem !important',
            ...cardContentProps?.sx,
        }}>
            {children}
        </CardContent>
    )
}
