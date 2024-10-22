import {Schema} from "rtds-core";

const S = new Schema()
// @ts-ignore
export const FileType = S.enum(['mdxml','directory','image','other'],'other')
export const FileInfo = S.map({
    fileName: S.string(),
    fileType: FileType,
    content: S.string()
},{
    typeName:'FileInfo'
})

export const PageInfo = S.map({
    fileName: S.string(),
    title: S.string(),
})

export const Site = S.map({
    files: S.list(FileInfo),
    pages: S.list(PageInfo),
    title: S.string("Trunk Docs"),
    docsetFile: S.string(),
    selectedFile: FileInfo
})
