import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $getSelection,
    $insertNodes,
    $isRangeSelection, ElementNode,
    RootNode,
    TextNode
} from "lexical";
import {makeTab} from "./util";
import {$setBlocksType} from "@lexical/selection";
import {$createHeadingNode, HeadingTagType, $createQuoteNode} from "@lexical/rich-text"
import {$createCodeNode} from "@lexical/code"
import {$createListNode, $createListItemNode} from "@lexical/list"

function print_xml_node(doc:ChildNode, indent:number) {
    console.log(`${makeTab(indent)} name = `,doc.nodeName, doc.nodeType)
    for(let ch of doc.childNodes) {
        print_xml_node(ch,indent+1)
    }
}


type Callback = () => ElementNode
const XML_TO_LEXICAL:Map<string,Callback> = new Map()
XML_TO_LEXICAL.set('h1',() => $createHeadingNode("h1"))
XML_TO_LEXICAL.set('h2',() => $createHeadingNode("h2"))
XML_TO_LEXICAL.set('p',() => $createParagraphNode())
XML_TO_LEXICAL.set('ul',() => $createListNode("bullet"))
XML_TO_LEXICAL.set('li',() => $createListItemNode(false))
XML_TO_LEXICAL.set('codeblock', () => $createCodeNode("bash"))
XML_TO_LEXICAL.set('strong', () => $createParagraphNode())
XML_TO_LEXICAL.set('em', () => $createParagraphNode())
XML_TO_LEXICAL.set('b', () => $createParagraphNode())
// XML_TO_LEXICAL.set('code',() => $createCodeNode("code"))

const inline_xml = ['strong','em']

const SKIP_XML:Map<string,string> = new Map()
SKIP_XML.set('code','code')
SKIP_XML.set('image','image')
SKIP_XML.set('i','i')
SKIP_XML.set('a','a')
SKIP_XML.set('link','link')

const skip_text = ['list']

function xml_to_nodes2(node: ChildNode, parent: ElementNode) {
    // console.log("making",node.nodeName)
    if(node.nodeType === Node.TEXT_NODE) {
        if(skip_text.includes(parent.getType())) {
            return
        }
        let txt = (node.textContent as string)
            .replaceAll(/\s+/g,' ')
            .trim()
        const tn = $createTextNode(txt)
        parent.append(tn)
        return tn
    }

    if(node.nodeType === Node.ELEMENT_NODE) {
        if(SKIP_XML.has(node.nodeName)) {
            return undefined
        }
        if(XML_TO_LEXICAL.has(node.nodeName)) {
            if(inline_xml.includes(node.nodeName)) {
                for(let ch of node.childNodes) {
                    let tn = xml_to_nodes2(ch,parent) as TextNode
                    tn.setFormat('bold')
                }
                return undefined
            }
            const cb = XML_TO_LEXICAL.get(node.nodeName) as Callback;
            const nd = cb()
            for(let ch of node.childNodes) {
                xml_to_nodes2(ch,nd)
            }
            parent.append(nd)
            return nd

        } else {
            throw new Error(`XML tag not supported '${node.nodeName}'`)
        }
        return
    }

    console.warn(`unprocessed node type ${node.nodeType}`)
}

export function xml_to_nodes(doc: ChildNode, root: RootNode) {
    if(doc.nodeName === 'document') {
        for(let ch of doc.childNodes) {
            if(ch.nodeType === Node.ELEMENT_NODE) {
                xml_to_nodes2(ch,root)
            }
            if(ch.nodeType === Node.TEXT_NODE) {
                 // const txt = $createTextNode(ch.textContent as string)
            }
        }
    }
}

export function XMLImportPlugin() {
    const [editor] = useLexicalComposerContext()
    const importXML = async () => {
        // let str = await fetch('./example1.xml')
        let str = await fetch('./example2.xml')
        let xmlstr = await str.text()
        let xml = new DOMParser().parseFromString(xmlstr, "text/xml")
        let doc = xml.childNodes[0]
        editor.update( () => {
            xml_to_nodes(doc,$getRoot())
            // Select the root
            // $getRoot().select();
            // Insert them at a selection.
            // $insertNodes([root]);
        });
    }

    const make_header = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode("h4"));
            }
        });
    }

    return <div>
        <button onClick={importXML}>import xml</button>
        {/*<button onClick={make_header}>make header</button>*/}
    </div>
}
