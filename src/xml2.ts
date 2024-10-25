import {HeadingNode} from "@lexical/rich-text"
import {ElementNode, RootNode, TextNode} from "lexical";
import {CodeNode} from "@lexical/code"
import {s} from "vitest/dist/reporters-yx5ZTtEV.js";

function lex_to_xml(node:ElementNode, xmlDoc: Document):Element {
    console.log("doing ",node.getType())
    if(node.getType() === 'heading') {
        const heading = xmlDoc.createElement((node as HeadingNode).getTag())
        heading.appendChild(document.createTextNode(node.getTextContent()));
        return heading
    }
    if(node.getType() === 'paragraph') {
        const para = xmlDoc.createElement('para')
        for(let ch of node.getChildren()) {
            let text = ch as TextNode
            if(text.hasFormat('bold')) {
                const el = document.createElement('strong')
                el.appendChild(document.createTextNode(ch.getTextContent()))
                para.appendChild(el)
                continue
            }
            if(text.hasFormat('italic')) {
                const el = document.createElement('em')
                el.appendChild(document.createTextNode(ch.getTextContent()))
                para.appendChild(el)
                continue
            }
            if(text.hasFormat('code')) {
                const el = document.createElement('code')
                el.appendChild(document.createTextNode(ch.getTextContent()))
                para.appendChild(el)
                continue
            }
            if(ch.getType() === 'text') {
                const txt = document.createTextNode(ch.getTextContent())
                para.appendChild(txt)
            } else {
                const xe = lex_to_xml(ch as ElementNode, xmlDoc)
                para.appendChild(xe)
            }
        }
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
const BLOCK_WITH_INLINE = new Set<string>
BLOCK_WITH_INLINE.add('h1')
BLOCK_WITH_INLINE.add('p')
const INLINE_ELEMENT = new Set<string>
INLINE_ELEMENT.add('b')
INLINE_ELEMENT.add('i')
INLINE_ELEMENT.add('h1')
INLINE_ELEMENT.add('p')
function xml_pretty_print2(el: Element, output:OutputFormatter):void {
    if(INLINE_ELEMENT.has(el.nodeName)) {
        output.startElementInline(el)
    } else {
        output.startElementOutline(el)
    }
    for(let child of el.childNodes) {
        if(child.nodeType === DOM_ELEMENT_TYPE) {
            xml_pretty_print2(child as Element, output)
        }
        if(child.nodeType === DOM_TEXT_TYPE) {
            output.addText((child as unknown as Text).textContent +"")
        }
    }
    if(INLINE_ELEMENT.has(el.nodeName)) {
        output.endElementInline(el)
    } else {
        output.endElementOutline(el)
    }
    if(BLOCK_WITH_INLINE.has(el.nodeName)) {
        output.appendText("\n")
    }
}

class OutputFormatter {
    private lines: string[];
    private depth: number;
    private inline: boolean;

    constructor() {
        this.lines = []
        this.depth = 0
        this.inline = false
    }

    toString() {
        return this.lines.join("")
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

    addText(str: string) {
        if(!this.inline) {
            this.lines.push(this.genIndent())
        }
        this.lines.push(str)
    }

    setInline(b: boolean) {
        this.inline = b
    }

    startElementInline(el: Element) {
        let str = `<${el.nodeName}`
        for(let at of el.attributes) str += ` ${at.name}="${at.value}"`
        str += ">"
        this.addText(str)
        this.setInline(true)
    }

    endElementInline(el: Element) {
        this.addText(`</${el.nodeName}>`)
        this.setInline(false)
    }

    startElementOutline(el: Element) {
        let str = `<${el.nodeName}`
        for(let at of el.attributes) str += ` ${at.name}="${at.value}"`
        str += ">"
        if(!this.inline) {
            str += "\n"
        }
        this.addText(str)
        this.indent()
    }

    endElementOutline(el: Element) {
        this.outdent()
        this.addText(`</${el.nodeName}>\n`)
    }

    appendText(s1: string) {
        this.lines.push(s1)
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
    for(let ch of rootNode.getChildren()) {
        xmlDoc.documentElement.append(lex_to_xml(ch as ElementNode,xmlDoc))
    }
    // const serializer = new XMLSerializer();
    // const xmlString = serializer.serializeToString(xmlDoc);
    // console.log("final xml is",xmlString)
    return xmlDoc
}
