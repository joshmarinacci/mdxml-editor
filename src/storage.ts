//- [ ] Load through storage manager
// - [ ] Two impls for Tauri and pure web through local webserver


import {Docset, DocsetModel, PageModel, PageType} from "./model";
import {Node, Schema, NodeSpec} from "prosemirror-model"
import {defaultMarkdownParser} from "prosemirror-markdown";


export interface StorageSystem {
    selectDocset(): Promise<Docset | undefined>;
    createNewDocset(opts: { title: string }): Promise<Docset>;
    addNewPage(docset: Docset):Promise<PageType>;
    saveAll(docset: Docset):Promise<void>;
    loadPageDoc(page: PageType): Promise<Node>;
}

class NonTauriStorageSystemStub implements StorageSystem {
    private docset: Docset
    private page_to_content: Map<string, string>;
    constructor() {
        this.page_to_content = new Map<string,string>()
        this.docset = DocsetModel.cloneWith({
            title:'Simple Test Docset',
        })

        const page1 = PageModel.cloneWith({
            title:"title of page"
        })
        const page1_markdown_content = `\n\n# page 1\n\ncontent for page 1`
        this.page_to_content.set(page1.id(), page1_markdown_content)
        this.docset.get('pages').push(page1)

        const page2 = PageModel.cloneWith({
            title:"second page"
        })
        const page2_markdown_content = `# page 2\n\ncontent for page 2`
        this.page_to_content.set(page2.id(), page2_markdown_content)
        this.docset.get('pages').push(page2)
    }

    loadPageDoc(page: PageType): Promise<Node> {
        console.log("getting content for page",page)
        const content = this.page_to_content.get(page.id())
        if(content) {
            console.log("parsing content",content)
            const startdoc = defaultMarkdownParser.parse(content)
            console.log("parsed",startdoc)
            return Promise.resolve(startdoc)
        } else {
            const startdoc = defaultMarkdownParser.parse("could not parse content")
            return Promise.resolve(startdoc)
        }

    }
    selectDocset(): Promise<Docset | undefined> {
        return Promise.resolve(this.docset)
    }
    createNewDocset(opts: { title: string; }): Promise<Docset> {
        const docset = DocsetModel.cloneWith({
            title:"untitled docset",
        })
        return Promise.resolve(docset)
    }
    addNewPage(docset: Docset): Promise<PageType> {
        const page = PageModel.cloneWith({
            title:'new page',
        })
        docset.get('pages').push(page)
        return Promise.resolve(page)
    }
    saveAll(docset: Docset): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

const stub = new NonTauriStorageSystemStub()

export class StorageManager {
    static getStorageSystem():StorageSystem {
        return stub
    }
}


