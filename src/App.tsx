import './App.css'
import { open } from '@tauri-apps/plugin-dialog';
import { exists, BaseDirectory, readTextFile } from '@tauri-apps/plugin-fs';
import {DialogContext, DialogContextImpl, PopupContext, PopupContextImpl,} from 'josh_react_util'

import "./mainlayout.css"
import 'rtds-react/build/index.esm.css'
import {FileInfo, FileType, Site} from "./model.js";
import {FileListView} from "./FileListView.js";
import {PageEditorWrapper} from "./PageEditor.js";

const site = Site.cloneWith({
    files: [
        {
            fileName: "example1.xml",
            fileType: "mdxml",
            filePath: "example1.xml"
        },
        {
            fileName: "example2.xml",
            fileType: "mdxml",
            filePath: "example2.xml"
        },
    ],
})
// @ts-ignore
site.set('selectedFile',null)


export function App() {
    const doOpen = async () => {
        const selected = await open({
            multiple:false,
        });
        console.log("selected the file",selected)
        if(selected) {
            let ex = await exists(selected, {baseDir: BaseDirectory.AppData});
            console.log(ex)
            const configToml = await readTextFile(selected)
            console.log("xml file is",configToml)
            const filename = selected.substring(selected.lastIndexOf('/')+1)
            let file = FileInfo.cloneWith({
                filePath: selected,
                fileName: filename,
                fileType: 'mdxml'
            })
            site.get('files').clear()
            site.get('files').push(file)
        }
    }
    const doPreview = async () => {
        console.log("file is", site.get('selectedFile'))
    }
    return <DialogContext.Provider value={new DialogContextImpl()}>
        <PopupContext.Provider value={new PopupContextImpl()}>
            <div className={'main-layout'}>
                <header>{site.get('title').get()}
                    <button onClick={doOpen}>open</button>
                    <button onClick={doPreview}>preview</button>
                </header>
                <FileListView className={'file-list'} site={site}/>
                <div className={'page-list'}>the page tree</div>
                <PageEditorWrapper site={site}/>
            </div>
        </PopupContext.Provider>
    </DialogContext.Provider>

}
