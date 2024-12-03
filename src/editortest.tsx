import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Node, Schema, NodeSpec} from "prosemirror-model"
// import {schema} from "prosemirror-schema-basic"
import {useEffect, useRef} from "react";
import {defaultMarkdownParser, defaultMarkdownSerializer, schema} from "prosemirror-markdown"
import {history, redo, undo} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {baseKeymap, setBlockType, toggleMark} from "prosemirror-commands"


import "./editortest.css"
import {repeat} from "./util";

const test_markdown_doc = `
paragraph of text

# h1 header

another paragraph of text
`
const startdoc = defaultMarkdownParser.parse(test_markdown_doc)

const other_doc = schema.node('doc',null, [
    schema.node('paragraph',null,[schema.text('text in paragraph')]),
])

const YoutubeLinkNodeSpec:NodeSpec = {
    attrs:{url: {default:"asdf"}},
    inline:false,
    draggable:true,
}

const MDXMLSchema = new Schema({
    nodes:schema.spec.nodes.append(YoutubeLinkNodeSpec),
})


const make_strong = toggleMark(schema.marks.strong)


function make_new_state_with_doc(doc) {
    const state = EditorState.create({
        schema: schema,
        doc: doc,
        plugins:[
            history(),
            keymap({
                "Mod-z":undo,
                "Mod-y":redo,
                "Mod-b":make_strong,
            }),
            keymap(baseKeymap)
        ]
    })
    return state
}

function block_to_markdown(block: Node) {
    if (block.type === schema.nodes.paragraph) {
        const output:string[] = []
        block.content.forEach(content => {
            if (content.type === schema.nodes.text) {
                output.push(content.text)
            }
        })
        return output.join(" ")
    }
    if (block.type === schema.nodes.heading) {
        const output:string[] = []
        block.content.forEach(content => {
            if (content.type === schema.nodes.text) {
                output.push(content.text)
            }
        })
        return repeat("#",block.attrs['level']) + ' ' + output.join(" ")
    }
    return "unknown"
}

export function  EditorTest () {
    const viewHost = useRef(null);
    const view = useRef(null)
    useEffect(()=>{
        console.log("first render")
        console.log("schema", schema)
        const state = make_new_state_with_doc(other_doc)
        console.log("state is",state)
        view.current = new EditorView(viewHost.current, {
            state:state,
            dispatchTransaction:(transaction) => {
                console.log("transaction happened")
                let newstate = view.current.state.apply(transaction)
                view.current.updateState(newstate)
            }
        })
        return () => view.current.destroy()
    },[])

    useEffect(() => {
        // console.log("every render")
        // const tr = view.current.state.tr.setMeta()
    }, []);

    const load_from_markdown = () => {
        const state = make_new_state_with_doc(startdoc)
        view.current.updateState(state)
    }
    const save_to_markdown = () => {
        const editor:EditorView = view.current as unknown as EditorView
        console.log('current doc is', editor.state.doc)
        const doc = editor.state.doc
        console.log("Doc is",doc)
        console.log("type", doc.type, 'text',doc.text, 'children',doc.children)
        console.log(doc.children.map(ch => block_to_markdown(ch)).join("\n\n"))
        // setView(new ProseMirrorView(ref.current,"some content"))
    }
    const switch_to_markdown = () => {
        const doc = view.current.state.doc
        console.log("doc is",doc)
        const text = defaultMarkdownSerializer.serialize(doc)
        console.log("markdown is",text)
    }
    const switch_to_visual = () => {
        const doc = defaultMarkdownParser.parse(test_markdown_doc)
        view.current.updateState(make_new_state_with_doc(doc))
    }

    const make_selection_bold = () => {
        toggleMark(schema.marks.strong)(view.current.state, view.current.dispatch)
        setBlockType(schema.nodes.paragraph)(view.current.state,view.current.dispatch)
    }
    const make_selection_heading = () => {
        setBlockType(schema.nodes.heading, {level:1})(view.current.state,view.current.dispatch)
    }
    const make_selection_paragraph = () => {
        setBlockType(schema.nodes.paragraph)(view.current.state,view.current.dispatch)
    }
    return <div className={"editor"}>
        <div className={"toolbar"}>
            <button onClick={load_from_markdown}>load markdown</button>
            <button onClick={save_to_markdown}>save</button>
            <button onClick={switch_to_visual}>visual</button>
            <button onClick={switch_to_markdown}>code</button>
        </div>
        <div className={"toolbar"}>
            <button onClick={make_selection_bold}>bold</button>
            <button onClick={make_selection_heading}>heading</button>
            <button onClick={make_selection_paragraph}>paragraph</button>
        </div>
        <div ref={viewHost} className="content"/>
    </div>

}