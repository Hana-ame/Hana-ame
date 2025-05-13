import type { ReactNode } from "react";

export default function ContentWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="ml-64 mt-16">
            {children}
        </div>
    )
}

