import './App.css'

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';

import ExampleTheme from './ExampleTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import {useRef} from "react";
import {JSONtoXML} from "./xml";
// import {CodeBlockNode, CodeBlockPlugin} from "./CodeBlockPlugin";
import {XMLImportPlugin} from "./XmlImportPlugin";
import {TablePlugin} from "@lexical/react/LexicalTablePlugin";
// import {TableOfContentsPlugin} from "@lexical/react/LexicalTableOfContentsPlugin";
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {$createHeadingNode, HeadingTagType, HeadingNode} from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection";
import {CodeNode} from "@lexical/code"

const placeholder = 'Enter some rich text...';

const editorConfig = {
    namespace: 'React.js Demo',
    nodes: [TableNode, TableCellNode, TableRowNode, HeadingNode, CodeNode],
    // Handling of errors during update
    onError(error: Error) {
        throw error;
    },
    // The editor theme
    theme: ExampleTheme,
};

export function App() {
    const editorStateRef = useRef(undefined)
    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-container">
                <ToolbarPlugin />
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
                    <OnChangePlugin onChange={(editorState) => {
                        editorStateRef.current = editorState;
                    }}/>
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <TreeViewPlugin />
                    {/*<CodeBlockPlugin/>*/}
                    <XMLImportPlugin/>
                    <TablePlugin/>
                    {/*<TableOfContentsPlugin/>*/}
                </div>
                <button onClick={() => {
                    console.log('trying to get content from the editor',
                        JSON.stringify(editorStateRef.current))
                    console.log(JSONtoXML(JSON.parse(JSON.stringify(editorStateRef.current))))
                }}>export XML</button>
                <button onClick={async () => {
                    let str = await fetch('./example1.xml')
                    let xmlstr = await str.text()
                    let xml = new DOMParser().parseFromString(xmlstr, "text/xml")
                    let doc = xml.documentElement
                    console.log("loaded",doc)
                }}>load example</button>
            </div>
        </LexicalComposer>
    );
}
