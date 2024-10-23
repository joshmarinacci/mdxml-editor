import {HeadingNode} from "@lexical/rich-text"
import {ElementNode, RootNode} from "lexical";
import {CodeNode} from "@lexical/code"

function lex_to_xml(node:ElementNode, xmlDoc: Document):Element {
    // console.log("doing ",node.getType())
    if(node.getType() === 'heading') {
        const heading = xmlDoc.createElement((node as HeadingNode).getTag())
        heading.appendChild(document.createTextNode(node.getTextContent()));
        return heading
    }
    if(node.getType() === 'paragraph') {
        const para = xmlDoc.createElement('para')
        para.appendChild(document.createTextNode(node.getTextContent()));
        return para
    }
    if(node.getType() === 'list') {
        const ul = xmlDoc.createElement('ul')
        for(let ch of node.getChildren()) {
            const xe = lex_to_xml(ch as ElementNode,xmlDoc)
            ul.appendChild(xe)
        }
        return ul
    }
    if(node.getType() === 'listitem') {
        const li = xmlDoc.createElement('li')
        li.appendChild(xmlDoc.createTextNode(node.getTextContent()))
        return li
    }
    if(node.getType() === 'code') {
        const nn = node as CodeNode
        const codeblock = xmlDoc.createElement('codeblock')
        if(nn.getLanguage()) {
            codeblock.setAttribute('language', nn.getLanguage() as string)
        }
        codeblock.appendChild(xmlDoc.createTextNode(node.getTextContent()))
        return codeblock
    }
    throw new Error(`unsupported node type: '${node.getType()}'`)
}

const DOM_ELEMENT_TYPE = 1;
const DOM_TEXT_TYPE = 3;
function xml_pretty_print2(el: Element, output:OutputFormatter):void {
    output.addLine(`<${el.nodeName}>`)
    output.indent()
    for(let child of el.childNodes) {
        if(child.nodeType === DOM_ELEMENT_TYPE) {
            xml_pretty_print2(child as Element, output)
        }
        if(child.nodeType === DOM_TEXT_TYPE) {
            output.addLine((child as unknown as Text).textContent +"")
        }
    }
    output.outdent()
    output.addLine(`</${el.nodeName}>`)
}

class OutputFormatter {
    private lines: string[];
    private depth: number;

    constructor() {
        this.lines = []
        this.depth = 0
    }

    addLine(s: string) {
        this.lines.push(this.genIndent()+s)
    }
    toString() {
        return this.lines.join("\n")
    }

    indent() {
        this.depth += 1
    }

    outdent() {
        this.depth -= 1
    }

    private genIndent() {
        let tab = ""
        for(let i=0; i<this.depth; i++) {
            tab += "    "
        }
        return tab
    }
}

export function xml_pretty_print(xmlDoc: Document) {
    let output = new OutputFormatter();
    xml_pretty_print2(xmlDoc.documentElement,output)
    // console.log("output",output.toString())
    return output.toString()
}

export function nodes_to_xml(rootNode: RootNode):Document {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString('<document></document>', "text/xml"); //important to use "text/xml"
    console.log("xml doc is",xmlDoc)
    console.log("root is",rootNode)
    for(let ch of rootNode.getChildren()) {
        xmlDoc.documentElement.append(lex_to_xml(ch as ElementNode,xmlDoc))
    }
    // const serializer = new XMLSerializer();
    // const xmlString = serializer.serializeToString(xmlDoc);
    // console.log("final xml is",xmlString)
    return xmlDoc
}
