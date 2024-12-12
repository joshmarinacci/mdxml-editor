import './App.css'
import {DialogContext, DialogContextImpl, PopupContext, PopupContextImpl,} from 'josh_react_util'

import "./mainlayout.css"
import 'rtds-react/build/index.esm.css'
import {FileListView} from "./FileListView.js";
import {MarkdownEditorWrapper} from "./editortest";
import {Docset, DocsetModel, PageModel} from "./model";
import {useState} from "react";
import {Label, useChanged} from "rtds-react";
import {NonTauriStorageSystemStub, StorageManager} from "./storage";
import {TauriStorage} from "./tauristorage";
import {menu, app} from "@tauri-apps/api"
import {exit} from "@tauri-apps/plugin-process"

import {Menu, MenuItem, Submenu} from "@tauri-apps/api/menu";

const DummyDocset = DocsetModel.cloneWith({
    title: "dummyDocset",
})


async function  setup_menubar() {
    const appMenu = await Submenu.new({
        text:'The App',
        items:[
            await MenuItem.new({
                text:"Hide MDXML Editor",
                accelerator:"Cmd+H",
                action: async () => {
                    await app.hide()
                }
            }),
            await MenuItem.new({
                text:"Quit",
                accelerator: "Cmd+Q",
                action: async (id) => {
                    await exit()
                }
            })
        ]
    })
    const fileMenu = await Submenu.new({
        text:'File',
        items:[
            await MenuItem.new({
                text:"New Docset"
            }),
            await MenuItem.new({
                text:"New Page",
                accelerator:"Cmd+N",
            }),
            await MenuItem.new({
                text:"Open Docset",
                accelerator:"Cmd+O",
            })
        ]
    })
    const menu = await Menu.new({
        items:[appMenu,fileMenu]
    })
    await menu.setAsAppMenu()
}
if ('__TAURI_INTERNALS__' in window) {
    console.log("running under Tauri, right?")
    StorageManager.registerStorageSystem(new TauriStorage())
    setup_menubar().then(() => console.log("done with it"))
} else {
    console.log("does not have internals")
    StorageManager.registerStorageSystem(new NonTauriStorageSystemStub())
}


new EventSource('/esbuild').addEventListener('change', () => location.reload())

export function App() {
    const [docset, setDocset] = useState<typeof DocsetModel>(DummyDocset)
    const select_docset = async () => {
        const maybe_docset = await StorageManager.getStorageSystem().selectDocset()
        if (maybe_docset) {
            let docset = maybe_docset as Docset
            console.log("new docset is", docset)
            setDocset(docset)
        }
    }
    const save_docset = async () => {
        await StorageManager.getStorageSystem().saveAll(docset)
    }
    const make_new_docset = async () => {
        const docset = await StorageManager.getStorageSystem().createNewDocset({
            title: 'untitled docset',
        })
        setDocset(docset)
    }
    const make_new_page = async () => {
        await StorageManager.getStorageSystem().addNewPage(docset)
    }
    useChanged(docset)
    // const doOpen = async () => {
    //     const selected = await open({
    //         multiple:false,
    //     });
    //     console.log("selected the file",selected)
    //     if(selected) {
    //         let ex = await exists(selected, {baseDir: BaseDirectory.AppData});
    //         console.log(ex)
    //         const configToml = await readTextFile(selected)
    //         console.log("xml file is",configToml)
    //         const filename = selected.substring(selected.lastIndexOf('/')+1)
    //         let file = FileInfo.cloneWith({
    //             filePath: selected,
    //             fileName: filename,
    //             fileType: 'mdxml'
    //         })
    //         site.get('files').clear()
    //         site.get('files').push(file)
    //     }
    // }
    // const doPreview = async () => {
    //     console.log("file is", site.get('selectedFile').get('filePath').get())
    //     const path = site.get('selectedFile').get('filePath').get()
    //     let result = await Command.create("npm-run", [
    //         'run',
    //         'automated',
    //         "--",
    //         `--infile=${path}`,
    //         "--browser",
    //     ],{
    //         cwd:"/Users/josh/WebstormProjects/mdxml-tools"
    //     }).execute()
    //     console.log(result)
    //     console.log(result.stdout)
    // }
    console.log("list of pages", docset.get('pages').count())
    return <DialogContext.Provider value={new DialogContextImpl()}>
        <PopupContext.Provider value={new PopupContextImpl()}>
            <div className={'main-layout'}>
                <header>
                    <button onClick={make_new_docset}>New Docset</button>
                    <button onClick={make_new_page}>New Page</button>
                    <button onClick={select_docset}>open</button>
                    <button onClick={save_docset}>save docset</button>
                    {/*<button onClick={doPreview}>preview</button>*/}
                </header>
                <div>
                    <div>
                        <Label value={docset.get('title')}/>
                    </div>
                    <FileListView className={'file-list'} docset={docset}/>
                </div>
                <MarkdownEditorWrapper pages={docset.get('selectedPage')}/>
            </div>
        </PopupContext.Provider>
    </DialogContext.Provider>
}
