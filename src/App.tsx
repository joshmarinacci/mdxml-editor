import './App.css'
import {DialogContext, DialogContextImpl, PopupContext, PopupContextImpl,} from 'josh_react_util'

import "./mainlayout.css"
import 'rtds-react/build/index.esm.css'
import {FileListView} from "./FileListView.js";
import {MarkdownEditorWrapper} from "./editortest";
import {Docset, GlobalState} from "./model";
import {Label, useChanged} from "rtds-react";
import {NonTauriStorageSystemStub, StorageManager} from "./storage";
import {TauriStorage} from "./tauristorage";
import {setup_menubar} from "./taurisetup";


let INLINE_MENUBAR = true
if ('__TAURI_INTERNALS__' in window) {
    console.log("running under Tauri")
    StorageManager.registerStorageSystem(new TauriStorage())
    setup_menubar().then(() => console.log("done with it"))
    INLINE_MENUBAR = false
} else {
    console.log("does not have internals")
    StorageManager.registerStorageSystem(new NonTauriStorageSystemStub())
}

// reload when on file changes when running under esbuild
new EventSource('/esbuild').addEventListener('change', () => location.reload())

export function App() {
    const select_docset = async () => {
        const maybe_docset = await StorageManager.getStorageSystem().selectDocset()
        if (maybe_docset) {
            GlobalState.set('docset',maybe_docset as Docset)
        }
    }
    const save_docset = async () => {
        await StorageManager.getStorageSystem().saveAll(GlobalState.get('docset'))
    }
    const make_new_docset = async () => {
        const docset = await StorageManager.getStorageSystem().createNewDocset({
            title: 'untitled docset',
        })
        GlobalState.set('docset',docset)
    }
    const make_new_page = async () => {
        await StorageManager.getStorageSystem().addNewPage(GlobalState.get('docset'))
    }
    useChanged(GlobalState)
    useChanged(GlobalState.get('docset'))

    return <DialogContext.Provider value={new DialogContextImpl()}>
        <PopupContext.Provider value={new PopupContextImpl()}>
            <div className={'main-layout'}>
                {INLINE_MENUBAR &&  <header>
                    <button onClick={make_new_docset}>New Docset</button>
                    <button onClick={make_new_page}>New Page</button>
                    <button onClick={select_docset}>open</button>
                    <button onClick={save_docset}>save docset</button>
                </header>}
                <div>
                    <div>
                        <Label value={GlobalState.get('docset').get('title')}/>
                    </div>
                    <FileListView className={'file-list'} docset={GlobalState.get('docset')}/>
                </div>
                <MarkdownEditorWrapper pages={GlobalState.get('docset').get('selectedPage')}/>
            </div>
        </PopupContext.Provider>
    </DialogContext.Provider>
}
