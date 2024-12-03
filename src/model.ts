import {Schema} from "rtds-core";

const S = new Schema()
export const PageModel = S.map({
    src:S.string(),
    title:S.string(),
},{
    typeName:"Page"
})
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
    resources:S.list(ResourceModel),
    selectedPage:PageListModel,
},{
    typeName:"Docset",
})

// @ts-ignore
// export const FileType = S.enum(['mdxml','directory','image','other'],'other')
// export const FileInfo = S.map({
//     fileName: S.string(),
//     filePath: S.string(),
//     fileType: FileType,
// },{
//     typeName:'FileInfo'
// })
//
// export const PageInfo = S.map({
//     fileName: S.string(),
//     title: S.string(),
// })
//
// export const Site = S.map({
//     files: S.list(FileInfo),
//     pages: S.list(PageInfo),
//     title: S.string("Trunk Docs"),
//     docsetFile: S.string(),
//     selectedFile: FileInfo
// })
