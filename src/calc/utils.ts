export function myFormat(str: string) {
    const l = str.length;
    let s = ""
    for (let i = 0; i < l; i++) {
        s = str[l - 1 - i] + s
        if ((i + 1) < l && (i + 1) % 4 === 0)
            s = '_' + s
    }
    return s
}

export function myStrip(str: string) {
    return str.split("_").join("")
}

export function BigIntWithBase(raw: string, base: number) {
    switch (base) {
        case 16:
            return BigInt("0x" + raw)
        case 2:
            return BigInt("0b" + raw)
        default:
            return BigInt(raw)
    }

}