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
    title:S.string(),
    file:FileInfoModel,
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
    pages:PageListModel,
    // files:S.list(FileInfoModel),
    resources:S.list(ResourceModel),
    selectedPage:PageListModel,
},{
    typeName:"Docset",
})
export type Docset = typeof DocsetModel


// export const PageInfo = S.map({
//     fileName: S.string(),
//     title: S.string(),
// })

// export const Site = S.map({
//     files: S.list(FileInfo),
//     pages: S.list(PageInfo),
//     title: S.string("Trunk Docs"),
//     docsetFile: S.string(),
//     selectedFile: FileInfo
// })
