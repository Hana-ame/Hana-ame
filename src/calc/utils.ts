export function myFormat(str: string) {
    const l = str.length;
    let s = ""
    for (let i = 0; i < l; i++) {
        s = str[l-1-i] + s
        if ( (i+1) < l && (i+1)%4 === 0)
            s = '_' + s
    }
    return s
}