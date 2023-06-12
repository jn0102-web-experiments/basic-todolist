import { Card, CardContent, Paper } from "@mui/material";

export interface PaperCardProps {
    paperProps?: React.ComponentProps<typeof Paper>
    cardProps?: React.ComponentProps<typeof Card>
    children?: React.ReactNode
}

export function PaperCard({
    children,
    paperProps,
    cardProps,
}: PaperCardProps) {
    return (
        <Paper {...(paperProps ?? {})}>
            <Card {...(cardProps ?? {})}>
                {children}
            </Card>
        </Paper>
    )
}

export interface CardContentCtmProps {
    cardContentProps?: React.ComponentProps<typeof CardContent>
    children?: React.ReactNode
}

export function CompactCardContent({ cardContentProps, children }: CardContentCtmProps) {
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
