import { Node } from "prosemirror-model";
import {Docset, DocsetModel, FileInfoModel, FileType, PageModel, PageType} from "./model";
import {StorageSystem} from "./storage";
import { open } from '@tauri-apps/plugin-dialog';
import {exists, BaseDirectory, readTextFile, readDir, writeTextFile} from '@tauri-apps/plugin-fs';
import {defaultMarkdownParser, defaultMarkdownSerializer} from "prosemirror-markdown";

export async function xmlToDocset(filepath:string, xml: Document):Promise<Docset> {
    console.log('converting xml to a docset',xml);
    console.log("filepath is",filepath)
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
        const title = child.attributes.getNamedItem('title')?.textContent
        const relative_filepath = child.attributes.getNamedItem('src')?.textContent
        console.log("title",title)
        console.log("relative filepath",relative_filepath)
        const final_filepath = filepath + '/' + relative_filepath
        console.log("final filepath",final_filepath)
        console.log("exists?", await exists(final_filepath))
        const content = await readTextFile(final_filepath)
        console.log("page content is",content)
        const page = PageModel.cloneWith({
            title:title,
            file:{
                fileName:relative_filepath,
                filePath:final_filepath,
                fileType: "other",
            }
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


export class TauriStorage implements StorageSystem {
    async selectDocset(): Promise<Docset | undefined> {
        const selected = await open({
            multiple:false,
            directory:true,
            recursive:true,
            canCreateDirectories:true,
            title:"Select Docset",
        });
        console.log("selected the file",selected)
        if(selected) {
            let ex = await exists(selected, {baseDir: BaseDirectory.AppData});
            console.log('exists',ex)
            const dirlist = await readDir(selected);
            console.log(dirlist)
            const rawData = await readTextFile(selected + "/docset.xml")
            // console.log("raw xml file is",rawData)
            const xml_doc = new DOMParser().parseFromString(rawData, "text/xml")
            // console.log("parsed xml doc is", xml_doc)
            const docset:Docset = await xmlToDocset(selected,xml_doc)
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
    async loadPageDoc(page: PageType): Promise<Node> {
        console.log("loading content for",page.get('title').get(), page.get('file').get('filePath').get())
        const pth = page.get('file').get('filePath').get()
        console.log("exists?", await exists(pth))
        const content = await readTextFile(pth)
        console.log("content is",content)
        const startdoc = defaultMarkdownParser.parse(content)
        console.log("parsed",startdoc)
        return startdoc
    }
    async savePageDoc(page: PageType, doc: Node): Promise<void> {
        console.log("saving page doc",page, 'with content',doc)
        const raw_markdown = defaultMarkdownSerializer.serialize(doc)
        console.log(raw_markdown)
        const pth = page.get('file').get('filePath').get()
        console.log("exists?", await exists(pth))
        await writeTextFile(pth,raw_markdown)
        console.log("wrote to file")
        return Promise.resolve()
    }

}
