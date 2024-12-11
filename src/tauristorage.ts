import xmlFormat from 'xml-formatter';
import {Node} from "prosemirror-model";
import {Docset, DocsetModel, PageModel, PageType} from "./model";
import {StorageSystem} from "./storage";
import {open} from '@tauri-apps/plugin-dialog';
import {BaseDirectory, exists, readDir, readTextFile, writeTextFile} from '@tauri-apps/plugin-fs';
import {defaultMarkdownParser, defaultMarkdownSerializer} from "prosemirror-markdown";

export async function xmlToDocset(basedir:string, xml: Document):Promise<Docset> {
    console.log('converting xml to a docset',xml);
    console.log("filepath is",basedir)
    // if (!xml.root) throw new Error("docset.xml missing root")
    // if (!xml.root.attributes) throw new Error("docset.xml missing attributes")
    const root = xml.getRootNode().firstChild as Element
    console.log("attrs are",root.attributes.getNamedItem('title'))
    const docset = DocsetModel.cloneWith({
        title: root.attributes.getNamedItem('title')?.textContent,
        basedir: basedir,
    })
    for(const child of root.children) {
        const page_node = child as Element
        // console.log("child is",child)
        const title = child.attributes.getNamedItem('title')?.textContent
        const relative_filepath = child.attributes.getNamedItem('src')?.textContent
        // console.log("title",title)
        // console.log("relative filepath",relative_filepath)
        const final_filepath = basedir + '/' + relative_filepath
        // console.log("final filepath",final_filepath)
        // console.log("exists?", await exists(final_filepath))
        // const content = await readTextFile(final_filepath)
        // console.log("page content is",content)
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
            title:"Select Docset",
        });
        console.log("selected the directory",selected)
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
        console.log("saving the docset",docset)
        const raw_str =  docsetToRawXML(docset)
        console.log('raw str is',raw_str)
        const pth = docset.get('basedir')+'/docset.xml'
        console.log('saving docset to',pth)
        await writeTextFile(pth,raw_str)
        return Promise.resolve()
    }
    async loadPageDoc(page: PageType): Promise<Node> {
        if (page.get('created').get() === false) {
            console.log("not created on disk yet")
            const new_page_content = "# new page\n\nsome content to edit"
            const startdoc = defaultMarkdownParser.parse(new_page_content)
            console.log("parsed",startdoc)
            return Promise.resolve(startdoc)
        }
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
        page.get('created').set(true)
        console.log("wrote to file")
        return Promise.resolve()
    }

}
