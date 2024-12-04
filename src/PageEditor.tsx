import {FileInfoModel} from "./model.js";
import {forceDownloadBlob} from "josh_web_util"
import {useChanged} from "rtds-react";
import {useEffect, useRef} from "react";
import {LexicalComposer} from "@lexical/react/LexicalComposer.js";
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {ListItemNode, ListNode} from "@lexical/list";
import ExampleTheme from "./ExampleTheme.js";
import ToolbarPlugin from "./plugins/ToolbarPlugin.js";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin.js";
import {ContentEditable} from "@lexical/react/LexicalContentEditable.js";
import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin.js";
import {xml_to_nodes} from "./XmlImportPlugin.js";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary.js";

import {CodeNode} from "@lexical/code"
import {HeadingNode} from "@lexical/rich-text"
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getRoot, ElementNode, LexicalNode, RootNode, TextNode} from "lexical";
import {readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import {nodes_to_xml, xml_pretty_print} from "./xml2.js";

const editorConfig = {
    namespace: 'React.js Demo',
    nodes: [TableNode, TableCellNode, TableRowNode, HeadingNode, CodeNode,
        ListNode, ListItemNode],
    // Handling of errors during update
    onError(error: Error) {
        throw error;
    },
    // The editor theme
    theme: ExampleTheme,
};

const placeholder = 'Enter some rich text...';

interface PageEditorProps {
    fileName?: any
}

async function loadDoc(fileName: string) {
    console.log('loading',fileName)
    if(window['__TAURI_INTERNALS__']) {
        console.log("is tauri")
        const xmlstr = await readTextFile(fileName)
        // let str = await fetch(`./${fileName}`)
        // let xmlstr = await str.text()
        let xml = new DOMParser().parseFromString(xmlstr, "text/xml")
        return xml.childNodes[0]
    } else {
        console.log("is not tauri")
        let str = await fetch(`./${fileName}`)
        let xml_str = await str.text()
        let xml = new DOMParser().parseFromString(xml_str, "text/xml")
        return xml.childNodes[0]
    }
}

async function saveDoc(filename: string, xml_str: string) {
    if(window['__TAURI_INTERNALS__']) {
        console.log("is tauri")
        await writeTextFile(filename,xml_str)
    } else {
        console.log("is not tauri")
        forceDownloadBlob(filename, new Blob([xml_str], {type: "text/xml"}))
    }
}

function PageEditor(props:{file:typeof FileInfoModel}) {
    const editorStateRef = useRef(undefined)
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        loadDoc(props.file.get('filePath').get()).then(doc => {
            editor.update(() => {
                const root = $getRoot()
                // remove all children
                while(root.getChildren().length > 0) root.getChildren()[0].remove()
                xml_to_nodes(doc, $getRoot())
            })
        })
    },[props.file])
    const doExport = () => {
        editor.update(() => {
            console.log("exporting",$getRoot())
            const xml = nodes_to_xml($getRoot())
            const xml_str = xml_pretty_print(xml)
            console.log("final string",xml_str)
            saveDoc(props.file.get('filePath').get(),xml_str)
        })
    }
    return (
        <div className={'editor'}>
            <div className="editor-container">
                <button onClick={doExport}>export</button>
                <ToolbarPlugin/>
                <div className="editor-inner">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="editor-input"
                                aria-placeholder={placeholder}
                                placeholder={
                                    <div className="editor-placeholder">{placeholder}</div>
                                }
                            />
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin onChange={(editorState) => editorStateRef.current = editorState}/>
                    {/*<HistoryPlugin/>*/}
                    {/*<AutoFocusPlugin/>*/}
                    {/*<XMLImportPlugin/>*/}
                </div>
            </div>
        </div>
    )
        ;

}

export function PageEditorWrapper(props: { site: typeof Site }) {
    useChanged(props.site)
    let selected = props.site.get('selectedFile')
    if (selected) {
        // return <div className={'editor'}>the editor for {selected.get('fileName').get()}</div>
        return <LexicalComposer initialConfig={editorConfig}>
                <PageEditor file={selected}/>
        </LexicalComposer>
    } else {
        return <div className={'editor'}>no file selected</div>
    }
}
