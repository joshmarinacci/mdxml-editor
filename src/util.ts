export function makeTab(indent: number) {
    let str = ""
    for (let i = 0; i < indent; i++) {
        str += '    '
    }
    return str
}
