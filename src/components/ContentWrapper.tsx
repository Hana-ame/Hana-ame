export default function ContentWrapper({ children = <></> }) {
    return (
        <div className="ml-64 mt-16">
            {children}
        </div>
    )
}

