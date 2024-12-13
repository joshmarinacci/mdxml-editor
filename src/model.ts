import {Schema} from "rtds-core";

const S = new Schema()

// @ts-ignore
export const FileType = S.enum(['mdxml','directory','image','other','docset'],'other')
export const FileInfoModel = S.map({
    fileName: S.string(),
    filePath: S.string(),
    fileType: FileType,
},{
    typeName:'FileInfo'
})
export type FileInfo = typeof FileInfoModel


export const PageModel = S.map({
    title:S.string("new page here"),
    file:FileInfoModel,
    created:S.boolean(false),
},{
    typeName:"Page"
})
export type PageType = typeof PageModel
export const ResourceModel = S.map({
    src:S.string(),
    title:S.string(),
}, {
    typeName:"Resource"
})
export const PageListModel = S.list(PageModel)

export const DocsetModel = S.map({
    title:S.string(),
    basedir:S.string(),
    pages:PageListModel,
    // files:S.list(FileInfoModel),
    resources:S.list(ResourceModel),
    selectedPage:PageListModel,
},{
    typeName:"Docset",
})
export type Docset = typeof DocsetModel


const GlobalStateModel = S.map({
    docset:DocsetModel,
})

export type GlobalStateType = typeof GlobalStateModel

export const GlobalState = GlobalStateModel.cloneWith({
    docset:{
        title:"Dummy Docset"
    }
})