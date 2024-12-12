import xmlFormat from 'xml-formatter';
import {Node} from "prosemirror-model";
import {Docset, DocsetModel, PageModel, PageType} from "./model";
import {StorageSystem} from "./storage";
import {open} from '@tauri-apps/plugin-dialog';
import {exists, readFile, readTextFile, writeTextFile, open as openFile} from '@tauri-apps/plugin-fs';
import {defaultMarkdownParser, defaultMarkdownSerializer} from "prosemirror-markdown";
import {resolve, documentDir} from "@tauri-apps/api/path";

export async function xmlToDocset(basedir:string, xml: Document):Promise<Docset> {
    const root = xml.getRootNode().firstChild as Element
    const docset = DocsetModel.cloneWith({
        title: root.attributes.getNamedItem('title')?.textContent,
        basedir: basedir,
    })
    for(const child of root.children) {
        const title = child.attributes.getNamedItem('title')?.textContent || "missing title"
        const relative_filepath = child.attributes.getNamedItem('src')?.textContent
        const final_filepath = basedir + '/' + relative_filepath
        const page = PageModel.cloneWith({
            title:title,
            file:{
                fileName:relative_filepath,
                filePath:final_filepath,
                fileType: "other",
            },
            created:true
        })
        docset.get('pages').push(page);
    }
    return docset
}


function docsetToRawXML(docset: Docset) {
    const doc = document.implementation.createDocument(null,'docset',null)
    const doc_elem = doc.documentElement
    doc_elem.setAttribute('title',docset.get('title').get())
    docset.get('pages').forEach((pg:PageType) => {
        const page_elem = doc.createElement('page')
        page_elem.setAttribute('src',pg.get('file').get('fileName').get())
        page_elem.setAttribute('title',pg.get('title').get())
        doc_elem.append(page_elem)
    })
    return xmlFormat(new XMLSerializer().serializeToString(doc))
}

export class TauriStorage implements StorageSystem {
    async selectDocset(): Promise<Docset | undefined> {
        const selected = await open({
            multiple:false,
            directory:true,
            recursive:true,
            canCreateDirectories:true,
            // defaultPath: await documentDir(),
            title:"Select Docset",
        });
        console.log("selected",selected)
        if(selected) {
            const docset_path = selected+"/docset.xml"
            console.log("reading",docset_path)
            console.log("exists",await exists(docset_path))
            const resolved = await resolve(docset_path)
            console.log("resolved",resolved)


            const file = await openFile(resolved, {
                read: true,
            });
            const buf = new Uint8Array();
            await file.read(buf);
            console.log("buf len",buf.length)
            const textContents = new TextDecoder().decode(buf);
            await file.close();
            console.log("text contents",textContents)

            const rawData = await readTextFile(resolved)
            console.log("rawData",rawData.length, rawData)
            const xml_doc = new DOMParser().parseFromString(rawData, "text/xml")
            return await xmlToDocset(selected, xml_doc)
        }
        throw new Error("not really doing anything yet")
    }
    createNewDocset(opts: { title: string; }): Promise<Docset> {
        throw new Error("Method not implemented.");
    }
    addNewPage(docset: Docset): Promise<PageType> {
        const page = PageModel.cloneWith({
            file:{
                fileName:"newpage.md",
                filePath:docset.get('basedir').get()+"/newpage.md",
                fileType:"other",
            }
        })
        docset.get('pages').push(page);
        return Promise.resolve(page)
    }
    async saveAll(docset: Docset): Promise<void> {
        const raw_str =  docsetToRawXML(docset)
        const pth = docset.get('basedir')+'/docset.xml'
        await writeTextFile(pth,raw_str)
        return Promise.resolve()
    }
    async loadPageDoc(page: PageType): Promise<Node> {
        if (page.get('created').get() === false) {
            console.log("not created on disk yet")
            const new_page_content = "# new page\n\nsome content to edit"
            const startdoc = defaultMarkdownParser.parse(new_page_content)
            return Promise.resolve(startdoc)
        }
        const pth = page.get('file').get('filePath').get()
        const content = await readTextFile(pth)
        return defaultMarkdownParser.parse(content)
    }
    async savePageDoc(page: PageType, doc: Node): Promise<void> {
        const raw_markdown = defaultMarkdownSerializer.serialize(doc)
        const pth = page.get('file').get('filePath').get()
        await writeTextFile(pth,raw_markdown)
        page.get('created').set(true)
        return Promise.resolve()
    }

}
