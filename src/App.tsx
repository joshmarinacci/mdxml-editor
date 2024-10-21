import './App.css'

import ExampleTheme from './ExampleTheme';
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {HeadingNode} from "@lexical/rich-text"
import {CodeNode} from "@lexical/code"
import {ListItemNode, ListNode} from "@lexical/list"
import {DialogContext, DialogContextImpl, PopupContext, PopupContextImpl,} from 'josh_react_util'


import "./mainlayout.css"
import 'rtds-react/build/index.esm.css'
import {FileInfo, Site} from "./model.js";
import {FileListView} from "./FileListView.js";
import {useChanged} from "rtds-react";

const placeholder = 'Enter some rich text...';

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

// export function App() {
//     const editorStateRef = useRef(undefined)
//     return (
//         <LexicalComposer initialConfig={editorConfig}>
//             <div className="editor-container">
//                 <ToolbarPlugin />
//                 <div className="editor-inner">
//                     <RichTextPlugin
//                         contentEditable={
//                             <ContentEditable
//                                 className="editor-input"
//                                 aria-placeholder={placeholder}
//                                 placeholder={
//                                     <div className="editor-placeholder">{placeholder}</div>
//                                 }
//                             />
//                         }
//                         ErrorBoundary={LexicalErrorBoundary}
//                     />
//                     <OnChangePlugin onChange={(editorState) => editorStateRef.current = editorState}/>
//                     <HistoryPlugin />
//                     <AutoFocusPlugin />
//                     {/*<TreeViewPlugin />*/}
//                     {/*<CodeBlockPlugin/>*/}
//                     <XMLImportPlugin/>
//                     {/*<TablePlugin/>*/}
//                     {/*<TableOfContentsPlugin/>*/}
//                 </div>
//                 {/*<button onClick={() => {*/}
//                 {/*    console.log('trying to get content from the editor',*/}
//                 {/*        JSON.stringify(editorStateRef.current))*/}
//                 {/*    console.log(JSONtoXML(JSON.parse(JSON.stringify(editorStateRef.current))))*/}
//                 {/*}}>export XML</button>*/}
//                 {/*<button onClick={async () => {*/}
//                 {/*    let str = await fetch('./example1.xml')*/}
//                 {/*    let xmlstr = await str.text()*/}
//                 {/*    let xml = new DOMParser().parseFromString(xmlstr, "text/xml")*/}
//                 {/*    let doc = xml.documentElement*/}
//                 {/*    console.log("loaded",doc)*/}
//                 {/*}}>load example</button>*/}
//             </div>
//         </LexicalComposer>
//     );
// }


const site = Site.cloneWith({
    files: [
        {
            fileName: "main.xml",
            fileType: "mdxml"
        },
        {
            fileName: "details.xml",
            fileType: "mdxml"
        },
    ],
})
// @ts-ignore
site.set('selectedFile',null)


function PageEditor(props: { site: typeof Site }) {
    useChanged(props.site)
    let selected = props.site.get('selectedFile')
    if(selected) {
        return <div className={'editor'}>the editor for {selected.get('fileName').get()}</div>
    } else {
        return <div className={'editor'}>no file selected</div>
    }
}

export function App() {
    return <DialogContext.Provider value={new DialogContextImpl()}>
        <PopupContext.Provider value={new PopupContextImpl()}>
            <div className={'main-layout'}>
                <header>{site.get('title').get()}</header>
                <FileListView className={'file-list'} site={site}/>
                <div className={'page-list'}>the page tree</div>
                <PageEditor site={site}/>
            </div>
        </PopupContext.Provider>
    </DialogContext.Provider>

}
