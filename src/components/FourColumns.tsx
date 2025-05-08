import type { ReactNode } from "react";

export default function FourColumns({ children }: { children: ReactNode }) {
    return (<main className="container mx-auto p-6">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {children}
        </div>
    </main>)
}