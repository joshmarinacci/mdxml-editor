import {Menu, MenuItem, Submenu} from "@tauri-apps/api/menu";
import {app} from "@tauri-apps/api";
import {exit} from "@tauri-apps/plugin-process";
import {StorageManager} from "./storage";
import {Docset, GlobalState} from "./model";
import {Command} from "@tauri-apps/plugin-shell";

const doPreview = async () => {
    const basedir = GlobalState.get('docset').get('basedir').get()
    const path = basedir + '/' + 'docset.xml'
    let result = await Command.create("npm-run", [
        'run',
        'automated',
        "--",
        `--infile=${path}`,
        '--docset',
        "--browser",
    ],{
        cwd:"/Users/josh/WebstormProjects/mdxml-tools"
    }).execute()
    console.log(result)
    console.log(result.stdout)
}

export async function setup_menubar() {
    const appMenu = await Submenu.new({
        text: 'The App',
        items: [
            await MenuItem.new({
                text: "Hide MDXML Editor",
                accelerator: "Cmd+H",
                action: async () => {
                    await app.hide()
                }
            }),
            await MenuItem.new({
                text: "Quit",
                accelerator: "Cmd+Q",
                action: async (id) => {
                    await exit()
                }
            })
        ]
    })
    const fileMenu = await Submenu.new({
        text: 'File',
        items: [
            await MenuItem.new({
                text: "New Docset",
                action: async () => {
                    const docset = await StorageManager.getStorageSystem().createNewDocset({
                        title: 'untitled docset',
                    })
                    GlobalState.set('docset',docset)
                }
            }),
            await MenuItem.new({
                text: "New Page",
                accelerator: "Cmd+N",
                action: async () => {
                    await StorageManager.getStorageSystem().addNewPage(GlobalState.get('docset'))
                }
            }),
            await MenuItem.new({
                text: "Open Docset",
                accelerator: "Cmd+O",
                action: async () => {
                    const maybe_docset = await StorageManager.getStorageSystem().selectDocset()
                    if(maybe_docset) {
                        GlobalState.set('docset',maybe_docset as Docset)
                    }
                }
            }),
            await MenuItem.new({
                text:'Preview',
                accelerator: "Cmd+P",
                action: async () => {
                    await doPreview()
                }
            })
        ]
    })
    const menu = await Menu.new({
        items: [appMenu, fileMenu]
    })
    await menu.setAsAppMenu()
}