export function makeTab(indent: number) {
    let str = ""
    for (let i = 0; i < indent; i++) {
        str += '    '
    }
    return str
}

export function repeat(s: string, attr: number) {
    let out = ""
    for (let i = 0; i < attr; i++) {
        out += s
    }
    return s
}