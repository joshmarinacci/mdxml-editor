import { Node } from "prosemirror-model";
import {Docset, DocsetModel, FileInfoModel, PageModel, PageType} from "./model";
import {StorageSystem} from "./storage";
import { open } from '@tauri-apps/plugin-dialog';
import { exists, BaseDirectory, readTextFile } from '@tauri-apps/plugin-fs';

export function xmlToDocset(xml: Document):Docset {
    console.log('converting xml to a docset',xml);
    // if (!xml.root) throw new Error("docset.xml missing root")
    // if (!xml.root.attributes) throw new Error("docset.xml missing attributes")
    const root = xml.getRootNode().firstChild as Element
    console.log("attrs are",root.attributes.getNamedItem('title'))
    const docset = DocsetModel.cloneWith({
        title: root.attributes.getNamedItem('title')?.textContent,
    })
    for(const child of root.children) {
        const page_node = child as Element
        console.log("child is",child)
        const page = PageModel.cloneWith({
            title:child.attributes.getNamedItem('title')?.textContent,
        })
        docset.get('pages').push(page);
    }
    // if (!xml.root.attributes['title']) throw new Error("docset.xml missing 'title' attribute")
    // return {
    //     title: xml.root?.attributes['title'],
    //     pages: xml.root?.children
    //         .filter(ch => ch instanceof XmlElement)
    //         .filter(ch => ch.name === 'page')
    //         .map(ch => xmlToPage(ch)),
    //     resources: xml.root?.children
    //         .filter(ch => ch instanceof XmlElement)
    //         .filter(ch => ch.name === 'resource')
    //         .map(ch => xmlToResource(ch))
    //
    // }
    return docset
}


class TauriStorage implements StorageSystem {
    async selectDocset(): Promise<Docset | undefined> {
        const selected = await open({
            multiple:false,
        });
        console.log("selected the file",selected)
        if(selected) {
            let ex = await exists(selected, {baseDir: BaseDirectory.AppData});
            console.log(ex)
            const rawData = await readTextFile(selected)
            // console.log("raw xml file is",rawData)
            const xml_doc = new DOMParser().parseFromString(rawData, "text/xml")
            // console.log("parsed xml doc is", xml_doc)
            const docset:Docset = xmlToDocset(xml_doc)
            return docset

            // const filename = selected.substring(selected.lastIndexOf('/')+1)
            // console.log(filename)
            // const xml = await loadXml(filename)
            // const docset = xmlToDocset(xml)

            // let file = FileInfoModel.cloneWith({
            //     filePath: selected,
            //     fileName: filename,
            //     fileType: 'docset'
            // })
            // site.get('files').clear()
            // site.get('files').push(file)
        }
        throw new Error("not really doing anything yet")
    }
    createNewDocset(opts: { title: string; }): Promise<Docset> {
        throw new Error("Method not implemented.");
    }
    addNewPage(docset: Docset): Promise<PageType> {
        throw new Error("Method not implemented.");
    }
    saveAll(docset: Docset): Promise<void> {
        throw new Error("Method not implemented.");
    }
    loadPageDoc(page: PageType): Promise<Node> {
        throw new Error("Method not implemented.");
    }

}



export class TauriStorageManager {
    static getStorageSystem():StorageSystem {
        return new TauriStorage();
    }
}
