type XMLElement = {
    name:string
    attributes:Map<string,string>,
    children:XMLElement[]
    body?:string
}
type LXObj = {
    type:string
    direction:"ltr",
    indent:number,
    children?:LXObj[]
    text?:string
}
function doVisit(obj: LXObj, cb: (o:LXObj) => void) {
    cb(obj)
    if(obj.children) {
        for(let ch of obj.children) {
            doVisit(ch, cb)
        }
    }
}

function makeTab(indent: number) {
    let str = ""
    for(let i=0; i<indent; i++) {
        str += '    '
    }
    return str
}

function XMLtoString(root: XMLElement, indent:number):string {
    const tab = makeTab(indent)
    return `${tab}<${root.name}>
${root.children.map((ch:XMLElement) => {
    return XMLtoString(ch, indent+1)
}).join('\n')}
${root.body?root.body:""}    
${tab}</${root.name}>`
}

export function JSONtoXML(obj: object) {
    let root:XMLElement = {
        name:'article',
        attributes: new Map(),
        children:[]
    }
    let stack:XMLElement[] = [root]
    doVisit(obj.root,(o) => {
        console.log(`object type = ${o.type}`)
        if(o.type === 'paragraph') {
            let para:XMLElement = {
                name:o.type,
                attributes: new Map(),
                children:[]
            }
            let rt = stack.pop() as XMLElement
            rt.children.push(para)
            stack.push(rt)
            stack.push(para)
        }
        if(o.type === 'text') {
            let txt:XMLElement = {
                name:'text',
                attributes: new Map(),
                children:[],
                body:o.text
            }
            let rt = stack.pop() as XMLElement
            rt.children.push(txt)
            stack.push(rt)
            stack.push(txt)
        }
    })
    console.log(root)
    console.log(XMLtoString(root))
    return "foo"
}
