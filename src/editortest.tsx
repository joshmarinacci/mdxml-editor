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
import {PageListModel, PageModel} from "./model";
import {EditableLabel} from "rtds-react";
import {StorageManager} from "./storage";
// import {arrowHandlers, CodeBlockView} from "./blockcodeview";

import {
    codeBlockArrowHandlers,
    codeMirrorBlockPlugin,
    defaultSettings,
    languageLoaders,
    legacyLanguageLoaders
} from "prosemirror-codemirror-block"

const codeBlockSpec = schema.spec.nodes.get("code_block");
const SCHEMA = new Schema({
    nodes: schema.spec.nodes.update("code_block",{
        ...(codeBlockSpec || {}),
        attrs: {...codeBlockSpec?.attrs, lang:{default:null}}
    }),
    marks:schema.spec.marks
})

const test_markdown_doc = `
paragraph of text

# h1 header

another paragraph of text
`
const startdoc = defaultMarkdownParser.parse(test_markdown_doc)

const other_doc = schema.node('doc',null, [
    schema.node('paragraph',null,[schema.text('text in paragraph')]),
    schema.node('code_block',null,[schema.text('this is a code block')]),
])

const codeBlockDoc = {
    content: [
        {
            content: [
                {
                    text: "prosemirror-codemirror-block",
                    type: "text",
                },
            ],
            type: "paragraph",
        },
        {
            content: [
                {
                    text: "const jsFun = (arg) => {\n  console.log(arg); \n}",
                    type: "text",
                },
            ],
            attrs: {
                lang: "javascript",
            },
            type: "code_block",
        },
    ],
    type: "doc",
};


const YoutubeLinkNodeSpec:NodeSpec = {
    attrs:{url: {default:"asdf"}},
    inline:false,
    draggable:true,
}

const MDXMLSchema = new Schema({
    nodes:schema.spec.nodes.append(YoutubeLinkNodeSpec),
})


const make_strong_command = toggleMark(schema.marks.strong)
const make_emphasized_command = toggleMark(schema.marks.emphasized)
const make_inlinecode_command = toggleMark(schema.marks.code)

function make_new_state_with_doc(doc:Node) {
    const state = EditorState.create({
        schema: SCHEMA,
        doc: doc,
        // doc: SCHEMA.nodeFromJSON(codeBlockDoc),
        plugins:[
            codeMirrorBlockPlugin({
                ...defaultSettings,
                languageLoaders: {...languageLoaders, ...legacyLanguageLoaders},
                undo,
                redo,
            }),
            history(),
            keymap({
                "Mod-z":undo,
                "Mod-y":redo,
                "Mod-b":make_strong_command,
                "Mod-i":make_emphasized_command,
                "Mod-e":make_inlinecode_command
            }),
            keymap(baseKeymap),
            keymap(codeBlockArrowHandlers),
            // arrowHandlers,
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

export function MarkdownEditorWrapper(props:{pages:typeof PageListModel}) {
    const pages = props.pages

    if(pages.count() === 0) {
        return <div>select a page</div>
    }
    if(pages.count() > 1) {
        return <div>only edit one page at a time</div>
    }
    return <MarkdownEditor page={pages.get(0)}/>
}

export function MarkdownEditor (props:{page:typeof PageModel}) {
    const page = props.page

    console.log("page is",props.page)
    const viewHost = useRef(null);
    const view = useRef(null)
    useEffect(()=>{
        console.log("first render")
        const state = make_new_state_with_doc(other_doc)
        view.current = new EditorView(viewHost.current, {
            state:state,
            dispatchTransaction:(transaction) => {
                console.log("transaction happened")
                let newstate = view.current.state.apply(transaction)
                view.current.updateState(newstate)
            },
            // nodeViews: {code_block: (node, view, getPos) => new CodeBlockView(node, view, getPos)}
        })
        return () => view.current.destroy()
    },[props.page])
    useEffect(() => {
        console.log("page changed")
        const ss = StorageManager.getStorageSystem()
        ss.loadPageDoc(page).then((content:Node) => {
            console.log("got content for the page",content)
            const new_content = SCHEMA.nodeFromJSON(content.toJSON())
            const state = make_new_state_with_doc(new_content)
            view.current.updateState(state)
        })
    }, [props.page]);

    useEffect(() => {
        // console.log("every render")
        // const tr = view.current.state.tr.setMeta()
    }, []);

    // const load_from_markdown = () => {
    //     const state = make_new_state_with_doc(startdoc)
    //     view.current.updateState(state)
    // }
    const save_to_markdown = async () => {
        const editor:EditorView = view.current as unknown as EditorView
        await StorageManager.getStorageSystem().savePageDoc(page, editor.state.doc)
    }
    // const switch_to_markdown = () => {
    //     // const doc = view.current.state.doc
    //     // console.log("doc is",doc)
    //     // const text = defaultMarkdownSerializer.serialize(doc)
    //     // console.log("markdown is",text)
    // }
    // const switch_to_visual = () => {
    //     // const doc = defaultMarkdownParser.parse(test_markdown_doc)
    //     // view.current.updateState(make_new_state_with_doc(doc))
    // }

    const make_strong_action = () => {
        toggleMark(schema.marks.strong)(view.current.state, view.current.dispatch)
        // setBlockType(schema.nodes.paragraph)(view.current.state,view.current.dispatch)
    }
    const make_em_action = () => {
        toggleMark(schema.marks.em)(view.current.state, view.current.dispatch)
    }
    const make_inlinecode_action = () => {
        toggleMark(schema.marks.code)(view.current.state, view.current.dispatch)
    }
    const make_selection_heading = () => {
        setBlockType(schema.nodes.heading, {level:1})(view.current.state,view.current.dispatch)
    }
    const make_selection_codeblock = () => {
        setBlockType(SCHEMA.nodes.code_block, {})(view.current.state,view.current.dispatch)
    }
    const make_selection_paragraph = () => {
        setBlockType(schema.nodes.paragraph)(view.current.state,view.current.dispatch)
    }
    return <div className={"editor"}>
        <div className={'toolbar'}>
            <label>Title</label>
            <EditableLabel value={props.page.get('title')}/>
        </div>
        <div className={'toolbar'}>
            <label>FileName</label>
            <label>{props.page.get('file').get('fileName').get()}</label>
        </div>
        <div className={'toolbar'}>
            <label>FilePath</label>
            <label>{props.page.get('file').get('filePath').get()}</label>
        </div>
        <div className={"toolbar"}>
            {/*<button onClick={load_from_markdown}>load markdown</button>*/}
            <button onClick={save_to_markdown}>save</button>
            {/*<button onClick={switch_to_visual}>visual</button>*/}
            {/*<button onClick={switch_to_markdown}>code</button>*/}
        </div>
        <div className={"toolbar"}>
            <button onClick={make_strong_action}>strong</button>
            <button onClick={make_em_action}>emphasized</button>
            <button onClick={make_inlinecode_action}>code</button>
        </div>
        <div className={"toolbar"}>
            <button onClick={make_selection_heading}>heading</button>
            <button onClick={make_selection_codeblock}>code block</button>
            <button onClick={make_selection_paragraph}>paragraph</button>
        </div>
        <div ref={viewHost} className="content"/>
    </div>

}