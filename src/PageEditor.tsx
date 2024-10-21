import {Site} from "./model.js";
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
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin.js";
import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin.js";
import {xml_to_nodes, XMLImportPlugin} from "./XmlImportPlugin.js";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary.js";

import {CodeNode} from "@lexical/code"
import {HeadingNode} from "@lexical/rich-text"
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getRoot} from "lexical";

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
    let str = await fetch(`./${fileName}`)
    let xmlstr = await str.text()
    let xml = new DOMParser().parseFromString(xmlstr, "text/xml")
    let doc = xml.childNodes[0]
    return doc
}

function PageEditor({fileName}: PageEditorProps) {
    const editorStateRef = useRef(undefined)
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        loadDoc(fileName.get()).then(doc => {
            editor.update(() => {
                const root = $getRoot()
                // remove all children
                while(root.getChildren().length > 0) root.getChildren()[0].remove()
                xml_to_nodes(doc, $getRoot())
            })
        })
    },[fileName])
    return (
        <div className={'editor'}>
                <div className="editor-container">
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
                        <XMLImportPlugin/>
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
                <PageEditor fileName={selected.get('fileName')}/>
        </LexicalComposer>
    } else {
        return <div className={'editor'}>no file selected</div>
    }
}
