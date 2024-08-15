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
XML_TO_LEXICAL.set('codeblock', () => $createCodeNode("bash"))
// XML_TO_LEXICAL.set('code',() => $createCodeNode("code"))

const SKIP_XML:Map<string,string> = new Map()
SKIP_XML.set('code','code')
SKIP_XML.set('image','image')
SKIP_XML.set('i','i')
SKIP_XML.set('a','a')
SKIP_XML.set('ul','ul')
SKIP_XML.set('link','link')

function xml_to_nodes2(node: ChildNode, parent: ElementNode) {
    // console.log("making",node.nodeName)
    if(node.nodeType === Node.TEXT_NODE) {
        // console.log('adding text',node.textContent)
        parent.append($createTextNode(node.textContent as string))
    }

    if(node.nodeType === Node.ELEMENT_NODE) {
        if(SKIP_XML.has(node.nodeName)) {
            return
        }
        if(XML_TO_LEXICAL.has(node.nodeName)) {
            const cb = XML_TO_LEXICAL.get(node.nodeName) as Callback;
            const nd = cb()
            for(let ch of node.childNodes) {
                xml_to_nodes2(ch,nd)
            }
            parent.append(nd)

        } else {
            throw new Error(`XML tag not supported '${node.nodeName}'`)
        }
    }
}

function xml_to_nodes(doc: ChildNode, root: RootNode) {
    print_xml_node(doc,0)
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
    // const text = $createTextNode("some text")
    // para.append(text)
    // return para
}

export function XMLImportPlugin() {
    const [editor] = useLexicalComposerContext()
    const importXML = async () => {
        let str = await fetch('./example1.xml')
        let xmlstr = await str.text()
        let xml = new DOMParser().parseFromString(xmlstr, "text/xml")
        let doc = xml.childNodes[0]
        console.log("loaded",doc)

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
        <button onClick={make_header}>make header</button>
    </div>
}
